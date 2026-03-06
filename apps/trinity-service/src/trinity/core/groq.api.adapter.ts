/**
 * groq.provider.ts
 * Groq (ultra-fast inference) → IProviderAdapter
 */
import {
  IProviderAdapter, ProviderName, ProviderTier,
  ProviderRequest, ProviderResponse, ProviderHealth,
} from './provider.interface';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

export class GroqProvider implements IProviderAdapter {
  readonly name: ProviderName = 'groq';
  readonly tier: ProviderTier = 'free';
  readonly priority = 4; // rápido e free — bom fallback para QUICK mode

  readonly model: string;
  private readonly apiKey: string;
  private readonly maxTokens: number;
  private readonly temperature: number;

  constructor(options?: { apiKey?: string; model?: string; maxTokens?: number; temperature?: number }) {
    this.apiKey      = options?.apiKey      ?? process.env.GROQ_API_KEY ?? '';
    this.model       = options?.model       ?? 'llama3-8b-8192';
    this.maxTokens   = options?.maxTokens   ?? 1024;
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

    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    const rawText = await res.text();
    if (!res.ok) throw new Error(`Groq HTTP ${res.status}: ${rawText.slice(0, 200)}`);

    const raw = JSON.parse(rawText);
    const content = raw.choices?.[0]?.message?.content ?? '';

    return {
      content, provider: this.name, model: this.model,
      latencyMs: Date.now() - start,
      tokensUsed: raw.usage?.completion_tokens,
      finishReason: raw.choices?.[0]?.finish_reason ?? 'stop',
      raw,
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
