interface Memory {
  id: string;
  workspaceId: string;
  content: string;
  type: 'message' | 'context' | 'knowledge';
  createdAt: Date;
}

class TrinityAlmaOrchestrator {
  private memories: Map<string, Memory[]> = new Map();

  store(workspaceId: string, content: string, type: Memory['type']): Memory {
    const memory: Memory = {
      id: `mem-${Date.now()}`,
      workspaceId,
      content,
      type,
      createdAt: new Date(),
    };
    const existing = this.memories.get(workspaceId) ?? [];
    this.memories.set(workspaceId, [...existing, memory]);
    return memory;
  }

  retrieve(workspaceId: string): Memory[] {
    return this.memories.get(workspaceId) ?? [];
  }

  clear(workspaceId: string): void {
    this.memories.delete(workspaceId);
  }

  getTotalCount(): number {
    let total = 0;
    this.memories.forEach((mems) => (total += mems.length));
    return total;
  }
}

describe('TrinityAlmaOrchestrator', () => {
  let alma: TrinityAlmaOrchestrator;

  beforeEach(() => {
    alma = new TrinityAlmaOrchestrator();
  });

  it('deve armazenar uma memória', () => {
    const mem = alma.store('ws-1', 'Conteúdo de teste', 'message');
    expect(mem.id).toBeDefined();
    expect(mem.workspaceId).toBe('ws-1');
    expect(mem.content).toBe('Conteúdo de teste');
  });

  it('deve recuperar memórias por workspace', () => {
    alma.store('ws-1', 'msg 1', 'message');
    alma.store('ws-1', 'msg 2', 'context');
    const mems = alma.retrieve('ws-1');
    expect(mems.length).toBe(2);
  });

  it('deve isolar memórias entre workspaces', () => {
    alma.store('ws-1', 'para ws1', 'message');
    alma.store('ws-2', 'para ws2', 'message');
    expect(alma.retrieve('ws-1').length).toBe(1);
    expect(alma.retrieve('ws-2').length).toBe(1);
  });

  it('deve retornar array vazio para workspace sem memórias', () => {
    expect(alma.retrieve('ws-inexistente')).toEqual([]);
  });

  it('deve limpar memórias de um workspace', () => {
    alma.store('ws-1', 'msg', 'message');
    alma.clear('ws-1');
    expect(alma.retrieve('ws-1').length).toBe(0);
  });

  it('deve contar total de memórias', () => {
    alma.store('ws-1', 'a', 'message');
    alma.store('ws-1', 'b', 'message');
    alma.store('ws-2', 'c', 'message');
    expect(alma.getTotalCount()).toBe(3);
  });
});
