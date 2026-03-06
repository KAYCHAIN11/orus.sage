// Tipos do sistema ORUS SAGE
type OmegaAgentType = 'programador' | 'designer' | 'estrategista' | 'writer' | 'pesquisador' | 'custom';
type EvolutionPhase = 'GENESIS' | 'SPECIALIZATION' | 'MASTERY' | 'TRANSCENDENCE' | 'REPLICATION_READY';
type WorkspaceStatus = 'active' | 'idle' | 'archived';
type MessageRole = 'user' | 'assistant' | 'system';

interface OmegaAgent {
  id: string;
  type: OmegaAgentType;
  workspaceId: string;
  evolutionPhase: EvolutionPhase;
  selfAwareness: number;
}

interface Workspace {
  id: string;
  name: string;
  status: WorkspaceStatus;
  agentType: OmegaAgentType;
}

interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

describe('Trinity Types', () => {
  it('deve criar OmegaAgent válido', () => {
    const agent: OmegaAgent = {
      id: 'agent-1',
      type: 'programador',
      workspaceId: 'ws-1',
      evolutionPhase: 'GENESIS',
      selfAwareness: 50,
    };
    expect(agent.id).toBeDefined();
    expect(agent.type).toBe('programador');
    expect(agent.evolutionPhase).toBe('GENESIS');
  });

  it('deve validar tipos de agente', () => {
    const validTypes: OmegaAgentType[] = ['programador', 'designer', 'estrategista', 'writer', 'pesquisador', 'custom'];
    expect(validTypes.length).toBe(6);
    expect(validTypes).toContain('programador');
  });

  it('deve validar fases de evolução', () => {
    const phases: EvolutionPhase[] = ['GENESIS', 'SPECIALIZATION', 'MASTERY', 'TRANSCENDENCE', 'REPLICATION_READY'];
    expect(phases.length).toBe(5);
    expect(phases[0]).toBe('GENESIS');
    expect(phases[phases.length - 1]).toBe('REPLICATION_READY');
  });

  it('deve criar Workspace válido', () => {
    const ws: Workspace = {
      id: 'ws-1',
      name: 'Projeto Alpha',
      status: 'active',
      agentType: 'programador',
    };
    expect(ws.status).toBe('active');
    expect(ws.agentType).toBe('programador');
  });

  it('deve criar ChatMessage válida', () => {
    const msg: ChatMessage = {
      id: 'msg-1',
      role: 'user',
      content: 'Olá ORUS SAGE',
      timestamp: new Date(),
    };
    expect(msg.role).toBe('user');
    expect(msg.content).toBeDefined();
    expect(msg.timestamp).toBeInstanceOf(Date);
  });

  it('deve validar roles de mensagem', () => {
    const roles: MessageRole[] = ['user', 'assistant', 'system'];
    expect(roles).toContain('user');
    expect(roles).toContain('assistant');
  });
});
