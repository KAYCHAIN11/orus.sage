/**
 * provider.interface.ts
 * Contrato unificado para todos os adaptadores de LLM
 * Claude, Kimi, GLM, Groq, GPT, DeepSeek
 */

// ─── Core Types ───────────────────────────────────────────────────────────────

export type ProviderName =
  | 'claude'
  | 'kimi'
  | 'glm'
  | 'groq'
  | 'gpt'
  | 'deepseek';

export type ProviderTier = 'premium' | 'standard' | 'free';

export type ProviderStatus = 'healthy' | 'degraded' | 'unavailable' | 'unknown';

export interface ProviderMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ProviderRequest {
  messages: ProviderMessage[];
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
  /** Contexto extra livre (metadata do workspace, agentId, etc) */
  meta?: Record<string, any>;
}

export interface ProviderResponse {
  content: string;
  provider: ProviderName;
  model: string;
  latencyMs: number;
  tokensUsed?: number;
  finishReason?: 'stop' | 'length' | 'error' | string;
  raw?: any; // resposta bruta original, útil para debug
}

export interface ProviderHealth {
  provider: ProviderName;
  status: ProviderStatus;
  latencyMs: number;
  checkedAt: Date;
  errorMessage?: string;
}

// ─── Adapter Contract ─────────────────────────────────────────────────────────

export interface IProviderAdapter {
  /** Identificador único do provider */
  readonly name: ProviderName;
  /** Modelo padrão sendo usado */
  readonly model: string;
  /** Tier de custo/qualidade */
  readonly tier: ProviderTier;
  /** Prioridade de fallback (menor = maior prioridade) */
  readonly priority: number;

  /** Envia uma mensagem e retorna a resposta normalizada */
  sendMessage(request: ProviderRequest): Promise<ProviderResponse>;

  /** Verifica se o provider está disponível e saudável */
  checkHealth(): Promise<ProviderHealth>;

  /** Se o adapter possui API key configurada */
  isConfigured(): boolean;
}
