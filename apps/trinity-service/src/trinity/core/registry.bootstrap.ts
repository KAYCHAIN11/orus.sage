/**
 * registry.bootstrap.ts
 * 
 * Ponto de entrada único para criar e configurar o ProviderRegistry
 * com todos os adaptadores disponíveis.
 * 
 * Uso:
 *   import { createRegistry } from './registry.bootstrap';
 *   const registry = createRegistry();
 *   const response = await registry.dispatch(request, 'DEEP');
 */

import { ProviderRegistry, RegistryOptions } from './provider.registry';
import { ClaudeProvider }    from './claude.provider';
import { KimiProvider }      from './kimi.api.adapter';
import { GLMProvider }       from './glm.api.adapter';
import { GroqProvider }      from './groq.api.adapter';
import { GPTProvider }       from './gpt.provider';
import { DeepSeekProvider }  from './deepseek.provider';

// Re-exports convenientes
export { ProviderRegistry }  from './provider.registry';
export { ClaudeProvider }    from './claude.provider';
export { KimiProvider }      from './kimi.api.adapter';
export { GLMProvider }       from './glm.api.adapter';
export { GroqProvider }      from './groq.api.adapter';
export { GPTProvider }       from './gpt.provider';
export { DeepSeekProvider }  from './deepseek.provider';
export * from './provider.interface';
export type { SelectionMode, DispatchResult } from './provider.registry';

// ─── Singleton global (opcional) ─────────────────────────────────────────────

let _instance: ProviderRegistry | null = null;

/**
 * Cria (ou retorna o singleton) do ProviderRegistry com todos os providers.
 * Providers sem API key configurada são automaticamente ignorados.
 * 
 * @example
 * const registry = createRegistry({ verbose: true });
 * const res = await registry.dispatch({ messages: [...] }, 'DEEP');
 */
export function createRegistry(options: RegistryOptions & { singleton?: boolean } = {}): ProviderRegistry {
  if (options.singleton && _instance) return _instance;

  const registry = new ProviderRegistry({
    healthCheckTtlMs:    options.healthCheckTtlMs    ?? 60_000,
    maxFallbackAttempts: options.maxFallbackAttempts ?? 3,
    verbose:             options.verbose             ?? (process.env.NODE_ENV !== 'production'),
  });

  registry.registerAll([
    // Tier premium
    new ClaudeProvider(),
    new GPTProvider(),

    // Tier standard
    new KimiProvider(),
    new DeepSeekProvider(),

    // Tier free / fast
    new GroqProvider(),
    new GLMProvider(),
  ]);

  if (options.singleton) _instance = registry;
  return registry;
}

/**
 * Versão customizada — útil para testes ou configurações específicas
 * 
 * @example
 * const registry = createCustomRegistry({
 *   claude: { model: 'claude-opus-4-6' },
 *   gpt:    { model: 'gpt-4o' },
 * });
 */
export function createCustomRegistry(
  overrides: {
    claude?:   ConstructorParameters<typeof ClaudeProvider>[0];
    kimi?:     ConstructorParameters<typeof KimiProvider>[0];
    glm?:      ConstructorParameters<typeof GLMProvider>[0];
    groq?:     ConstructorParameters<typeof GroqProvider>[0];
    gpt?:      ConstructorParameters<typeof GPTProvider>[0];
    deepseek?: ConstructorParameters<typeof DeepSeekProvider>[0];
  } = {},
  options: RegistryOptions = {}
): ProviderRegistry {
  const registry = new ProviderRegistry(options);

  registry.registerAll([
    new ClaudeProvider(overrides.claude),
    new GPTProvider(overrides.gpt),
    new KimiProvider(overrides.kimi),
    new DeepSeekProvider(overrides.deepseek),
    new GroqProvider(overrides.groq),
    new GLMProvider(overrides.glm),
  ]);

  return registry;
}

/**
 * Helper de conveniência — despacha uma mensagem sem instanciar o registry manualmente
 */
export async function quickDispatch(
  userMessage: string,
  systemPrompt?: string,
  mode: import('./provider.registry').SelectionMode = 'AUTO'
): Promise<string> {
  const registry = createRegistry({ singleton: true });
  const result = await registry.dispatch({
    messages: [{ role: 'user', content: userMessage }],
    systemPrompt,
  }, mode);
  return result.content;
}
