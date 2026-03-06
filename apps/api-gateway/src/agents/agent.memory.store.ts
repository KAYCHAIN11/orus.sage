// Gerencia: agentes salvos + memória por workspace
import { OmegaAgent } from '../../../omega-agents-service/src/agents/core/omega.dna.hefesto';

export interface AgentMemoryEntry {
  userMessage: string;
  agentResponse: string;
  workspaceId: string;
  timestamp: Date;
  learned: string; // insight extraído da conversa
}

export interface StoredAgent {
  agent: OmegaAgent;
  createdFrom: 'dna_extraction' | 'fragment_file' | 'preset';
  sourceFile?: string;       // nome do fragmento se veio de arquivo
  activeWorkspaces: string[]; // em quais workspaces está ativo
  memory: Map<string, AgentMemoryEntry[]>; // workspaceId → histórico
  globalMemory: string[];    // insights que valem para qualquer workspace
}

export class AgentMemoryStore {
  private agents: Map<string, StoredAgent> = new Map();

  // ── SALVAR AGENTE ──────────────────────────────────────
  save(agent: OmegaAgent, createdFrom: StoredAgent['createdFrom'], sourceFile?: string): StoredAgent {
    const stored: StoredAgent = {
      agent,
      createdFrom,
      sourceFile,
      activeWorkspaces: [],
      memory: new Map(),
      globalMemory: [],
    };
    this.agents.set(agent.id, stored);
    return stored;
  }

  // ── ATIVAR EM WORKSPACE ────────────────────────────────
  activateInWorkspace(agentId: string, workspaceId: string): boolean {
    const stored = this.agents.get(agentId);
    if (!stored) return false;
    if (!stored.activeWorkspaces.includes(workspaceId)) {
      stored.activeWorkspaces.push(workspaceId);
      stored.agent.workspaceId = workspaceId;
    }
    return true;
  }

  // ── ADICIONAR MEMÓRIA ──────────────────────────────────
  addMemory(agentId: string, workspaceId: string, entry: Omit<AgentMemoryEntry, 'workspaceId'>): void {
    const stored = this.agents.get(agentId);
    if (!stored) return;

    if (!stored.memory.has(workspaceId)) {
      stored.memory.set(workspaceId, []);
    }
    stored.memory.get(workspaceId)!.push({ ...entry, workspaceId });

    // Manter apenas últimas 50 interações por workspace
    const wsMemory = stored.memory.get(workspaceId)!;
    if (wsMemory.length > 50) wsMemory.shift();
  }

  // ── OBTER MEMÓRIA DO CONTEXTO ──────────────────────────
  getContextMemory(agentId: string, workspaceId: string): string {
    const stored = this.agents.get(agentId);
    if (!stored) return '';

    const wsMemory = stored.memory.get(workspaceId) ?? [];
    const recentMemory = wsMemory.slice(-10); // últimas 10 interações

    if (!recentMemory.length && !stored.globalMemory.length) return '';

    let context = '\n═══ MEMÓRIA DO AGENTE NESTE WORKSPACE ═══\n';

    if (stored.globalMemory.length) {
      context += '\nInsights globais:\n';
      stored.globalMemory.forEach(g => context += `• ${g}\n`);
    }

    if (recentMemory.length) {
      context += '\nInterações recentes neste projeto:\n';
      recentMemory.forEach(m => {
        context += `User: ${m.userMessage.slice(0, 100)}\n`;
        context += `Você: ${m.agentResponse.slice(0, 150)}\n`;
        if (m.learned) context += `[Aprendido: ${m.learned}]\n`;
        context += '---\n';
      });
    }

    return context;
  }

  // ── BUSCAR AGENTE ──────────────────────────────────────
  get(agentId: string): StoredAgent | undefined {
    return this.agents.get(agentId);
  }

  // ── LISTAR TODOS ───────────────────────────────────────
  listAll(): StoredAgent[] {
    return Array.from(this.agents.values());
  }

  // ── LISTAR POR WORKSPACE ───────────────────────────────
  listByWorkspace(workspaceId: string): StoredAgent[] {
    return Array.from(this.agents.values())
      .filter(s => s.activeWorkspaces.includes(workspaceId));
  }

  // ── SERIALIZAR (para persistir em arquivo/DB) ──────────
  serialize(): object {
    const result: any = {};
    this.agents.forEach((stored, id) => {
      result[id] = {
        ...stored,
        memory: Object.fromEntries(stored.memory),
      };
    });
    return result;
  }
}

// Singleton — mesma instância em todo o gateway
export const agentMemoryStore = new AgentMemoryStore();
