/**
 * gpt.provider.ts
 * OpenAI GPT → IProviderAdapter
 */
import {
  IProviderAdapter, ProviderName, ProviderTier,
  ProviderRequest, ProviderResponse, ProviderHealth,
} from './provider.interface';

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

export class GPTProvider implements IProviderAdapter {
  readonly name: ProviderName = 'gpt';
  readonly tier: ProviderTier = 'premium';
  readonly priority = 2; // segunda escolha junto com Kimi (após Claude)

  readonly model: string;
  private readonly apiKey: string;
  private readonly maxTokens: number;
  private readonly temperature: number;
  private readonly orgId?: string;

  constructor(options?: {
    apiKey?: string;
    model?: string;
    maxTokens?: number;
    temperature?: number;
    orgId?: string;
  }) {
    this.apiKey      = options?.apiKey      ?? process.env.OPENAI_API_KEY  ?? '';
    this.model       = options?.model       ?? 'gpt-4o-mini';
    this.maxTokens   = options?.maxTokens   ?? 4096;
    this.temperature = options?.temperature ?? 0.7;
    this.orgId       = options?.orgId       ?? process.env.OPENAI_ORG_ID;
  }

  isConfigured(): boolean { return !!this.apiKey; }

  async sendMessage(request: ProviderRequest): Promise<ProviderResponse> {
    const start = Date.now();

    const systemPrompt =
      request.systemPrompt ??
      request.messages.find(m => m.role === 'system')?.content ??
      'You are ORUS SAGE, an intelligent AI assistant.';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
    };
    if (this.orgId) headers['OpenAI-Organization'] = this.orgId;

    const body = {
      model: this.model,
      max_tokens: request.maxTokens ?? this.maxTokens,
      temperature: request.temperature ?? this.temperature,
      messages: [
        { role: 'system', content: systemPrompt },
        ...request.messages.filter(m => m.role !== 'system'),
      ],
    };

    const res = await fetch(OPENAI_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const rawText = await res.text();
    if (!res.ok) {
      const errData = JSON.parse(rawText);
      throw new Error(`GPT HTTP ${res.status}: ${errData?.error?.message ?? rawText.slice(0, 200)}`);
    }

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
