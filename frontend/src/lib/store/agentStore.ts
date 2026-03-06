// lib/store/agentStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Tipos base ───────────────────────────────────────────────────────────────

export interface AgentStats {
  totalTokens:    number;
  interactions:   number;
  memoryBlocks:   number;
  evolutionLevel: number;
}

export interface OmegaAgent {
  id:          string;
  name:        string;
  type:        'preset' | 'custom';
  description: string;
  specialty:   string;
  level:       'MICRO_AGENTE' | 'AGENTE' | 'SUPER_AGENTE' | 'ALFA' | 'OMEGA';
  stats:       AgentStats;
  createdAt:   string;
  isActive:    boolean;
  // DNA completo preservado (só agentes custom via Hefesto)
  hefestoDNA?: Record<string, unknown>;
}

// ─── Progressão de nível ──────────────────────────────────────────────────────

function computeLevel(stats: AgentStats): OmegaAgent['level'] {
  const score =
    (stats.totalTokens  / 1000) +
    (stats.interactions * 2)    +
    (stats.memoryBlocks * 5);
  if (score >= 500) return 'OMEGA';
  if (score >= 200) return 'ALFA';
  if (score >= 80)  return 'SUPER_AGENTE';
  if (score >= 20)  return 'AGENTE';
  return 'MICRO_AGENTE';
}

// ─── Mapeamento evolutionPhase → level ───────────────────────────────────────

const PHASE_TO_LEVEL: Record<string, OmegaAgent['level']> = {
  genesis:           'MICRO_AGENTE',
  specialization:    'AGENTE',
  mastery:           'SUPER_AGENTE',
  transcendence:     'ALFA',
  replication_ready: 'OMEGA',
};

// ─── Presets locais ───────────────────────────────────────────────────────────

const PRESET_AGENTS: OmegaAgent[] = [
  { id: 'preset-programador',  name: 'Code Master',     type: 'preset', specialty: 'TypeScript / React / Node', description: 'Especialista em desenvolvimento full-stack', level: 'AGENTE', stats: { totalTokens: 0, interactions: 0, memoryBlocks: 0, evolutionLevel: 0 }, createdAt: new Date().toISOString(), isActive: false },
  { id: 'preset-designer',     name: 'UI Architect',    type: 'preset', specialty: 'Design Systems / Figma',   description: 'Design de interfaces e sistemas visuais',  level: 'AGENTE', stats: { totalTokens: 0, interactions: 0, memoryBlocks: 0, evolutionLevel: 0 }, createdAt: new Date().toISOString(), isActive: false },
  { id: 'preset-estrategista', name: 'Estrategista',    type: 'preset', specialty: 'Produto / Negócios',       description: 'Estratégia e planejamento de produto',      level: 'AGENTE', stats: { totalTokens: 0, interactions: 0, memoryBlocks: 0, evolutionLevel: 0 }, createdAt: new Date().toISOString(), isActive: false },
  { id: 'preset-writer',       name: 'Content Writer',  type: 'preset', specialty: 'Copywriting / SEO',        description: 'Redação, conteúdo e comunicação',           level: 'AGENTE', stats: { totalTokens: 0, interactions: 0, memoryBlocks: 0, evolutionLevel: 0 }, createdAt: new Date().toISOString(), isActive: false },
  { id: 'preset-pesquisador',  name: 'Pesquisador',     type: 'preset', specialty: 'Research / Análise',       description: 'Pesquisa profunda e síntese de dados',      level: 'AGENTE', stats: { totalTokens: 0, interactions: 0, memoryBlocks: 0, evolutionLevel: 0 }, createdAt: new Date().toISOString(), isActive: false },
  { id: 'preset-quick',        name: 'ORUS Quick',      type: 'preset', specialty: 'Generalista',              description: 'Respostas rápidas e diretas',               level: 'AGENTE', stats: { totalTokens: 0, interactions: 0, memoryBlocks: 0, evolutionLevel: 0 }, createdAt: new Date().toISOString(), isActive: false },
];

// ─── Store interface ──────────────────────────────────────────────────────────

interface AgentStore {
  agents:       OmegaAgent[];
  activeAgent:  OmegaAgent | null;
  isLoading:    boolean;

  fetchAgents:   () => Promise<void>;
  activateAgent: (id: string) => Promise<void>;
  updateStats:   (id: string, delta: Partial<AgentStats>) => void;
  computeLevel:  (stats: AgentStats) => OmegaAgent['level'];

  // ── Hefesto: extrai via backend e injeta no store ──────
  hefestoExtract: (
    objective:   string,
    workspaceId?: string,
    provider?:   'groq' | 'claude' | 'gpt' | 'deepseek'
  ) => Promise<OmegaAgent>;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAgentStore = create<AgentStore>()(
  persist(
    (set, get) => ({
      agents:      PRESET_AGENTS,
      activeAgent: null,
      isLoading:   false,
      computeLevel,

      // ── fetchAgents ─────────────────────────────────────
      fetchAgents: async () => {
        set({ isLoading: true });
        try {
          const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

          const savedRes = await fetch(`${API}/api/agents/saved`).catch(() => null);

          const saved: OmegaAgent[] = [];
          if (savedRes?.ok) {
            const data = await savedRes.json();
            (data.agents ?? []).forEach((a: any) => {
              saved.push({
                id:          a.id,
                name:        a.name        ?? 'Agente Custom',
                type:        'custom',
                specialty:   a.specialty   ?? (a.specializationDomains?.join(', ') ?? 'Custom'),
                description: a.description ?? '',
                level:
                  PHASE_TO_LEVEL[a.evolutionPhase] ??
                  computeLevel(a.stats ?? { totalTokens: 0, interactions: 0, memoryBlocks: 0, evolutionLevel: 0 }),
                stats:     a.stats ?? { totalTokens: 0, interactions: 0, memoryBlocks: 0, evolutionLevel: 0 },
                createdAt: a.createdAt ?? new Date().toISOString(),
                isActive:  false,
              });
            });
          }

          // Presets locais + custom do backend (sem duplicar)
          const existingIds = new Set(PRESET_AGENTS.map(p => p.id));
          const merged = [
            ...PRESET_AGENTS,
            ...saved.filter(s => !existingIds.has(s.id)),
          ];
          set({ agents: merged });
        } catch {
          // Fallback silencioso — mantém presets locais
        } finally {
          set({ isLoading: false });
        }
      },

      // ── activateAgent ───────────────────────────────────
      activateAgent: async (id: string) => {
        const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
        try {
          await fetch(`${API}/api/agents/${id}/activate`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ workspaceId: 'ws-default' }),
          });
        } catch { /* offline-first */ }

        set(s => ({
          activeAgent: s.agents.find(a => a.id === id) ?? null,
          agents:      s.agents.map(a => ({ ...a, isActive: a.id === id })),
        }));
      },

      // ── updateStats ─────────────────────────────────────
      updateStats: (id, delta) => {
        set(s => ({
          agents: s.agents.map(a => {
            if (a.id !== id) return a;
            const newStats: AgentStats = {
              totalTokens:    (a.stats.totalTokens    ?? 0) + (delta.totalTokens    ?? 0),
              interactions:   (a.stats.interactions   ?? 0) + (delta.interactions   ?? 0),
              memoryBlocks:   (a.stats.memoryBlocks   ?? 0) + (delta.memoryBlocks   ?? 0),
              evolutionLevel: (a.stats.evolutionLevel ?? 0) + (delta.evolutionLevel ?? 0),
            };
            return { ...a, stats: newStats, level: computeLevel(newStats) };
          }),
        }));
      },

      // ── hefestoExtract ──────────────────────────────────
      // Chama o backend → Groq extrai DNA → salva no agentMemoryStore
      // → injeta no store local → retorna OmegaAgent
      hefestoExtract: async (
        objective:   string,
        workspaceId  = 'ws-default',
        provider     = 'groq',
      ) => {
        const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

        const res = await fetch(`${API}/api/agents/hefesto/extract`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ objective, workspaceId }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'Erro desconhecido' }));
          throw new Error(err.error ?? `HTTP ${res.status}`);
        }

        const { agent: raw } = await res.json();

        // Mapeia DNA completo → OmegaAgent (compatível com store)
        const level: OmegaAgent['level'] =
          PHASE_TO_LEVEL[raw.evolutionPhase] ?? 'AGENTE';

        const compatible: OmegaAgent = {
          id:          raw.id,
          name:        raw.name,
          type:        'custom',
          specialty:   Array.isArray(raw.specializationDomains)
                         ? raw.specializationDomains.join(', ')
                         : (raw.specializationDomains ?? 'Custom'),
          description: raw.description,
          level,
          stats: {
            totalTokens:    raw.statistics?.totalTokensUsed  ?? 0,
            interactions:   raw.statistics?.totalInteractions ?? 0,
            memoryBlocks:   raw.statistics?.blocksMastered   ?? 0,
            evolutionLevel: raw.statistics?.evolutionProgress ?? 0,
          },
          createdAt:  raw.createdAt ?? new Date().toISOString(),
          isActive:   false,
          hefestoDNA: raw, // DNA completo preservado
        };

        // Injeta no store sem duplicar
        set(s => {
          const exists = s.agents.some(a => a.id === compatible.id);
          return {
            agents: exists
              ? s.agents.map(a => a.id === compatible.id ? compatible : a)
              : [...s.agents, compatible],
          };
        });

        return compatible;
      },
    }),
    {
      name: 'orus-agent-store-v3',
      // Não persistir hefestoDNA no localStorage (pode ser grande)
      partialize: (state) => ({
        agents: state.agents.map(a => ({ ...a, hefestoDNA: undefined })),
        activeAgent: state.activeAgent
          ? { ...state.activeAgent, hefestoDNA: undefined }
          : null,
      }),
    }
  )
);