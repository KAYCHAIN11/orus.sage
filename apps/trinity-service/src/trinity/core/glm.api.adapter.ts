/**
 * glm.provider.ts
 * GLM (Zhipu AI / BigModel) → IProviderAdapter
 */
import * as https from 'https';
import {
  IProviderAdapter, ProviderName, ProviderTier,
  ProviderRequest, ProviderResponse, ProviderHealth,
} from './provider.interface';

export class GLMProvider implements IProviderAdapter {
  readonly name: ProviderName = 'glm';
  readonly tier: ProviderTier = 'free';
  readonly priority = 5; // fallback de último recurso (free tier)

  readonly model: string;
  private readonly apiKey: string;
  private readonly maxTokens: number;
  private readonly temperature: number;

  constructor(options?: { apiKey?: string; model?: string; maxTokens?: number; temperature?: number }) {
    this.apiKey      = options?.apiKey      ?? process.env.GLM_API_KEY  ?? '';
    this.model       = options?.model       ?? 'glm-4-flash';
    this.maxTokens   = options?.maxTokens   ?? 2048;
    this.temperature = options?.temperature ?? 0.7;
  }

  isConfigured(): boolean { return !!this.apiKey; }

  async sendMessage(request: ProviderRequest): Promise<ProviderResponse> {
    const start = Date.now();

    const systemPrompt =
      request.systemPrompt ??
      request.messages.find(m => m.role === 'system')?.content ??
      'You are ORUS SAGE, an intelligent AI assistant.';

    const body = JSON.stringify({
      model: this.model,
      max_tokens: request.maxTokens ?? this.maxTokens,
      temperature: request.temperature ?? this.temperature,
      messages: [
        { role: 'system', content: systemPrompt },
        ...request.messages.filter(m => m.role !== 'system'),
      ],
    });

    const raw = await this.call(body);
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
      const body = JSON.stringify({
        model: this.model, max_tokens: 5,
        messages: [{ role: 'user', content: 'ping' }],
      });
      await this.call(body);
      return { provider: this.name, status: 'healthy', latencyMs: Date.now() - start, checkedAt: new Date() };
    } catch (err: any) {
      return { provider: this.name, status: 'unavailable', latencyMs: Date.now() - start, checkedAt: new Date(), errorMessage: err.message };
    }
  }

  private call(body: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'open.bigmodel.cn',
        path: '/api/paas/v4/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Length': Buffer.byteLength(body),
        },
      }, (res) => {
        let data = '';
        res.on('data', c => (data += c));
        res.on('end', () => {
          try {
            const p = JSON.parse(data);
            if (p.error) reject(new Error(`GLM: ${p.error.message}`));
            else resolve(p);
          } catch (e) { reject(new Error(`GLM: parse error — ${data.slice(0, 200)}`)); }
        });
      });
      req.on('error', reject);
      req.write(body);
      req.end();
    });
  }
}
