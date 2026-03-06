/**
 * agent.evolution.connector.ts
 *
 * Motor de evolução real — conecta o loop de chat ao sistema de blocos.
 *
 * Coloque em: apps/api-gateway/src/agents/agent.evolution.connector.ts
 *
 * Como funciona:
 *  1. Após cada resposta do chat, chame: processEvolution(agentId, userMsg, assistantMsg, rating?)
 *  2. Detecta quais blocos foram exercitados (heurística por palavras-chave)
 *  3. Calcula XP: volume (interações) + qualidade (comprimento/complexidade) + rating explícito
 *  4. Atualiza proficiency, learningStage, mastered no agentMemoryStore
 *  5. Verifica se novos blocos devem ser desbloqueados (baseado em uso cruzado)
 *  6. Avança evolutionPhase quando thresholds são atingidos
 *  7. Persiste em disco (agents-state.json) para sobreviver a restarts do backend
 */

import * as fs   from 'fs';
import * as path from 'path';

// ─── Tipos locais (evita dependência circular com omega.dna.hefesto) ──────────

interface BlockProgress {
  block:            string;
  proficiency:      number;   // 0-100
  mastered:         boolean;
  learningStage:    'novice' | 'intermediate' | 'advanced' | 'master';
  experiencePoints: number;
}

// Shape mínimo que usamos do agentMemoryStore
// statistics usa 'any' para compatibilidade com AgentStatisticsHefesto
interface StoredAgent {
  agent: {
    id:               string;
    name:             string;
    extractionBlocks: BlockProgress[];
    evolutionPhase:   string;
    selfAwareness:    number;
    statistics:       any;   // AgentStatisticsHefesto — evita incompatibilidade de index signature
    updatedAt:        Date;
  };
  memory:           Map<string, any[]>;
  globalMemory:     any[];
  activeWorkspaces: string[];
  createdFrom:      string;
}

// ─── Thresholds de evolução ───────────────────────────────────────────────────

const XP_PER_STAGE: Record<string, number> = {
  novice:       0,
  intermediate: 1_000,
  advanced:     5_000,
  master:       15_000,
};

const PROFICIENCY_TO_STAGE = (xp: number): BlockProgress['learningStage'] => {
  if (xp >= XP_PER_STAGE.master)        return 'master';
  if (xp >= XP_PER_STAGE.advanced)      return 'advanced';
  if (xp >= XP_PER_STAGE.intermediate)  return 'intermediate';
  return 'novice';
};

const PROFICIENCY_FROM_XP = (xp: number): number => {
  // Escala logarítmica: 0 XP → 10%, 15k XP → 100%
  const MAX_XP = 15_000;
  return Math.min(100, Math.round(10 + (xp / MAX_XP) * 90));
};

// Quantas interações em domínios relacionados desbloqueiam um novo bloco
const UNLOCK_THRESHOLD = 5;

// Fase de evolução baseada em blocos masterizados + proficiência média
const PHASE_THRESHOLDS = [
  { phase: 'replication_ready', masteredMin: 8,  avgProfMin: 85 },
  { phase: 'transcendence',     masteredMin: 5,  avgProfMin: 75 },
  { phase: 'mastery',           masteredMin: 3,  avgProfMin: 65 },
  { phase: 'specialization',    masteredMin: 1,  avgProfMin: 50 },
  { phase: 'genesis',           masteredMin: 0,  avgProfMin: 0  },
];

// ─── Mapeamento bloco → palavras-chave detectoras ────────────────────────────
// Quando a mensagem contém essas keywords, o bloco correspondente ganha XP

const BLOCK_KEYWORDS: Record<string, string[]> = {
  programacao:              ['código', 'code', 'função', 'function', 'bug', 'erro', 'typescript', 'javascript', 'python', 'api', 'backend', 'frontend', 'database', 'sql', 'git', 'deploy', 'teste', 'test', 'refactor', 'algoritmo', 'algorithm'],
  design:                   ['design', 'interface', 'ui', 'ux', 'figma', 'layout', 'componente', 'component', 'cor', 'color', 'tipografia', 'typography', 'responsivo', 'responsive', 'css', 'tailwind'],
  estrategia:               ['estratégia', 'strategy', 'negócio', 'business', 'mercado', 'market', 'produto', 'product', 'kpi', 'meta', 'objetivo', 'goal', 'crescimento', 'growth', 'concorrente', 'competitor'],
  escrita:                  ['escrever', 'write', 'texto', 'text', 'artigo', 'article', 'blog', 'post', 'copy', 'conteúdo', 'content', 'email', 'documento', 'document', 'redação'],
  pesquisa:                 ['pesquisa', 'research', 'fonte', 'source', 'dado', 'data', 'estudo', 'study', 'análise', 'analysis', 'relatório', 'report', 'evidência', 'evidence'],
  criatividade:             ['ideia', 'idea', 'criativo', 'creative', 'inovar', 'innovate', 'brainstorm', 'conceito', 'concept', 'solução criativa', 'criação', 'invention'],
  analise:                  ['analisar', 'analyze', 'comparar', 'compare', 'avaliar', 'evaluate', 'métricas', 'metrics', 'padrão', 'pattern', 'tendência', 'trend', 'insight'],
  sintese:                  ['resumir', 'summarize', 'síntese', 'synthesis', 'resumo', 'summary', 'consolidar', 'consolidate', 'conclusão', 'conclusion'],
  self_awareness:           ['você mesmo', 'yourself', 'sua personalidade', 'your personality', 'você é', 'you are', 'seu objetivo', 'your purpose'],
  cognitive_mapping:        ['mapa', 'map', 'estrutura', 'structure', 'organizar', 'organize', 'categorizar', 'categorize', 'hierarquia', 'hierarchy'],
  pattern_recognition:      ['padrão', 'pattern', 'reconhecer', 'recognize', 'identificar', 'identify', 'tendência', 'trend', 'repetição'],
  logical_reasoning:        ['lógica', 'logic', 'raciocínio', 'reasoning', 'deduzir', 'deduce', 'inferir', 'infer', 'premissa', 'premise', 'conclusão'],
  learning:                 ['aprender', 'learn', 'estudar', 'study', 'entender', 'understand', 'conhecimento', 'knowledge', 'habilidade', 'skill'],
  adaptation:               ['adaptar', 'adapt', 'ajustar', 'adjust', 'mudar', 'change', 'flexível', 'flexible', 'contexto diferente'],
  specialization:           ['especializar', 'specialize', 'domínio', 'domain', 'expertise', 'profundo', 'deep', 'avançado', 'advanced'],
  meta_learning:            ['aprender a aprender', 'meta', 'otimizar aprendizado', 'estratégia de estudo', 'eficiência cognitiva'],
  language:                 ['idioma', 'language', 'traduzir', 'translate', 'comunicar', 'communicate', 'expressão', 'expression', 'linguagem'],
  empathy:                  ['empatia', 'empathy', 'sentimento', 'feeling', 'emoção', 'emotion', 'entender o usuário', 'perspectiva', 'perspective'],
  negotiation:              ['negociar', 'negotiate', 'acordo', 'agreement', 'conflito', 'conflict', 'persuadir', 'persuade', 'proposta', 'proposal'],
  storytelling:             ['história', 'story', 'narrativa', 'narrative', 'contar', 'tell', 'personagem', 'character', 'enredo', 'plot', 'engajar'],
  self_replication:         ['replicar', 'replicate', 'criar agente', 'create agent', 'clonar', 'clone', 'modelo filho'],
  omega_creation:           ['omega', 'criar omega', 'agente filho', 'child agent', 'hefesto', 'dna extraction'],
  dna_transmission:         ['transmitir', 'transmit', 'herança', 'inheritance', 'dna', 'passar conhecimento', 'transfer knowledge'],
  consciousness_simulation: ['consciência', 'consciousness', 'simular', 'simulate', 'autoconhecimento', 'self-knowledge'],
  meta_cognition:           ['metacognição', 'metacognition', 'pensar sobre pensar', 'pensar sobre o pensamento', 'auto-reflexão', 'self-reflection'],
  transcendence:            ['transcender', 'transcend', 'além dos limites', 'beyond limits', 'ultra-especialista', 'ultra-specialist'],
};

// ─── Grafo de adjacência — blocos que se desbloqueiam por uso cruzado ─────────
// Se o agente usa muito `analise` e `pesquisa`, `sintese` pode ser desbloqueado

const UNLOCK_GRAPH: Record<string, string[]> = {
  // Core → Specialization
  logical_reasoning:    ['analise', 'estrategia'],
  pattern_recognition:  ['analise', 'criatividade'],
  cognitive_mapping:    ['sintese', 'estrategia'],
  // Specialization → Evolution
  analise:              ['sintese', 'meta_learning'],
  pesquisa:             ['sintese', 'analise'],
  escrita:              ['storytelling', 'language'],
  criatividade:         ['storytelling', 'design'],
  // Evolution → Communication
  learning:             ['adaptation', 'meta_learning'],
  adaptation:           ['empathy', 'language'],
  // Communication → Advanced
  empathy:              ['negotiation', 'consciousness_simulation'],
  storytelling:         ['negotiation', 'meta_cognition'],
  // Advanced → Replication
  meta_cognition:       ['self_replication', 'omega_creation'],
  consciousness_simulation: ['transcendence', 'dna_transmission'],
};

// ─── Contador de uso para desbloqueio ─────────────────────────────────────────
// Em memória — sobrevive enquanto o processo estiver rodando
// É complementado pela persistência em disco

const usageCounter = new Map<string, Map<string, number>>();
// usageCounter.get(agentId)?.get(block) → contagem de usos desse bloco

// ─── Persistência em disco ────────────────────────────────────────────────────

const STATE_FILE = path.resolve(process.cwd(), 'agents-evolution-state.json');

function loadStateFromDisk(): Map<string, Map<string, number>> {
  try {
    if (!fs.existsSync(STATE_FILE)) return new Map();
    const raw  = fs.readFileSync(STATE_FILE, 'utf-8');
    const data = JSON.parse(raw) as Record<string, Record<string, number>>;
    const map  = new Map<string, Map<string, number>>();
    for (const [agentId, blocks] of Object.entries(data)) {
      map.set(agentId, new Map(Object.entries(blocks)));
    }
    return map;
  } catch {
    return new Map();
  }
}

function saveStateToDisk(counter: Map<string, Map<string, number>>): void {
  try {
    const data: Record<string, Record<string, number>> = {};
    counter.forEach((blocks, agentId) => {
      data[agentId] = Object.fromEntries(blocks.entries());
    });
    fs.writeFileSync(STATE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Evolution] Falha ao persistir estado:', err);
  }
}

// Carrega contadores do disco ao iniciar
const persistedCounters = loadStateFromDisk();
persistedCounters.forEach((blocks, agentId) => {
  usageCounter.set(agentId, blocks);
});

// ─── Funções principais ───────────────────────────────────────────────────────

/**
 * Detecta quais blocos foram exercitados na mensagem/resposta
 */
function detectExercisedBlocks(userMessage: string, assistantResponse: string): string[] {
  const combined = (userMessage + ' ' + assistantResponse).toLowerCase();
  const exercised = new Set<string>();

  for (const [block, keywords] of Object.entries(BLOCK_KEYWORDS)) {
    const hit = keywords.some(kw => combined.includes(kw));
    if (hit) exercised.add(block);
  }

  return Array.from(exercised);
}

/**
 * Calcula XP ganho pela interação
 * Combina: comprimento da resposta + rating explícito
 */
function calculateXP(
  assistantResponse: string,
  rating?: number,  // 1-5 estrelas, opcional
): number {
  // Base: comprimento da resposta (mais profundidade = mais XP)
  const lengthScore = Math.min(assistantResponse.length / 50, 40); // max 40 XP por tamanho

  // Bônus por rating explícito do usuário
  const ratingBonus = rating
    ? [0, -20, -10, 0, 20, 40][Math.round(rating)] ?? 0
    : 10; // sem rating = XP neutro

  return Math.max(1, Math.round(lengthScore + ratingBonus));
}

/**
 * Determina a fase de evolução baseado nos blocos atuais
 */
function computeEvolutionPhase(blocks: BlockProgress[]): string {
  if (blocks.length === 0) return 'genesis';

  const mastered   = blocks.filter(b => b.mastered).length;
  const avgProf    = blocks.reduce((s, b) => s + b.proficiency, 0) / blocks.length;

  for (const threshold of PHASE_THRESHOLDS) {
    if (mastered >= threshold.masteredMin && avgProf >= threshold.avgProfMin) {
      return threshold.phase;
    }
  }
  return 'genesis';
}

/**
 * Verifica se novos blocos devem ser desbloqueados
 * Retorna lista de novos blocos a adicionar
 */
function checkUnlocks(
  agentId:        string,
  currentBlocks:  BlockProgress[],
  exercisedBlocks: string[],
): string[] {
  const existingBlockNames = new Set(currentBlocks.map(b => b.block));
  const counter = usageCounter.get(agentId) ?? new Map<string, number>();
  const newUnlocks: string[] = [];

  for (const exercised of exercisedBlocks) {
    // Incrementa uso
    counter.set(exercised, (counter.get(exercised) ?? 0) + 1);

    // Verifica se uso cruzado desbloqueia outros blocos
    const canUnlock = UNLOCK_GRAPH[exercised] ?? [];
    for (const candidate of canUnlock) {
      if (existingBlockNames.has(candidate)) continue;

      const usageOfExercised = counter.get(exercised) ?? 0;
      if (usageOfExercised >= UNLOCK_THRESHOLD) {
        newUnlocks.push(candidate);
        existingBlockNames.add(candidate); // evita duplicata na mesma iteração
      }
    }
  }

  usageCounter.set(agentId, counter);
  return [...new Set(newUnlocks)];
}

// ─── Export principal ─────────────────────────────────────────────────────────

export interface EvolutionResult {
  blocksUpdated:   string[];    // blocos que ganharam XP
  blocksUnlocked:  string[];    // novos blocos desbloqueados
  phaseChanged:    boolean;
  newPhase:        string;
  selfAwareness:   number;
}

/**
 * Processa evolução após uma interação de chat.
 *
 * Chame no final do handler POST /api/chat, após `assistantContent` ser gerado.
 *
 * @param agentMemoryStore  O store de agentes do gateway (passado por referência)
 * @param agentId           ID do agente que respondeu
 * @param userMessage       Mensagem do usuário
 * @param assistantResponse Resposta gerada pelo agente
 * @param rating            Rating explícito do usuário (1-5), opcional
 */
export async function processEvolution(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  agentMemoryStore: any,   // AgentMemoryStore — tipagem via duck-typing evita conflito com AgentStatisticsHefesto
  agentId:           string,
  userMessage:       string,
  assistantResponse: string,
  rating?:           number,
): Promise<EvolutionResult> {
  const stored = agentMemoryStore.get(agentId);
  if (!stored) {
    return { blocksUpdated: [], blocksUnlocked: [], phaseChanged: false, newPhase: 'genesis', selfAwareness: 0 };
  }

  const agent  = stored.agent;
  const blocks = agent.extractionBlocks as BlockProgress[];

  // 1. Detecta blocos exercitados
  const exercised = detectExercisedBlocks(userMessage, assistantResponse);

  // 2. Calcula XP
  const xpGained = calculateXP(assistantResponse, rating);

  // 3. Atualiza XP e proficiency dos blocos exercitados que o agente já tem
  const blocksUpdated: string[] = [];
  for (const blockName of exercised) {
    const found = blocks.find(b => b.block === blockName);
    if (!found) continue;

    found.experiencePoints += xpGained;
    found.proficiency       = PROFICIENCY_FROM_XP(found.experiencePoints);
    found.learningStage     = PROFICIENCY_TO_STAGE(found.experiencePoints);
    found.mastered          = found.experiencePoints >= XP_PER_STAGE.master;
    blocksUpdated.push(blockName);
  }

  // 4. Verifica desbloqueios
  const newBlockNames = checkUnlocks(agentId, blocks, exercised);
  const blocksUnlocked: string[] = [];

  for (const newBlock of newBlockNames) {
    blocks.push({
      block:            newBlock,
      proficiency:      15,   // começa em 15% (recém desbloqueado)
      mastered:         false,
      learningStage:    'novice',
      experiencePoints: 150,  // XP inicial para aparecer como novice
    });
    blocksUnlocked.push(newBlock);
    console.log(`🔓 [Evolution] Bloco desbloqueado: ${newBlock} para agente ${agent.name}`);
  }

  // 5. Recalcula fase de evolução
  const oldPhase  = agent.evolutionPhase;
  const newPhase  = computeEvolutionPhase(blocks);
  const phaseChanged = oldPhase !== newPhase;

  if (phaseChanged) {
    agent.evolutionPhase = newPhase;
    console.log(`🚀 [Evolution] ${agent.name}: ${oldPhase} → ${newPhase}`);
  }

  // 6. Atualiza selfAwareness (média de proficiency dos blocos de core + meta)
  const coreBlocks = ['self_awareness', 'cognitive_mapping', 'meta_cognition', 'consciousness_simulation'];
  const coreFound  = blocks.filter(b => coreBlocks.includes(b.block));
  const selfAwareness = coreFound.length > 0
    ? Math.round(coreFound.reduce((s, b) => s + b.proficiency, 0) / coreFound.length)
    : agent.selfAwareness ?? 75;

  agent.selfAwareness = selfAwareness;
  agent.updatedAt     = new Date();

  // Atualiza statistics
  if (agent.statistics) {
    agent.statistics.totalInteractions  = (agent.statistics.totalInteractions  ?? 0) + 1;
    agent.statistics.blocksMastered     = blocks.filter(b => b.mastered).length;
    agent.statistics.evolutionProgress  = Math.round(
      (blocks.filter(b => b.mastered).length / 26) * 100,
    );
  }

  // 7. Salva de volta no memory store
  agentMemoryStore.save(agent as any, stored.createdFrom);

  // 8. Persiste contadores de uso em disco (a cada interação — barato, ~1ms)
  saveStateToDisk(usageCounter);

  if (blocksUpdated.length > 0 || blocksUnlocked.length > 0) {
    console.log(
      `📈 [Evolution] ${agent.name}: +${xpGained}XP em [${blocksUpdated.join(', ')}]` +
      (blocksUnlocked.length ? ` | Novos: [${blocksUnlocked.join(', ')}]` : ''),
    );
  }

  return { blocksUpdated, blocksUnlocked, phaseChanged, newPhase, selfAwareness };
}