/**
 * provider.registry.ts
 * 
 * Registro central de todos os providers de LLM.
 * Responsabilidades:
 *  - Registrar e inicializar providers
 *  - Selecionar o melhor provider conforme o modo (QUICK/DEEP) e disponibilidade
 *  - Executar fallback automático em caso de falha
 *  - Cache de health checks para não sobrecarregar as APIs
 *  - Estratégias de seleção plugáveis
 */

import {
  IProviderAdapter,
  ProviderName,
  ProviderRequest,
  ProviderResponse,
  ProviderHealth,
  ProviderStatus,
} from './provider.interface';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SelectionMode =
  | 'QUICK'   // prioriza velocidade (Groq, GLM)
  | 'DEEP'    // prioriza qualidade (Claude, GPT, DeepSeek)
  | 'CHEAP'   // prioriza custo (GLM, Groq)
  | 'AUTO';   // deixa o registry decidir

export interface RegistryOptions {
  /** Intervalo mínimo em ms entre health checks por provider (default: 60s) */
  healthCheckTtlMs?: number;
  /** Número máximo de tentativas de fallback (default: 3) */
  maxFallbackAttempts?: number;
  /** Se true, loga todos os eventos de seleção/fallback */
  verbose?: boolean;
}

export interface DispatchResult extends ProviderResponse {
  attempts: number;
  fallbackChain: ProviderName[];
}

interface HealthCache {
  result: ProviderHealth;
  cachedAt: number;
}

// ─── Priority overrides por modo ─────────────────────────────────────────────

const MODE_PRIORITY: Record<SelectionMode, Partial<Record<ProviderName, number>>> = {
  QUICK: { groq: 1, glm: 2, deepseek: 3, kimi: 4, gpt: 5, claude: 6 },
  DEEP:  { claude: 1, gpt: 2, deepseek: 3, kimi: 4, groq: 5, glm: 6 },
  CHEAP: { glm: 1, groq: 2, deepseek: 3, kimi: 4, gpt: 5, claude: 6 },
  AUTO:  {}, // usa priority padrão de cada adapter
};

// ─── Registry ─────────────────────────────────────────────────────────────────

export class ProviderRegistry {
  private readonly providers: Map<ProviderName, IProviderAdapter> = new Map();
  private readonly healthCache: Map<ProviderName, HealthCache>    = new Map();
  private readonly opts: Required<RegistryOptions>;

  constructor(options: RegistryOptions = {}) {
    this.opts = {
      healthCheckTtlMs:    options.healthCheckTtlMs    ?? 60_000,
      maxFallbackAttempts: options.maxFallbackAttempts ?? 3,
      verbose:             options.verbose             ?? false,
    };
  }

  // ── Registration ────────────────────────────────────────────────────────────

  register(adapter: IProviderAdapter): this {
    if (!adapter.isConfigured()) {
      this.log(`⚠️  ${adapter.name} não configurado (sem API key) — ignorado`);
      return this;
    }
    this.providers.set(adapter.name, adapter);
    this.log(`✅ Registrado: ${adapter.name} [${adapter.tier}] modelo=${adapter.model} priority=${adapter.priority}`);
    return this;
  }

  /** Registra múltiplos de uma vez */
  registerAll(adapters: IProviderAdapter[]): this {
    adapters.forEach(a => this.register(a));
    return this;
  }

  /** Lista providers disponíveis */
  list(): IProviderAdapter[] {
    return Array.from(this.providers.values());
  }

  has(name: ProviderName): boolean {
    return this.providers.has(name);
  }

  get(name: ProviderName): IProviderAdapter | undefined {
    return this.providers.get(name);
  }

  // ── Dispatch ────────────────────────────────────────────────────────────────

  /**
   * Envia uma mensagem ao melhor provider disponível.
   * Faz fallback automático em caso de falha.
   */
  async dispatch(
    request: ProviderRequest,
    mode: SelectionMode = 'AUTO',
    preferredProvider?: ProviderName
  ): Promise<DispatchResult> {
    const chain = this.buildFallbackChain(mode, preferredProvider);

    if (chain.length === 0) {
      throw new Error('ProviderRegistry: nenhum provider configurado e disponível');
    }

    let lastError: Error | null = null;
    const attempted: ProviderName[] = [];

    for (const name of chain.slice(0, this.opts.maxFallbackAttempts)) {
      const adapter = this.providers.get(name)!;

      // Verifica health (com cache)
      const health = await this.getCachedHealth(adapter);
      if (health.status === 'unavailable') {
        this.log(`⏭️  ${name} indisponível — pulando`);
        continue;
      }

      attempted.push(name);
      this.log(`🚀 Tentando ${name} (modo=${mode})`);

      try {
        const response = await adapter.sendMessage(request);
        this.log(`✅ ${name} respondeu em ${response.latencyMs}ms`);

        // Marca como saudável no cache após sucesso
        this.setHealthCache(name, { status: 'healthy', latencyMs: response.latencyMs, provider: name, checkedAt: new Date() });

        return {
          ...response,
          attempts: attempted.length,
          fallbackChain: attempted,
        };
      } catch (err: any) {
        lastError = err;
        this.log(`❌ ${name} falhou: ${err.message} — tentando próximo`);

        // Marca como degradado no cache
        this.setHealthCache(name, {
          status: 'degraded',
          latencyMs: 0,
          provider: name,
          checkedAt: new Date(),
          errorMessage: err.message,
        });
      }
    }

    throw new Error(
      `ProviderRegistry: todos os providers falharam. Último erro: ${lastError?.message}. Chain: ${attempted.join(' → ')}`
    );
  }

  // ── Health ───────────────────────────────────────────────────────────────────

  /** Executa health check em todos os providers registrados */
  async checkAllHealth(): Promise<Record<ProviderName, ProviderHealth>> {
    const results: Partial<Record<ProviderName, ProviderHealth>> = {};

    await Promise.all(
      Array.from(this.providers.entries()).map(async ([name, adapter]) => {
        const health = await adapter.checkHealth();
        this.setHealthCache(name, health);
        results[name] = health;
        this.log(`🏥 ${name}: ${health.status} (${health.latencyMs}ms)`);
      })
    );

    return results as Record<ProviderName, ProviderHealth>;
  }

  /** Health summary — útil para endpoint /health */
  async getHealthSummary(): Promise<{
    overall: ProviderStatus;
    providers: Record<string, ProviderHealth>;
    availableCount: number;
    totalCount: number;
  }> {
    const healths = await this.checkAllHealth();
    const values = Object.values(healths);
    const available = values.filter(h => h.status === 'healthy').length;

    const overall: ProviderStatus =
      available === 0 ? 'unavailable' :
      available < values.length ? 'degraded' : 'healthy';

    return {
      overall,
      providers: healths as any,
      availableCount: available,
      totalCount: values.length,
    };
  }

  // ── Internal ─────────────────────────────────────────────────────────────────

  /**
   * Constrói a chain de fallback ordenada pelo modo atual.
   * Se preferredProvider for fornecido, ele vai na frente.
   */
  private buildFallbackChain(mode: SelectionMode, preferred?: ProviderName): ProviderName[] {
    const modeOverrides = MODE_PRIORITY[mode];

    const sorted = Array.from(this.providers.values()).sort((a, b) => {
      const pa = modeOverrides[a.name] ?? a.priority;
      const pb = modeOverrides[b.name] ?? b.priority;
      return pa - pb;
    });

    const names = sorted.map(a => a.name);

    if (preferred && names.includes(preferred)) {
      return [preferred, ...names.filter(n => n !== preferred)];
    }

    return names;
  }

  private async getCachedHealth(adapter: IProviderAdapter): Promise<ProviderHealth> {
    const cached = this.healthCache.get(adapter.name);
    const now = Date.now();

    if (cached && (now - cached.cachedAt) < this.opts.healthCheckTtlMs) {
      return cached.result;
    }

    // TTL expirou — assume healthy para não bloquear (verifica em background)
    // Exceto se o último status conhecido era 'unavailable'
    if (cached?.result.status === 'unavailable') {
      // Re-verifica de forma assíncrona e não bloqueia o dispatch
      adapter.checkHealth().then(h => this.setHealthCache(adapter.name, h)).catch(() => {});
      return cached.result; // retorna o último resultado enquanto re-verifica
    }

    return { provider: adapter.name, status: 'healthy', latencyMs: 0, checkedAt: new Date() };
  }

  private setHealthCache(name: ProviderName, result: ProviderHealth): void {
    this.healthCache.set(name, { result, cachedAt: Date.now() });
  }

  private log(msg: string): void {
    if (this.opts.verbose) {
      console.log(`[ProviderRegistry] ${msg}`);
    }
  }
}
