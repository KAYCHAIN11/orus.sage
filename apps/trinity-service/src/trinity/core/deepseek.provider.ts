/**
 * deepseek.provider.ts
 * DeepSeek → IProviderAdapter
 * API compatível com OpenAI — base_url diferente
 */
import {
  IProviderAdapter, ProviderName, ProviderTier,
  ProviderRequest, ProviderResponse, ProviderHealth,
} from './provider.interface';

const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';

export class DeepSeekProvider implements IProviderAdapter {
  readonly name: ProviderName = 'deepseek';
  readonly tier: ProviderTier = 'standard';
  readonly priority = 3; // ótimo custo-benefício, terceira opção

  readonly model: string;
  private readonly apiKey: string;
  private readonly maxTokens: number;
  private readonly temperature: number;

  constructor(options?: {
    apiKey?: string;
    model?: string;
    maxTokens?: number;
    temperature?: number;
  }) {
    this.apiKey      = options?.apiKey      ?? process.env.DEEPSEEK_API_KEY ?? '';
    // deepseek-chat = DeepSeek-V3 | deepseek-reasoner = R1
    this.model       = options?.model       ?? 'deepseek-chat';
    this.maxTokens   = options?.maxTokens   ?? 4096;
    this.temperature = options?.temperature ?? 0.7;
  }

  isConfigured(): boolean { return !!this.apiKey; }

  async sendMessage(request: ProviderRequest): Promise<ProviderResponse> {
    const start = Date.now();

    const systemPrompt =
      request.systemPrompt ??
      request.messages.find(m => m.role === 'system')?.content ??
      'You are ORUS SAGE, an intelligent AI assistant.';

    const body = {
      model: this.model,
      max_tokens: request.maxTokens ?? this.maxTokens,
      temperature: request.temperature ?? this.temperature,
      messages: [
        { role: 'system', content: systemPrompt },
        ...request.messages.filter(m => m.role !== 'system'),
      ],
    };

    const res = await fetch(DEEPSEEK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    const rawText = await res.text();
    if (!res.ok) {
      const errData = JSON.parse(rawText).catch?.(() => ({}));
      throw new Error(`DeepSeek HTTP ${res.status}: ${rawText.slice(0, 200)}`);
    }

    const raw = JSON.parse(rawText);

    // DeepSeek R1 pode incluir <think>...</think> no content
    let content = raw.choices?.[0]?.message?.content ?? '';
    const reasoningContent = raw.choices?.[0]?.message?.reasoning_content;

    // Remove bloco <think> do content principal se existir
    content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

    return {
      content, provider: this.name, model: this.model,
      latencyMs: Date.now() - start,
      tokensUsed: raw.usage?.completion_tokens,
      finishReason: raw.choices?.[0]?.finish_reason ?? 'stop',
      raw: { ...raw, reasoning: reasoningContent }, // preserva o raciocínio separado
    };
  }

  async checkHealth(): Promise<ProviderHealth> {
    const start = Date.now();
    try {
      await this.sendMessage({ messages: [{ role: 'user', content: 'ping' }], maxTokens: 5 });
      return { provider: this.name, status: 'healthy', latencyMs: Date.now() - start, checkedAt: new Date() };
    } catch (err: any) {
      return { provider: this.name, status: 'unavailable', latencyMs: Date.now() - start, checkedAt: new Date(), errorMessage: err.message };
    }
  }
}
