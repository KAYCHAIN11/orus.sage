/**
 * api.gateway.routes.ts
 * 
 * Rotas do API Gateway que conectam o frontend e o trinity-service
 * ao ProviderRegistry.
 * 
 * Endpoints expostos:
 *  POST /api/chat              — chat principal (QUICK/DEEP)
 *  POST /api/trinity/cerebro/analyze  — análise de fontes (AnalysisEngine)
 *  POST /api/research/db-search       — busca em banco (DeepResearchEngine)
 *  POST /api/research/doc-search      — busca em documentos (DeepResearchEngine)
 *  GET  /api/providers/health         — health de todos providers
 *  GET  /api/providers/list           — lista providers disponíveis
 * 
 * Framework: compatível com Next.js App Router e Express.
 * Para Next.js, cada export vira um arquivo em /app/api/...
 * Para Express, use mountGatewayRoutes(app).
 */

import { createRegistry, ProviderRequest } from './registry.bootstrap';
import type { SelectionMode } from './provider.registry';

// ─── Instância singleton do registry ─────────────────────────────────────────

const registry = createRegistry({ singleton: true, verbose: true });

// ─── Tipos de request/response ───────────────────────────────────────────────

export interface ChatRequestBody {
  message: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  systemPrompt?: string;
  mode?: 'QUICK' | 'DEEP';
  provider?: string; // forçar um provider específico
  maxTokens?: number;
  documentContext?: string; // conteúdo de arquivos anexados
  workspaceId?: string;
  agentId?: string;
}

export interface ChatResponseBody {
  content: string;
  provider: string;
  model: string;
  latencyMs: number;
  tokensUsed?: number;
  fallbackChain: string[];
}

// ─── Handler: POST /api/chat ─────────────────────────────────────────────────

export async function handleChat(body: ChatRequestBody): Promise<ChatResponseBody> {
  const {
    message,
    history = [],
    systemPrompt,
    mode = 'QUICK',
    provider,
    maxTokens,
    documentContext,
    agentId,
  } = body;

  // Monta system prompt com contexto do workspace/agent
  let finalSystemPrompt = systemPrompt ?? 'You are ORUS SAGE, an intelligent symbiotic AI assistant.';
  if (agentId) {
    finalSystemPrompt += ` You are operating as agent: ${agentId}.`;
  }
  if (documentContext) {
    finalSystemPrompt += `\n\nContexto de documentos fornecidos pelo usuário:\n${documentContext}`;
  }

  const request: ProviderRequest = {
    messages: [
      ...history,
      { role: 'user', content: message },
    ],
    systemPrompt: finalSystemPrompt,
    maxTokens,
  };

  const selectionMode = mode === 'DEEP' ? 'DEEP' : 'QUICK';

  const result = await registry.dispatch(
    request,
    selectionMode as SelectionMode,
    provider as any
  );

  return {
    content:       result.content,
    provider:      result.provider,
    model:         result.model,
    latencyMs:     result.latencyMs,
    tokensUsed:    result.tokensUsed,
    fallbackChain: result.fallbackChain,
  };
}

// ─── Handler: POST /api/trinity/cerebro/analyze ──────────────────────────────

export interface CerebroAnalyzeBody {
  title: string;
  content: string;
  credibility?: number;
}

export async function handleCerebroAnalyze(body: CerebroAnalyzeBody): Promise<{ insights: any[] }> {
  const prompt = `
Você é um motor de análise de pesquisa. Analise a seguinte fonte e extraia insights estruturados.

Fonte: "${body.title}"
Credibilidade: ${body.credibility ?? 0.7}
Conteúdo:
${body.content.slice(0, 3000)}

Responda APENAS com JSON válido neste formato (sem markdown, sem explicações):
{
  "insights": [
    {
      "title": "título do insight",
      "description": "descrição detalhada",
      "topics": ["topico1", "topico2"],
      "metrics": {}
    }
  ]
}
`.trim();

  const result = await registry.dispatch({
    messages: [{ role: 'user', content: prompt }],
    systemPrompt: 'Você é um motor de análise especializado. Responda APENAS com JSON válido.',
    maxTokens: 1500,
  }, 'DEEP');

  try {
    const clean = result.content.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return { insights: [] };
  }
}

// ─── Handler: POST /api/research/db-search ───────────────────────────────────

export interface DBSearchBody {
  query: string;
  limit?: number;
}

export async function handleDBSearch(body: DBSearchBody): Promise<any[]> {
  // Stub — integra com seu banco de dados real aqui
  // Por ora retorna array vazio para não quebrar o DeepResearchEngine
  console.log(`[DB Search] query="${body.query}" limit=${body.limit ?? 10}`);
  return [];
}

// ─── Handler: POST /api/research/doc-search ──────────────────────────────────

export interface DocSearchBody {
  query: string;
  limit?: number;
}

export async function handleDocSearch(body: DocSearchBody): Promise<any[]> {
  // Stub — integra com seu sistema de documentos real aqui
  console.log(`[Doc Search] query="${body.query}" limit=${body.limit ?? 10}`);
  return [];
}

// ─── Handler: GET /api/providers/health ──────────────────────────────────────

export async function handleProvidersHealth() {
  return registry.getHealthSummary();
}

// ─── Handler: GET /api/providers/list ────────────────────────────────────────

export function handleProvidersList() {
  return {
    providers: registry.list().map(p => ({
      name:         p.name,
      model:        p.model,
      tier:         p.tier,
      priority:     p.priority,
      isConfigured: p.isConfigured(),
    })),
  };
}

// ─── Express mount helper ─────────────────────────────────────────────────────

/**
 * Monta todas as rotas em uma instância Express
 * 
 * @example
 * import express from 'express';
 * import { mountGatewayRoutes } from './api.gateway.routes';
 * const app = express();
 * app.use(express.json());
 * mountGatewayRoutes(app);
 */
export function mountGatewayRoutes(app: any): void {
  app.post('/api/chat', async (req: any, res: any) => {
    try {
      const result = await handleChat(req.body);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/trinity/cerebro/analyze', async (req: any, res: any) => {
    try {
      const result = await handleCerebroAnalyze(req.body);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/research/db-search', async (req: any, res: any) => {
    try {
      const result = await handleDBSearch(req.body);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/research/doc-search', async (req: any, res: any) => {
    try {
      const result = await handleDocSearch(req.body);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/providers/health', async (_req: any, res: any) => {
    try {
      const result = await handleProvidersHealth();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/providers/list', (_req: any, res: any) => {
    res.json(handleProvidersList());
  });
}

// ─── Next.js App Router helpers ──────────────────────────────────────────────

/**
 * Para usar com Next.js App Router, crie os arquivos:
 * 
 * app/api/chat/route.ts:
 *   import { handleChat } from '@/lib/api.gateway.routes';
 *   export async function POST(req: Request) {
 *     const body = await req.json();
 *     const result = await handleChat(body);
 *     return Response.json(result);
 *   }
 * 
 * app/api/providers/health/route.ts:
 *   import { handleProvidersHealth } from '@/lib/api.gateway.routes';
 *   export async function GET() {
 *     return Response.json(await handleProvidersHealth());
 *   }
 */
