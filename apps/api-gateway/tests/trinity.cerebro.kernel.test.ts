type ProcessingMode = 'quick' | 'deep';

interface ProcessingRequest {
  message: string;
  workspaceId: string;
  mode: ProcessingMode;
}

interface ProcessingResult {
  response: string;
  mode: ProcessingMode;
  processingTime: number;
  tokensUsed: number;
}

class TrinityCerebroKernel {
  process(request: ProcessingRequest): ProcessingResult {
    const start = Date.now();
    const response = `Processado [${request.mode.toUpperCase()}]: ${request.message}`;
    return {
      response,
      mode: request.mode,
      processingTime: Date.now() - start,
      tokensUsed: request.message.split(' ').length * 2,
    };
  }

  selectModel(mode: ProcessingMode): string {
    return mode === 'quick' ? 'claude-3-5-sonnet' : 'claude-3-opus';
  }

  estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}

describe('TrinityCerebroKernel', () => {
  let cerebro: TrinityCerebroKernel;

  beforeEach(() => {
    cerebro = new TrinityCerebroKernel();
  });

  it('deve processar requisição em modo quick', () => {
    const result = cerebro.process({
      message: 'Olá',
      workspaceId: 'ws-1',
      mode: 'quick',
    });
    expect(result.mode).toBe('quick');
    expect(result.response).toContain('QUICK');
  });

  it('deve processar requisição em modo deep', () => {
    const result = cerebro.process({
      message: 'Explique quantum computing',
      workspaceId: 'ws-1',
      mode: 'deep',
    });
    expect(result.mode).toBe('deep');
    expect(result.response).toContain('DEEP');
  });

  it('deve selecionar modelo correto para quick', () => {
    expect(cerebro.selectModel('quick')).toBe('claude-3-5-sonnet');
  });

  it('deve selecionar modelo correto para deep', () => {
    expect(cerebro.selectModel('deep')).toBe('claude-3-opus');
  });

  it('deve calcular tokens estimados', () => {
    const tokens = cerebro.estimateTokens('Hello world test');
    expect(tokens).toBeGreaterThan(0);
  });

  it('deve retornar tempo de processamento', () => {
    const result = cerebro.process({ message: 'teste', workspaceId: 'ws-1', mode: 'quick' });
    expect(result.processingTime).toBeGreaterThanOrEqual(0);
  });
});
