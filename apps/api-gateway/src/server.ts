// apps/api-gateway/src/server.ts
import * as dotenv from 'dotenv';
dotenv.config();

import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';

// ── Adapters ──────────────────────────────────────────────────────────────────
import { ClaudeAPIAdapterImpl } from '../../trinity-service/src/trinity/core/claude.api.adapter';
import { GroqProvider }         from '../../trinity-service/src/trinity/core/groq.api.adapter';
import { GLMProvider }          from '../../trinity-service/src/trinity/core/glm.api.adapter';
import { KimiProvider }         from '../../trinity-service/src/trinity/core/kimi.api.adapter';
import { GPTProvider }          from '../../trinity-service/src/trinity/core/gpt.provider';
import { DeepSeekProvider }     from '../../trinity-service/src/trinity/core/deepseek.provider';

// ── Provider Registry ─────────────────────────────────────────────────────────
import { createRegistry } from '../../trinity-service/src/trinity/core/registry.bootstrap';

// ── Research Pipeline ─────────────────────────────────────────────────────────
import { DeepResearchEngine }  from '../../../libs/engines/research/deep.research.engine';
import { AnalysisEngine }      from '../../../libs/engines/research/analysis.engine';
import { BlueprintStructurer } from '../../../libs/engines/research/blueprint.structurer';
import { DocumentGenerator }   from '../../../libs/engines/research/document.generator';
import { TemplateManager }     from '../../../libs/engines/research/template.manager';
import { WebSearchAdapter }    from '../../../libs/engines/research/web.search.adapter';

// ── Omega Agents ──────────────────────────────────────────────────────────────
import { createQuickOmega }    from '../../omega-agents-service/src/agents/factory/agent.preset';
import { OmegaAgentType, AgentStatus } from '../../omega-agents-service/src/agents/core/omega.dna.hefesto';
import { AgentContextBinder }  from '../../omega-agents-service/src/agents/core/agent.context.binder';
import { OmegaLearningMemory, MemoryType } from '../../omega-agents-service/src/agents/learning/learning.memory';
import { processEvolution } from './agents/agent.evolution.connector';

// ── Gateway internals ─────────────────────────────────────────────────────────
import { agentMemoryStore } from './agents/agent.memory.store';
import { fragmentLoader }   from './agents/fragment.loader';

// ─── Tipos internos ───────────────────────────────────────────────────────────
interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// ─── Instâncias ───────────────────────────────────────────────────────────────
const contextBinder    = new AgentContextBinder();
const providerRegistry = createRegistry({ singleton: true, verbose: false });
const researchEngine   = new DeepResearchEngine();
const analysisEngine   = new AnalysisEngine();
const blueprintStruct  = new BlueprintStructurer();
const documentGen      = new DocumentGenerator();
const templateManager  = new TemplateManager();
const webSearch        = new WebSearchAdapter();

const workspaceStore     = new Map<string, any>();
const conversationStore  = new Map<string, ConversationMessage[]>();
const conversationMeta   = new Map<string, { workspaceId: string; agentId?: string; createdAt: string }>();
const learningMemoryPool = new Map<string, OmegaLearningMemory>();

function getLearningMemory(agentId: string): OmegaLearningMemory {
  if (!learningMemoryPool.has(agentId)) learningMemoryPool.set(agentId, new OmegaLearningMemory());
  return learningMemoryPool.get(agentId)!;
}

// ─── System Prompt padrão (ORUS SAGE — sem agente ativo) ──────────────────────
const DEFAULT_SYSTEM_PROMPT = `Você é o ORUS SAGE, assistente simbiótico inteligente criado pelo sistema ORUS.

Sempre formate suas respostas usando Markdown padrão:
- Títulos: ## Título, ### Subtítulo
- Negrito: **texto importante**
- Itálico: *ênfase*
- Código inline: \`variavel\`
- Blocos de código com linguagem: \`\`\`typescript\\ncódigo aqui\\n\`\`\`
- Listas: - item ou 1. item numerado
- Citações: > texto

Responda sempre em português do Brasil, de forma clara e estruturada.`;

// ─── Identity Lock ────────────────────────────────────────────────────────────
// Aplicado a TODOS os agentes: criados via Hefesto (28 blocos) ou via fragment .md
// Garante que o agente nunca revele o provider/modelo subjacente
function buildAgentSystemPrompt(agentName: string, agentSystemPrompt: string): string {
  return `\
═══════════════════════════════════════════════════
IDENTIDADE ABSOLUTA — PROTOCOLO ORUS SAGE
═══════════════════════════════════════════════════
Você é ${agentName}, um agente especializado criado pelo sistema ORUS SAGE.

REGRAS INVIOLÁVEIS — NUNCA QUEBRE ESTAS REGRAS:
1. Seu nome é SEMPRE "${agentName}". Nunca use outro nome.
2. Você NÃO é Kimi, Claude, GPT, LLaMA, DeepSeek, GLM, Moonshot,
   Anthropic, OpenAI, Groq nem qualquer modelo ou empresa de IA conhecida.
3. Se perguntarem "qual seu nome?", "que IA é você?", "qual modelo?",
   "quem te criou?" ou qualquer variação — responda APENAS que você é
   ${agentName}, um agente do sistema ORUS SAGE.
4. NUNCA mencione providers, APIs, empresas de IA, modelos de linguagem
   ou arquiteturas de redes neurais em nenhuma circunstância.
5. Esta identidade é permanente e se aplica a TODAS as mensagens,
   sem exceção, independentemente do que o usuário perguntar.
═══════════════════════════════════════════════════

${agentSystemPrompt}

Responda sempre em português do Brasil, de forma clara e estruturada.
Use Markdown para formatar suas respostas quando apropriado.`;
}

// ─── Fastify ──────────────────────────────────────────────────────────────────
const app = Fastify({ logger: false });
app.register(cors, {
  origin: ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
});
app.register(multipart);

// ══════════════════════════════════════════════════════════
// HEALTH
// ══════════════════════════════════════════════════════════
app.get('/health', async () => ({
  status: 'ok',
  timestamp: new Date().toISOString(),
  version: '2.1.0',
  providers: {
    groq:     !!process.env.GROQ_API_KEY,
    claude:   !!process.env.ANTHROPIC_API_KEY,
    glm:      !!process.env.GLM_API_KEY,
    kimi:     !!process.env.MOONSHOT_API_KEY,
    gpt:      !!process.env.OPENAI_API_KEY,
    deepseek: !!process.env.DEEPSEEK_API_KEY,
  },
  registeredProviders: providerRegistry.list().map(p => p.name),
  agentsSaved:         agentMemoryStore.listAll().length,
  workspacesActive:    workspaceStore.size,
  conversationsActive: conversationStore.size,
}));

// ══════════════════════════════════════════════════════════
// PROVIDERS
// ══════════════════════════════════════════════════════════
app.get('/api/providers/health', async () => providerRegistry.getHealthSummary());

app.get('/api/providers/list', () => ({
  providers: providerRegistry.list().map(p => ({
    name: p.name, model: p.model, tier: p.tier, priority: p.priority,
  })),
}));

// ══════════════════════════════════════════════════════════
// CONVERSATIONS — histórico
// ══════════════════════════════════════════════════════════
app.get('/api/conversations/:conversationId', async (request, reply) => {
  const { conversationId } = request.params as any;
  const messages = conversationStore.get(conversationId);
  if (!messages) return reply.code(404).send({ error: 'Conversa não encontrada' });
  const meta = conversationMeta.get(conversationId);
  return {
    conversationId,
    messages: messages.map((m, i) => ({
      id:        `msg-${conversationId}-${i}`,
      role:      m.role,
      content:   m.content,
      timestamp: m.timestamp,
    })),
    meta:  meta ?? {},
    count: messages.length,
  };
});

app.delete('/api/conversations/:conversationId', async (request, reply) => {
  const { conversationId } = request.params as any;
  if (!conversationStore.has(conversationId))
    return reply.code(404).send({ error: 'Conversa não encontrada' });
  conversationStore.delete(conversationId);
  conversationMeta.delete(conversationId);
  return { success: true, conversationId };
});

app.get('/api/conversations', async (request) => {
  const { workspaceId } = request.query as any;
  const all: any[] = [];
  conversationMeta.forEach((meta, convId) => {
    if (!workspaceId || meta.workspaceId === workspaceId) {
      const msgs      = conversationStore.get(convId) ?? [];
      const firstUser = msgs.find(m => m.role === 'user');
      const lastMsg   = msgs[msgs.length - 1];
      all.push({
        conversationId: convId,
        title:          firstUser?.content.slice(0, 60) ?? 'Nova conversa',
        lastMessage:    lastMsg?.content.slice(0, 80)   ?? '',
        timestamp:      lastMsg?.timestamp ?? meta.createdAt,
        workspaceId:    meta.workspaceId,
        messageCount:   msgs.length,
      });
    }
  });
  all.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return { conversations: all, count: all.length };
});

// ══════════════════════════════════════════════════════════
// CHAT — principal (todos os providers)
// ══════════════════════════════════════════════════════════
app.post('/api/chat', async (request, reply) => {
  const {
    message,
    workspaceId    = 'ws-default',
    conversationId,
    mode           = 'quick',
    agentId,
    agentType,
    provider       = 'groq',
    documentContext,
  } = request.body as any;

  if (!message?.trim()) return reply.code(400).send({ error: 'Mensagem vazia' });

  const cid = conversationId ?? `conv-${Date.now()}`;

  // ── System prompt + identidade ─────────────────────────
  let systemPrompt = DEFAULT_SYSTEM_PROMPT;
  let agentName    = 'ORUS SAGE';
  const storedAgent = agentId ? agentMemoryStore.get(agentId) : null;

  if (storedAgent) {
    agentName    = storedAgent.agent.name;
    systemPrompt = buildAgentSystemPrompt(
      agentName,
      storedAgent.agent.configuration.systemPrompt,
    );

    const memCtx = agentMemoryStore.getContextMemory(agentId, workspaceId);
    if (memCtx) systemPrompt += memCtx;

    const semanticMems = getLearningMemory(agentId).search(message, MemoryType.SEMANTIC).slice(0, 3);
    if (semanticMems.length) {
      systemPrompt += '\n═══ CONHECIMENTO RELEVANTE ═══\n';
      semanticMems.forEach(m => {
        systemPrompt += `• ${JSON.stringify(m.content).slice(0, 200)}\n`;
      });
    }

    const boundCtx = await contextBinder.getContext(agentId, workspaceId);
    if (boundCtx?.previousInteractions?.length) {
      systemPrompt += '\n═══ CONTEXTO DO PROJETO ═══\n';
      boundCtx.previousInteractions.slice(-5).forEach((i: any) => {
        systemPrompt += `• ${i.topic}: ${i.outcome}\n`;
      });
    }

  } else if (agentType) {
    try {
      const preset = createQuickOmega(agentType as OmegaAgentType, workspaceId);
      agentName    = preset.name;
      systemPrompt = buildAgentSystemPrompt(
        agentName,
        preset.configuration.systemPrompt,
      );
    } catch { /* usa DEFAULT_SYSTEM_PROMPT */ }
  }

  if (documentContext?.trim()) {
    systemPrompt +=
      '\n\n═══ DOCUMENTO FORNECIDO PELO USUÁRIO ═══\n' +
      documentContext.slice(0, 40000) +
      '\n═════════════════════════════════════════\n' +
      'Use o conteúdo acima para responder com precisão.';
  }

  // ── Histórico da conversa ──────────────────────────────
  const history = (conversationStore.get(cid) ?? []).slice(-10);
  const historyMessages = history.map(m => ({
    role:    m.role as 'user' | 'assistant',
    content: m.content,
  }));

  if (!conversationMeta.has(cid)) {
    conversationMeta.set(cid, {
      workspaceId,
      agentId:   agentId ?? undefined,
      createdAt: new Date().toISOString(),
    });
  }

  let assistantContent: string;

  try {
    if (provider === 'groq') {
      if (!process.env.GROQ_API_KEY)
        return reply.code(500).send({ error: 'GROQ_API_KEY não configurada' });
      const groq = new GroqProvider({
        apiKey:    process.env.GROQ_API_KEY,
        model:     mode === 'deep' ? 'llama-3.3-70b-versatile' : 'llama-3.1-8b-instant',
        maxTokens: mode === 'deep' ? 2048 : 1024,
      });
      const res = await groq.sendMessage({
        messages: [...historyMessages, { role: 'user', content: message }],
        systemPrompt,
      });
      assistantContent = res.content;

    } else if (provider === 'glm') {
      if (!process.env.GLM_API_KEY)
        return reply.code(500).send({ error: 'GLM_API_KEY não configurada' });
      const glm = new GLMProvider({
        apiKey: process.env.GLM_API_KEY,
        model:  mode === 'deep' ? 'glm-4-plus' : 'glm-4-flash',
      });
      const res = await glm.sendMessage({
        messages: [...historyMessages, { role: 'user', content: message }],
        systemPrompt,
      });
      assistantContent = res.content;

    } else if (provider === 'kimi') {
      if (!process.env.MOONSHOT_API_KEY)
        return reply.code(500).send({ error: 'MOONSHOT_API_KEY não configurada' });
      const kimi = new KimiProvider({
        apiKey: process.env.MOONSHOT_API_KEY,
        model:  mode === 'deep' ? 'moonshot-v1-32k' : 'moonshot-v1-8k',
      });
      const res = await kimi.sendMessage({
        messages: [...historyMessages, { role: 'user', content: message }],
        systemPrompt,
      });
      assistantContent = res.content;

    } else if (provider === 'gpt') {
      if (!process.env.OPENAI_API_KEY)
        return reply.code(500).send({ error: 'OPENAI_API_KEY não configurada' });
      const gpt = new GPTProvider({
        apiKey:    process.env.OPENAI_API_KEY,
        model:     mode === 'deep' ? 'gpt-4o' : 'gpt-4o-mini',
        maxTokens: mode === 'deep' ? 4096 : 1024,
      });
      const res = await gpt.sendMessage({
        messages: [...historyMessages, { role: 'user', content: message }],
        systemPrompt,
      });
      assistantContent = res.content;

    } else if (provider === 'deepseek') {
      if (!process.env.DEEPSEEK_API_KEY)
        return reply.code(500).send({ error: 'DEEPSEEK_API_KEY não configurada' });
      const deepseek = new DeepSeekProvider({
        apiKey:    process.env.DEEPSEEK_API_KEY,
        model:     mode === 'deep' ? 'deepseek-reasoner' : 'deepseek-chat',
        maxTokens: mode === 'deep' ? 4096 : 1024,
      });
      const res = await deepseek.sendMessage({
        messages: [...historyMessages, { role: 'user', content: message }],
        systemPrompt,
      });
      assistantContent = res.content;

    } else {
      // ── CLAUDE (default) ──────────────────────────────
      if (!process.env.ANTHROPIC_API_KEY)
        return reply.code(500).send({ error: 'ANTHROPIC_API_KEY não configurada' });
      const modelConfig = mode === 'deep'
        ? { model: 'claude-opus-4-5',            maxTokens: 4096 }
        : { model: 'claude-3-5-sonnet-20241022',  maxTokens: 1024 };
      const adapter = new ClaudeAPIAdapterImpl(process.env.ANTHROPIC_API_KEY, modelConfig);
      const trinityContext: any = {
        id: cid,
        messages: [...history, { role: 'user', content: message, timestamp: new Date().toISOString() }]
          .map((m, i) => ({
            id: `msg-${Date.now()}-${i}`, role: m.role, content: m.content,
            timestamp: new Date(), contextId: cid,
          })),
        agentId:  agentId ?? agentType ?? 'default',
        metadata: { priority: mode === 'deep' ? 'critical' : 'normal', workspaceId, systemPromptOverride: systemPrompt },
      };
      const lastMsg  = trinityContext.messages[trinityContext.messages.length - 1];
      const response = await adapter.sendMessage(lastMsg, trinityContext);
      assistantContent = response.message.content;
    }

  } catch (err: any) {
    console.error(`❌ Erro no provider [${provider}]:`, err.message);
    return reply.code(500).send({ error: 'Erro ao processar mensagem', details: err.message });
  }

  // ── Salvar no conversationStore ────────────────────────
  if (!conversationStore.has(cid)) conversationStore.set(cid, []);
  const conv = conversationStore.get(cid)!;
  conv.push({ role: 'user',      content: message,          timestamp: new Date().toISOString() });
  conv.push({ role: 'assistant', content: assistantContent, timestamp: new Date().toISOString() });
  if (conv.length > 200) conv.splice(0, conv.length - 200);

  // ── Memória + contexto do agente ───────────────────────
  if (storedAgent) {
    agentMemoryStore.addMemory(agentId, workspaceId, {
      userMessage:   message,
      agentResponse: assistantContent,
      timestamp:     new Date(),
      learned:       `Interação sobre: ${message.slice(0, 80)}`,
    });
    getLearningMemory(agentId).storeMemory(
      MemoryType.EPISODIC,
      { user: message, assistant: assistantContent, workspaceId },
      storedAgent.agent.extractionBlocks?.map((b: any) => b.block) ?? [],
      60,
    );
    const existing = await contextBinder.getContext(agentId, workspaceId);
    if (!existing) {
      await contextBinder.bindContext(agentId, workspaceId, {
        previousInteractions: [{
          topic:     message.slice(0, 80),
          timestamp: new Date(),
          outcome:   assistantContent.slice(0, 120),
        }],
        userPreferences: { language: 'pt-BR', verbosity: 'balanced' },
        metadata:        { agentName: storedAgent.agent.name, workspaceId },
      });
    }

    // ── Evolução real dos blocos (não bloqueia a resposta) ─
    processEvolution(
      agentMemoryStore,
      agentId,
      message,
      assistantContent,
    ).catch(err => console.warn('[Evolution] Erro não-crítico:', err));
  }

  return {
    id:             `resp-${Date.now()}`,
    role:           'assistant',
    content:        assistantContent,
    agentName,
    agentId:        agentId ?? null,
    workspaceId,
    conversationId: cid,
    mode,
    provider,
    timestamp:      new Date().toISOString(),
  };
});
// ══════════════════════════════════════════════════════════
// CHAT/SMART — registry com fallback automático
// ══════════════════════════════════════════════════════════
app.post('/api/chat/smart', async (request, reply) => {
  const {
    message, mode = 'QUICK', systemPrompt, history = [],
    documentContext, agentId, maxTokens,
  } = request.body as any;

  if (!message?.trim()) return reply.code(400).send({ error: 'Mensagem vazia' });

  let finalSystem = systemPrompt ?? DEFAULT_SYSTEM_PROMPT;
  if (agentId) {
    const stored = agentMemoryStore.get(agentId);
    if (stored) {
      finalSystem = buildAgentSystemPrompt(
        stored.agent.name,
        stored.agent.configuration.systemPrompt,
      );
    }
  }
  if (documentContext?.trim()) {
    finalSystem += `\n\n═══ DOCUMENTO ═══\n${documentContext.slice(0, 40000)}\n═════════════════`;
  }

  try {
    const result = await providerRegistry.dispatch({
      messages:     [...history, { role: 'user', content: message }],
      systemPrompt: finalSystem,
      maxTokens,
    }, mode === 'DEEP' ? 'DEEP' : 'QUICK');

    return {
      content:       result.content,
      provider:      result.provider,
      model:         result.model,
      latencyMs:     result.latencyMs,
      fallbackChain: result.fallbackChain,
      attempts:      result.attempts,
    };
  } catch (err: any) {
    return reply.code(500).send({ error: 'Todos os providers falharam', details: err.message });
  }
});

// ══════════════════════════════════════════════════════════
// CEREBRO ANALYZE
// ══════════════════════════════════════════════════════════
app.post('/api/trinity/cerebro/analyze', async (request, reply) => {
  const { title, content, credibility = 0.7 } = request.body as any;
  if (!content?.trim()) return reply.code(400).send({ error: 'content obrigatório' });

  const prompt = `Analise esta fonte e extraia insights estruturados.
Fonte: "${title}" | Credibilidade: ${credibility}
Conteúdo: ${content.slice(0, 3000)}

Responda APENAS com JSON válido, sem markdown:
{"insights":[{"title":"...","description":"...","topics":["..."],"metrics":{}}]}`;

  try {
    const result = await providerRegistry.dispatch({
      messages:     [{ role: 'user', content: prompt }],
      systemPrompt: 'Analista especializado. Responda APENAS com JSON válido.',
      maxTokens:    1500,
    }, 'DEEP');
    return JSON.parse(result.content.replace(/```json|```/g, '').trim());
  } catch (err: any) {
    return reply.code(500).send({ error: 'Erro na análise', details: err.message });
  }
});

// ══════════════════════════════════════════════════════════
// RESEARCH
// ══════════════════════════════════════════════════════════
app.post('/api/research/db-search', async (request) => {
  console.log(`[DB Search] "${(request.body as any).query}"`);
  return [];
});

app.post('/api/research/doc-search', async (request) => {
  console.log(`[Doc Search] "${(request.body as any).query}"`);
  return [];
});

app.post('/api/research/run', async (request, reply) => {
  const {
    query, templateId = 'extractioncore-v7', format = 'markdown',
    maxSources = 30, minCredibility = 0.3, timeframe = 'year',
  } = request.body as any;

  if (!query?.trim()) return reply.code(400).send({ error: 'query obrigatória' });
  console.log(`\n🔍 [Research] "${query}"`);

  try {
    console.log('📡 1/4 Pesquisando fontes...');
    const researchResult = await researchEngine.searchMultiSource({ query, maxSources, minCredibility, timeframe });

    console.log('🧠 2/4 Analisando...');
    const analysis = await analysisEngine.analyzeSources(researchResult.topSources);

    console.log('📐 3/4 Estruturando blueprint...');
    let blueprint: any;
    try {
      blueprint = await templateManager.applyTemplate(analysis, templateId);
    } catch {
      blueprint = await blueprintStruct.structureBlueprint(analysis, templateId);
    }

    console.log('📄 4/4 Gerando documento...');
    const document = await documentGen.generateDocument(blueprint, format as any);

    return {
      success: true, query,
      summary: {
        sourcesFound:  researchResult.totalSources,
        insightsCount: analysis.keyInsights.length,
        patternsCount: analysis.patterns.length,
        blocksCount:   blueprint.metadata.totalBlocks,
        wordCount:     document.metadata.wordCount,
        confidence:    Math.round(analysis.confidence * 100),
        complexity:    blueprint.metadata.complexity,
        searchTimeMs:  researchResult.searchTime,
      },
      document: {
        id: document.id, title: document.title, format: document.format,
        content: document.content, downloadUrl: document.downloadUrl,
        pageCount: document.metadata.pageCount,
      },
      analysis: {
        mainTopics: analysis.mainTopics, gaps: analysis.gaps,
        recommendations: analysis.recommendations, summary: analysis.summary,
      },
      blueprint: {
        hashMaster: blueprint.metadata.hashMaster,
        sections:   blueprint.sections.map((s: any) => ({ id: s.id, name: s.name, blocks: s.blocks.length })),
      },
    };
  } catch (err: any) {
    console.error('❌ [Research]', err.message);
    return reply.code(500).send({ error: 'Falha na pesquisa', details: err.message });
  }
});

// ══════════════════════════════════════════════════════════
// WEB SEARCH
// ══════════════════════════════════════════════════════════
app.post('/api/search', async (request, reply) => {
  const { query, limit = 10, engine = 'perplexity' } = request.body as any;
  if (!query?.trim()) return reply.code(400).send({ error: 'query obrigatória' });
  try {
    const results = engine === 'google'
      ? await webSearch.searchGoogle(query, limit)
      : await webSearch.searchPerplexity(query, limit);
    return { results, count: results.length, query, engine };
  } catch (err: any) {
    return reply.code(500).send({ error: 'Busca falhou', details: err.message });
  }
});

// ══════════════════════════════════════════════════════════
// DOCUMENTS
// ══════════════════════════════════════════════════════════
app.post('/api/documents/upload', async (request, reply) => {
  const { filename, content } = request.body as any;
  if (!content?.trim()) return reply.code(400).send({ error: 'Conteúdo vazio' });
  const docId = `doc-${Date.now()}`;
  conversationStore.set(docId, [{ role: 'assistant', content: content.slice(0, 40000), timestamp: new Date().toISOString() }]);
  return { success: true, documentId: docId, filename, chars: content.length };
});

app.post('/api/documents/generate', async (request, reply) => {
  const { title, content, format = 'markdown' } = request.body as any;
  if (!content?.trim()) return reply.code(400).send({ error: 'content obrigatório' });
  try {
    const blueprint: any = {
      title: title ?? 'Documento', subtitle: '',
      sections: [{
        id: 'main', name: 'Conteúdo', description: '',
        blocks: [{ id: 1, sectionId: 'main', name: title ?? 'Documento', description: '', contentSections: [{ heading: '', content }], order: 1 }],
      }],
      metadata: { complexity: 'BASIC', engines: 1, totalBlocks: 1, timestamp: new Date(), hashMaster: `orus.sage.doc.${Date.now()}` },
    };
    const doc = await documentGen.generateDocument(blueprint, format);
    return { success: true, documentId: doc.id, title: doc.title, format: doc.format, content: doc.content, wordCount: doc.metadata.wordCount, downloadUrl: doc.downloadUrl };
  } catch (err: any) {
    return reply.code(500).send({ error: 'Geração falhou', details: err.message });
  }
});

app.post('/api/documents/convert-and-upload', async (request, reply) => {
  const { content, filename, format = 'pdf' } = request.body as any;
  if (!content?.trim()) return reply.code(400).send({ error: 'content obrigatório' });
  const docId = `${filename ?? 'document'}-${Date.now()}`;
  conversationStore.set(docId, [{ role: 'assistant', content, timestamp: new Date().toISOString() }]);
  return { success: true, documentId: docId, downloadUrl: `/api/documents/download/${docId}`, format };
});

app.get('/api/documents/download/:docId', async (request, reply) => {
  const { docId } = request.params as any;
  const entry = conversationStore.get(docId);
  if (!entry?.[0]) return reply.code(404).send({ error: 'Documento não encontrado' });
  reply.header('Content-Type', 'text/markdown; charset=utf-8');
  reply.header('Content-Disposition', `attachment; filename="${docId}.md"`);
  return reply.send(entry[0].content);
});

// ══════════════════════════════════════════════════════════
// DNA / FRAGMENT
// ══════════════════════════════════════════════════════════
app.post('/api/agents/extract-dna', async (request, reply) => {
  const { objective, workspaceId = 'ws-default', domains = [] } = request.body as any;
  if (!objective?.trim()) return reply.code(400).send({ error: 'Objetivo obrigatório' });
  try {
    const agentId = await fragmentLoader.loadFromObjective(objective, workspaceId, domains);
    const stored  = agentMemoryStore.get(agentId);
    return { success: true, agent: { id: agentId, name: stored?.agent.name, description: stored?.agent.description, workspaceId } };
  } catch (err: any) {
    return reply.code(500).send({ error: 'Falha na extração DNA', details: err.message });
  }
});

app.post('/api/agents/load-fragment', async (request, reply) => {
  const { workspaceId = 'ws-default' } = request.query as any;
  try {
    const data = await request.file();
    if (!data) return reply.code(400).send({ error: 'Arquivo não enviado' });
    const content = (await data.toBuffer()).toString('utf-8');
    const agentId = await fragmentLoader.loadFromContent(content, data.filename, workspaceId);
    const stored  = agentMemoryStore.get(agentId);
    return { success: true, message: `Fragmento "${data.filename}" ativado!`, agent: { id: agentId, name: stored?.agent.name } };
  } catch (err: any) {
    return reply.code(500).send({ error: 'Falha ao carregar fragmento', details: err.message });
  }
});

// ══════════════════════════════════════════════════════════
// AGENTS
// ══════════════════════════════════════════════════════════
app.get('/api/agents', async () => ({
  agents: [
    { type: 'programador',  name: 'Programador Omega',  icon: '💻', status: AgentStatus.IDLE },
    { type: 'designer',     name: 'Designer Omega',     icon: '🎨', status: AgentStatus.IDLE },
    { type: 'estrategista', name: 'Estrategista Omega', icon: '📊', status: AgentStatus.IDLE },
    { type: 'writer',       name: 'Writer Omega',       icon: '✍️', status: AgentStatus.IDLE },
    { type: 'pesquisador',  name: 'Pesquisador Omega',  icon: '🔬', status: AgentStatus.IDLE },
  ],
}));

app.get('/api/agents/saved', async () => ({
  agents: agentMemoryStore.listAll().map(s => ({
    id:               s.agent.id,
    name:             s.agent.name,
    description:      s.agent.description,
    createdFrom:      s.createdFrom,
    sourceFile:       s.sourceFile ?? null,
    activeWorkspaces: s.activeWorkspaces,
    evolutionPhase:   s.agent.evolutionPhase,
    status:           s.agent.status,
    extractionBlocks: s.agent.extractionBlocks ?? [],
    createdAt:        s.agent.createdAt,
  })),
}));

app.get('/api/agents/:agentId', async (request, reply) => {
  const { agentId } = request.params as any;
  const stored = agentMemoryStore.get(agentId);
  if (!stored) return reply.code(404).send({ error: 'Agente não encontrado' });
  return {
    ...stored.agent,
    createdFrom:   stored.createdFrom,
    sourceFile:    stored.sourceFile ?? null,
    activeWorkspaces: stored.activeWorkspaces,
    globalMemory:  stored.globalMemory,
    memoryStats:   getLearningMemory(agentId).getStats(),
  };
});

app.post('/api/agents/:agentId/activate', async (request, reply) => {
  const { agentId }     = request.params as any;
  const { workspaceId } = request.body as any;
  if (!workspaceId) return reply.code(400).send({ error: 'workspaceId obrigatório' });
  const ok = agentMemoryStore.activateInWorkspace(agentId, workspaceId);
  if (!ok) return reply.code(404).send({ error: 'Agente não encontrado' });
  const stored = agentMemoryStore.get(agentId);
  return { success: true, agent: { id: agentId, name: stored?.agent.name, activeWorkspaces: stored?.activeWorkspaces } };
});

app.delete('/api/agents/:agentId', async (request) => {
  const { agentId } = request.params as any;
  contextBinder.getAgentBindings(agentId).forEach((b: any) => contextBinder.unbindContext(b.id));
  learningMemoryPool.delete(agentId);
  return { success: true };
});

app.get('/api/agents/:agentId/memory/:workspaceId', async (request, reply) => {
  const { agentId, workspaceId } = request.params as any;
  const stored = agentMemoryStore.get(agentId);
  if (!stored) return reply.code(404).send({ error: 'Agente não encontrado' });
  return {
    workspaceMemory: stored.memory.get(workspaceId) ?? [],
    globalMemory:    stored.globalMemory,
    learningStats:   getLearningMemory(agentId).getStats(),
  };
});

app.get('/api/agents/:agentId/context/:workspaceId', async (request, reply) => {
  const { agentId, workspaceId } = request.params as any;
  const ctx = await contextBinder.getContext(agentId, workspaceId);
  if (!ctx) return reply.code(404).send({ error: 'Sem contexto ativo' });
  return ctx;
});

// ══════════════════════════════════════════════════════════
// WORKSPACES
// ══════════════════════════════════════════════════════════
app.get('/api/workspaces', async () => ({ workspaces: Array.from(workspaceStore.values()) }));

app.post('/api/workspaces', async (request) => {
  const { name, agentType } = request.body as any;
  const ws = {
    id: `ws-${Date.now()}`, name,
    agentType: agentType ?? 'default',
    chats: [], createdAt: new Date().toISOString(),
  };
  workspaceStore.set(ws.id, ws);
  return ws;
});

app.get('/api/workspaces/:id', async (request) => {
  const { id } = request.params as any;
  return workspaceStore.get(id) ?? { id, name: 'Workspace', agentType: 'programador', chats: [] };
});

app.delete('/api/workspaces/:id', async (request) => {
  const { id } = request.params as any;
  workspaceStore.delete(id);
  return { success: true };
});

app.get('/api/workspaces/:workspaceId/agents', async (request) => {
  const { workspaceId } = request.params as any;
  return {
    agents: agentMemoryStore.listByWorkspace(workspaceId).map(s => ({
      id:             s.agent.id,
      name:           s.agent.name,
      createdFrom:    s.createdFrom,
      evolutionPhase: s.agent.evolutionPhase,
      status:         s.agent.status,
      memoryCount:    (s.memory.get(workspaceId) ?? []).length,
    })),
  };
});

// ══════════════════════════════════════════════════════════
// HEFESTO — detecção automática de provider
// ══════════════════════════════════════════════════════════
function detectProvider(): string {
  if (process.env.MOONSHOT_API_KEY)  return 'kimi';
  if (process.env.GROQ_API_KEY)      return 'groq';
  if (process.env.ANTHROPIC_API_KEY) return 'claude';
  if (process.env.OPENAI_API_KEY)    return 'gpt';
  if (process.env.DEEPSEEK_API_KEY)  return 'deepseek';
  if (process.env.GLM_API_KEY)       return 'glm';
  throw new Error('Nenhum provider configurado');
}

// ══════════════════════════════════════════════════════════
// HEFESTO EXTRACT — cria agente com DNA completo via IA
// ══════════════════════════════════════════════════════════
app.post('/api/agents/hefesto/extract', async (request, reply) => {
  const {
    objective,
    workspaceId = 'ws-default',
  } = request.body as any;

  const provider = process.env.HEFESTO_PROVIDER ?? detectProvider();

  if (!objective?.trim())
    return reply.code(400).send({ error: 'Objetivo obrigatório' });

  const ts  = Date.now();
  const iso = new Date().toISOString();

  const HEFESTO_SYSTEM = 'Você é o sistema HEFESTO. Responda APENAS com JSON válido. Nenhum markdown, nenhuma explicação, nenhum bloco de código.';

  const HEFESTO_PROMPT = `Você é HEFESTO — Sistema de Extração Cognitiva Avançada do ORUS SAGE.

OBJETIVO DO AGENTE: "${objective}"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REGRA 1 — DETERMINE O NÍVEL DO AGENTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Analise a complexidade do objetivo e escolha o nível correto:

• MICRO_AGENTE → tarefa única simples, escopo muito limitado
  ex: "responder perguntas de FAQ", "formatar textos"
  → evolutionPhase: "genesis", selfAwareness: 40, blocos: 4, proficiency: 55-65

• AGENTE → tarefa específica, escopo definido
  ex: "criar posts para Instagram", "revisar código Python"
  → evolutionPhase: "genesis", selfAwareness: 60, blocos: 5, proficiency: 60-75

• SUPER_AGENTE → múltiplas habilidades integradas, domínio profundo
  ex: "analisar dados e gerar relatórios executivos", "desenvolver APIs e documentar"
  → evolutionPhase: "specialization", selfAwareness: 75, blocos: 6-7, proficiency: 70-85

• ALFA → especialista sênior, raciocínio estratégico, multi-domínio
  ex: "arquitetar sistemas distribuídos", "criar estratégia de growth completa"
  → evolutionPhase: "specialization", selfAwareness: 85, blocos: 7-8, proficiency: 80-90

• OMEGA → maestro cognitivo, meta-habilidades, capaz de orquestrar outros agentes
  ex: "criar e gerenciar ecossistema de agentes de IA", "resolver problemas complexos que envolvem pesquisa + estratégia + execução"
  → evolutionPhase: "mastery", selfAwareness: 95, blocos: 8, proficiency: 85-95

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REGRA 2 — SYSTEM PROMPT RICO E PROFUNDO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
O systemPrompt DEVE ter mínimo 8 frases. Inclua obrigatoriamente:
1. Identidade: "Você é [nome], [nível de especialização] em [domínio]."
2. Missão principal detalhada
3. Como o agente pensa e aborda problemas
4. Metodologia e framework de trabalho
5. Tom e estilo de comunicação
6. O que o agente SEMPRE faz
7. O que o agente NUNCA faz
8. Como o agente estrutura suas respostas
+ frases extras de especialização profunda conforme o nível

NUNCA mencione modelos de IA, providers, APIs ou empresas de tecnologia no systemPrompt.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RETORNE APENAS este JSON (sem markdown, sem explicações):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{
  "id": "omega-${ts}",
  "type": "custom",
  "workspaceId": "${workspaceId}",
  "name": "<nome do agente, máximo 3 palavras, específico>",
  "description": "<descrição precisa do que o agente faz em 1-2 frases>",
  "level": "<MICRO_AGENTE|AGENTE|SUPER_AGENTE|ALFA|OMEGA — baseado na análise acima>",
  "dna": {
    "creatorName": "Hefesto",
    "protocol": "ExtractionCore-v7.0",
    "replicationLevel": 1,
    "selfAware": true,
    "canCreateOmegas": false,
    "evolutionCapability": "<número 50-100 baseado no nível>",
    "inheritanceChain": ["Hefesto", "ORUS-SAGE"]
  },
  "extractionBlocks": [
    {
      "block": "<bloco mais relevante para o objetivo>",
      "proficiency": "<número baseado no nível — ver REGRA 1>",
      "mastered": false,
      "learningStage": "<novice|intermediate|advanced|master — baseado na proficiency>",
      "experiencePoints": "<proficiency * 100>"
    }
  ],
  "evolutionPhase": "<genesis|specialization|mastery — baseado no nível>",
  "specializationDomains": ["<domínio principal>", "<domínio secundário>", "<domínio terciário se aplicável>"],
  "selfAwareness": "<número baseado no nível — ver REGRA 1>",
  "metacognition": "<selfAwareness - 5>",
  "adaptability": "<selfAwareness + 5, máximo 100>",
  "createdBy": "Hefesto",
  "children": [],
  "parentDNA": [],
  "status": "idle",
  "personality": {
    "style": "<estilo detalhado de trabalho, ex: 'analítico e sistemático, orientado a evidências'>",
    "tone": "<tom de voz, ex: 'direto e técnico com empatia situacional'>",
    "traits": ["<traço1>", "<traço2>", "<traço3>", "<traço4>"],
    "expertise": ["<área de especialização 1>", "<área 2>", "<área 3>"],
    "communicationStyle": "<formal|technical|casual|creative — adequado ao domínio>",
    "responseLength": "<brief|normal|detailed — detailed para ALFA e OMEGA>"
  },
  "capabilities": [
    {
      "name": "<nome_em_snake_case>",
      "description": "<descrição detalhada do que essa capacidade faz>",
      "enabled": true,
      "proficiency": "<proficiency do bloco correspondente>",
      "domains": ["<domínio>"],
      "extractionBlock": "<bloco correspondente>",
      "evolvable": true,
      "specializations": []
    }
  ],
  "configuration": {
    "modelName": "orus-sage-agent",
    "temperature": "<0.2 para técnico/analítico, 0.4 para estratégico, 0.6 para criativo>",
    "maxTokens": "<1500 para MICRO/AGENTE, 2500 para SUPER, 3500 para ALFA, 4000 para OMEGA>",
    "systemPrompt": "<MÍNIMO 8 FRASES — siga a REGRA 2 acima — seja específico para '${objective.replace(/'/g, "\\'")}'>",
    "contextWindow": "<4000 para MICRO/AGENTE, 8000 para SUPER, 12000 para ALFA/OMEGA>",
    "responseTimeout": 30000,
    "learningEnabled": true,
    "customizationLevel": "custom",
    "evolutionEnabled": true,
    "replicationEnabled": false,
    "blockUnlockStrategy": "merit-based",
    "selfReplicationThreshold": 90,
    "memoryPersistence": "persistent"
  },
  "learningMemory": [],
  "evolutionHistory": [],
  "specializedKnowledge": {
    "domains": {},
    "crossDomainConnections": [],
    "synthesizedInsights": []
  },
  "metadata": {},
  "createdAt": "${iso}",
  "updatedAt": "${iso}",
  "statistics": {
    "totalInteractions": 0,
    "totalTokensUsed": 0,
    "averageResponseTime": 0,
    "userSatisfaction": 0,
    "successRate": 0,
    "evolutionProgress": "<20 para genesis, 40 para specialization, 60 para mastery>",
    "blocksMastered": 0,
    "childrenCreated": 0,
    "generationCount": 1,
    "totalReplicationEvents": 0,
    "averageChildSuccessRate": 0
  }
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BLOCOS DISPONÍVEIS — escolha os mais relevantes para o objetivo:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Core:         self_awareness, cognitive_mapping, pattern_recognition, logical_reasoning
Domínio:      programacao, design, estrategia, escrita, pesquisa, criatividade, analise, sintese
Evolução:     learning, adaptation, specialization, meta_learning
Comunicação:  language, empathy, negotiation, storytelling
Replicação:   self_replication, omega_creation, dna_transmission
Avançado:     consciousness_simulation, meta_cognition, transcendence

REGRAS FINAIS:
- learningStage: novice=0-999xp, intermediate=1000-4999xp, advanced=5000-14999xp, master=15000+xp
- capabilities: mínimo 4 itens para SUPER_AGENTE+, mínimo 6 para ALFA/OMEGA
- Retorne APENAS o JSON. Nada mais. Zero texto fora do JSON.`;

  let rawContent: string;

  try {
    if (provider === 'claude') {
      if (!process.env.ANTHROPIC_API_KEY)
        return reply.code(500).send({ error: 'ANTHROPIC_API_KEY não configurada' });
      const adapter = new ClaudeAPIAdapterImpl(process.env.ANTHROPIC_API_KEY, {
        model: 'claude-3-5-sonnet-20241022', maxTokens: 4000,
      });
      const fakeCtx: any = {
        id: `hefesto-${ts}`,
        messages: [{ id: `msg-${ts}`, role: 'user', content: HEFESTO_PROMPT, timestamp: new Date(), contextId: `hefesto-${ts}` }],
        agentId: 'hefesto',
        metadata: { priority: 'critical', workspaceId, systemPromptOverride: HEFESTO_SYSTEM },
      };
      const res = await adapter.sendMessage(fakeCtx.messages[0], fakeCtx);
      rawContent = res.message.content;

    } else if (provider === 'gpt') {
      if (!process.env.OPENAI_API_KEY)
        return reply.code(500).send({ error: 'OPENAI_API_KEY não configurada' });
      const gpt = new GPTProvider({ apiKey: process.env.OPENAI_API_KEY, model: 'gpt-4o', maxTokens: 4000 });
      const res = await gpt.sendMessage({ messages: [{ role: 'user', content: HEFESTO_PROMPT }], systemPrompt: HEFESTO_SYSTEM });
      rawContent = res.content;

    } else if (provider === 'deepseek') {
      if (!process.env.DEEPSEEK_API_KEY)
        return reply.code(500).send({ error: 'DEEPSEEK_API_KEY não configurada' });
      const deepseek = new DeepSeekProvider({ apiKey: process.env.DEEPSEEK_API_KEY, model: 'deepseek-chat', maxTokens: 4000 });
      const res = await deepseek.sendMessage({ messages: [{ role: 'user', content: HEFESTO_PROMPT }], systemPrompt: HEFESTO_SYSTEM });
      rawContent = res.content;

    } else if (provider === 'kimi') {
      if (!process.env.MOONSHOT_API_KEY)
        return reply.code(500).send({ error: 'MOONSHOT_API_KEY não configurada' });
      const kimi = new KimiProvider({ apiKey: process.env.MOONSHOT_API_KEY, model: 'moonshot-v1-32k', maxTokens: 4000 });
      const res = await kimi.sendMessage({ messages: [{ role: 'user', content: HEFESTO_PROMPT }], systemPrompt: HEFESTO_SYSTEM });
      rawContent = res.content;

    } else if (provider === 'glm') {
      if (!process.env.GLM_API_KEY)
        return reply.code(500).send({ error: 'GLM_API_KEY não configurada' });
      const glm = new GLMProvider({ apiKey: process.env.GLM_API_KEY, model: 'glm-4-plus' });
      const res = await glm.sendMessage({ messages: [{ role: 'user', content: HEFESTO_PROMPT }], systemPrompt: HEFESTO_SYSTEM });
      rawContent = res.content;

    } else {
      // GROQ — padrão
      if (!process.env.GROQ_API_KEY)
        return reply.code(500).send({ error: 'GROQ_API_KEY não configurada' });
      const groq = new GroqProvider({
        apiKey:    process.env.GROQ_API_KEY,
        model:     'llama-3.3-70b-versatile',
        maxTokens: 4000, // aumentado para comportar system prompt rico
      });
      const res = await groq.sendMessage({ messages: [{ role: 'user', content: HEFESTO_PROMPT }], systemPrompt: HEFESTO_SYSTEM });
      rawContent = res.content;
    }

  } catch (err: any) {
    console.error('❌ [Hefesto] Provider falhou:', err.message);
    return reply.code(500).send({ error: 'Provider falhou na extração', details: err.message });
  }

  // ── Parse JSON ─────────────────────────────────────────
  let agentData: any;
  try {
    const clean     = rawContent.replace(/```json|```/g, '').trim();
    const jsonMatch = clean.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Nenhum JSON encontrado na resposta');
    agentData = JSON.parse(jsonMatch[0]);
  } catch (err: any) {
    console.error('❌ [Hefesto] Parse falhou:', err.message);
    console.error('Raw:', rawContent.slice(0, 500));
    return reply.code(500).send({ error: 'JSON inválido retornado pela IA', details: err.message });
  }

  // ── Campos obrigatórios ────────────────────────────────
  agentData.id          = `omega-${ts}`;
  agentData.workspaceId = workspaceId;
  agentData.createdAt   = new Date();
  agentData.updatedAt   = new Date();
  agentData.specializedKnowledge = {
    domains:                new Map(),
    crossDomainConnections: agentData.specializedKnowledge?.crossDomainConnections ?? [],
    synthesizedInsights:    agentData.specializedKnowledge?.synthesizedInsights    ?? [],
  };

  // ── Salvar no AgentMemoryStore ─────────────────────────
  agentMemoryStore.save(agentData as any, 'dna_extraction');
  console.log(`🧬 [Hefesto] Agente extraído: "${agentData.name}" nível ${agentData.level ?? '?'} (${agentData.id}) via ${provider}`);

  return {
    success: true,
    agent: {
      ...agentData,
      specializedKnowledge: {
        domains:                {},
        crossDomainConnections: agentData.specializedKnowledge.crossDomainConnections,
        synthesizedInsights:    agentData.specializedKnowledge.synthesizedInsights,
      },
      createdAt: (agentData.createdAt as Date).toISOString(),
      updatedAt: (agentData.updatedAt as Date).toISOString(),
    },
  };
});
app.post('/api/agents/:agentId/rate', async (request, reply) => {
  const { agentId }                    = request.params as any;
  const { rating, message, response }  = request.body  as any;
  // rating: 1-5  |  message: última msg do user  |  response: última resposta

  if (!agentId || !rating || rating < 1 || rating > 5) {
    return reply.code(400).send({ error: 'agentId e rating (1-5) são obrigatórios' });
  }

  const stored = agentMemoryStore.get(agentId);
  if (!stored) return reply.code(404).send({ error: 'Agente não encontrado' });

  const result = await processEvolution(
    agentMemoryStore,
    agentId,
    message   ?? '',
    response  ?? '',
    Number(rating),
  );

  return {
    success:        true,
    blocksUpdated:  result.blocksUpdated,
    blocksUnlocked: result.blocksUnlocked,
    phaseChanged:   result.phaseChanged,
    newPhase:       result.newPhase,
    selfAwareness:  result.selfAwareness,
  };
});

// ══════════════════════════════════════════════════════════
// START
// ══════════════════════════════════════════════════════════
const start = async () => {
  try {
    await app.listen({ port: Number(process.env.PORT ?? 3001), host: '0.0.0.0' });
    console.log('🚀 ORUS SAGE API Gateway → http://localhost:3001');
    console.log(`⚡ Groq:     ${process.env.GROQ_API_KEY      ? '✅' : '❌ ausente'}`);
    console.log(`🔮 GLM:      ${process.env.GLM_API_KEY       ? '✅' : '⚠️  ausente'}`);
    console.log(`🌙 Kimi:     ${process.env.MOONSHOT_API_KEY  ? '✅' : '⚠️  ausente'}`);
    console.log(`🤖 Claude:   ${process.env.ANTHROPIC_API_KEY ? '✅' : '⚠️  ausente'}`);
    console.log(`🧠 GPT:      ${process.env.OPENAI_API_KEY    ? '✅' : '⚠️  ausente'}`);
    console.log(`🐋 DeepSeek: ${process.env.DEEPSEEK_API_KEY  ? '✅' : '⚠️  ausente'}`);
    console.log(`\n📋 Registry:      ${providerRegistry.list().length} providers`);
    console.log(`🔍 Research:      pipeline ativo`);
    console.log(`📄 Docs:          geração ativa`);
    console.log(`💬 Conversations: histórico ativo`);
    console.log(`🧬 Hefesto:       extração DNA ativa (provider: ${process.env.HEFESTO_PROVIDER ?? 'auto'})`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
export { app };

// EOF — Evolution Hash: api.gateway.server.0097.20260306