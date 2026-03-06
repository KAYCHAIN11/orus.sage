/**
 * claude.provider.ts
 * Wrapper normalizado do ClaudeAPIAdapterImpl → IProviderAdapter
 */
import * as https from 'https';
import {
  IProviderAdapter,
  ProviderName,
  ProviderTier,
  ProviderRequest,
  ProviderResponse,
  ProviderHealth,
} from './provider.interface';

export class ClaudeProvider implements IProviderAdapter {
  readonly name: ProviderName = 'claude';
  readonly tier: ProviderTier = 'premium';
  readonly priority = 1; // primeira escolha quando disponível

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
    this.apiKey      = options?.apiKey      ?? process.env.ANTHROPIC_API_KEY ?? '';
    this.model       = options?.model       ?? 'claude-sonnet-4-5-20251001';
    this.maxTokens   = options?.maxTokens   ?? 4096;
    this.temperature = options?.temperature ?? 0.7;
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  async sendMessage(request: ProviderRequest): Promise<ProviderResponse> {
    const start = Date.now();

    // Separa system prompt das mensagens user/assistant
    const messages = request.messages.filter(m => m.role !== 'system');
    const systemPrompt =
      request.systemPrompt ??
      request.messages.find(m => m.role === 'system')?.content ??
      'You are ORUS SAGE, an intelligent symbiotic AI assistant.';

    const body = JSON.stringify({
      model: this.model,
      max_tokens: request.maxTokens ?? this.maxTokens,
      system: systemPrompt,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    });

    const raw = await this.call(body);
    const content = raw.content?.[0]?.text ?? raw.content?.text ?? '';

    return {
      content,
      provider: this.name,
      model: this.model,
      latencyMs: Date.now() - start,
      tokensUsed: raw.usage?.output_tokens,
      finishReason: raw.stop_reason ?? 'stop',
      raw,
    };
  }

  async checkHealth(): Promise<ProviderHealth> {
    const start = Date.now();
    try {
      const body = JSON.stringify({
        model: this.model,
        max_tokens: 5,
        messages: [{ role: 'user', content: 'ping' }],
      });
      await this.call(body);
      return {
        provider: this.name,
        status: 'healthy',
        latencyMs: Date.now() - start,
        checkedAt: new Date(),
      };
    } catch (err: any) {
      return {
        provider: this.name,
        status: 'unavailable',
        latencyMs: Date.now() - start,
        checkedAt: new Date(),
        errorMessage: err.message,
      };
    }
  }

  private call(body: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const req = https.request(
        {
          hostname: 'api.anthropic.com',
          path: '/v1/messages',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Length': Buffer.byteLength(body),
          },
        },
        (res) => {
          let data = '';
          res.on('data', (c) => (data += c));
          res.on('end', () => {
            try {
              const parsed = JSON.parse(data);
              if (parsed.error) reject(new Error(`Claude: ${parsed.error.message}`));
              else resolve(parsed);
            } catch (e) {
              reject(new Error(`Claude: parse error — ${data.slice(0, 200)}`));
            }
          });
        }
      );
      req.on('error', reject);
      req.write(body);
      req.end();
    });
  }
}
