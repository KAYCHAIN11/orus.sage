interface VozMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  streaming?: boolean;
  chunks?: string[];
}

class TrinityVozInterface {
  private messageHistory: VozMessage[] = [];

  formatResponse(content: string, role: 'user' | 'assistant'): VozMessage {
    return {
      id: `voz-${Date.now()}`,
      content,
      role,
      streaming: false,
    };
  }

  addToHistory(message: VozMessage): void {
    this.messageHistory.push(message);
  }

  getHistory(): VozMessage[] {
    return [...this.messageHistory];
  }

  clearHistory(): void {
    this.messageHistory = [];
  }

  simulateStream(content: string): string[] {
    return content.split(' ').map((word) => word + ' ');
  }

  buildSystemPrompt(agentType: string): string {
    const prompts: Record<string, string> = {
      programador: 'Você é um expert em programação TypeScript e arquitetura de software.',
      designer: 'Você é um expert em UI/UX design e design systems.',
      estrategista: 'Você é um expert em estratégia de negócios e produto.',
    };
    return prompts[agentType] ?? 'Você é um assistente ORUS SAGE.';
  }
}

describe('TrinityVozInterface', () => {
  let voz: TrinityVozInterface;

  beforeEach(() => {
    voz = new TrinityVozInterface();
  });

  it('deve formatar mensagem do usuário', () => {
    const msg = voz.formatResponse('Olá', 'user');
    expect(msg.role).toBe('user');
    expect(msg.content).toBe('Olá');
    expect(msg.id).toBeDefined();
  });

  it('deve formatar resposta do assistente', () => {
    const msg = voz.formatResponse('Olá! Como posso ajudar?', 'assistant');
    expect(msg.role).toBe('assistant');
  });

  it('deve adicionar e recuperar histórico', () => {
    voz.addToHistory(voz.formatResponse('msg 1', 'user'));
    voz.addToHistory(voz.formatResponse('resp 1', 'assistant'));
    expect(voz.getHistory().length).toBe(2);
  });

  it('deve limpar histórico', () => {
    voz.addToHistory(voz.formatResponse('msg', 'user'));
    voz.clearHistory();
    expect(voz.getHistory().length).toBe(0);
  });

  it('deve simular streaming em chunks', () => {
    const chunks = voz.simulateStream('Olá mundo teste');
    expect(chunks.length).toBe(3);
  });

  it('deve construir system prompt para programador', () => {
    const prompt = voz.buildSystemPrompt('programador');
    expect(prompt).toContain('programação');
  });

  it('deve construir system prompt para designer', () => {
    const prompt = voz.buildSystemPrompt('designer');
    expect(prompt).toContain('design');
  });

  it('deve retornar prompt padrão para tipo desconhecido', () => {
    const prompt = voz.buildSystemPrompt('desconhecido');
    expect(prompt).toContain('ORUS SAGE');
  });
});
