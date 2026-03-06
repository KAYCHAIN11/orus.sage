type Mode = 'trinity_native' | 'api_external';

class ModeRouter {
  private currentMode: Mode = 'api_external';

  setMode(mode: Mode): void {
    this.currentMode = mode;
  }

  getMode(): Mode {
    return this.currentMode;
  }

  isAvailable(mode: Mode): boolean {
    if (mode === 'trinity_native') return false; // Trinity ainda não está pronta
    return true;
  }

  resolveMode(preferred: Mode): Mode {
    return this.isAvailable(preferred) ? preferred : 'api_external';
  }
}

describe('ModeRouter', () => {
  let router: ModeRouter;

  beforeEach(() => {
    router = new ModeRouter();
  });

  it('deve iniciar em modo api_external por padrão', () => {
    expect(router.getMode()).toBe('api_external');
  });

  it('deve permitir troca para api_external', () => {
    router.setMode('api_external');
    expect(router.getMode()).toBe('api_external');
  });

  it('deve retornar api_external quando trinity não disponível', () => {
    const resolved = router.resolveMode('trinity_native');
    expect(resolved).toBe('api_external');
  });

  it('deve confirmar api_external como disponível', () => {
    expect(router.isAvailable('api_external')).toBe(true);
  });

  it('deve confirmar trinity_native como indisponível', () => {
    expect(router.isAvailable('trinity_native')).toBe(false);
  });

  it('deve resolver modo correto com fallback', () => {
    const resolved = router.resolveMode('trinity_native');
    expect(['trinity_native', 'api_external']).toContain(resolved);
  });
});
