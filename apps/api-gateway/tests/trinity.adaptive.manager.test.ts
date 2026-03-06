type TrinityMode = 'trinity_native' | 'api_external';

interface AdaptiveState {
  currentMode: TrinityMode;
  lastSwitch: Date | null;
  switchCount: number;
  trinityHealthy: boolean;
}

class TrinityAdaptiveManager {
  private state: AdaptiveState = {
    currentMode: 'api_external',
    lastSwitch: null,
    switchCount: 0,
    trinityHealthy: false,
  };

  getState(): AdaptiveState {
    return { ...this.state };
  }

  switchMode(mode: TrinityMode): void {
    this.state.currentMode = mode;
    this.state.lastSwitch = new Date();
    this.state.switchCount++;
  }

  setTrinityHealth(healthy: boolean): void {
    this.state.trinityHealthy = healthy;
    if (!healthy && this.state.currentMode === 'trinity_native') {
      this.switchMode('api_external');
    }
  }

  getCurrentMode(): TrinityMode {
    return this.state.currentMode;
  }
}

describe('TrinityAdaptiveManager', () => {
  let manager: TrinityAdaptiveManager;

  beforeEach(() => {
    manager = new TrinityAdaptiveManager();
  });

  it('deve iniciar com modo api_external', () => {
    expect(manager.getCurrentMode()).toBe('api_external');
  });

  it('deve registrar troca de modo', () => {
    manager.switchMode('api_external');
    const state = manager.getState();
    expect(state.switchCount).toBe(1);
    expect(state.lastSwitch).not.toBeNull();
  });

  it('deve fazer fallback para api_external quando Trinity unhealthy', () => {
    manager.switchMode('trinity_native');
    manager.setTrinityHealth(false);
    expect(manager.getCurrentMode()).toBe('api_external');
  });

  it('deve manter trinity_native quando healthy', () => {
    manager.setTrinityHealth(true);
    manager.switchMode('trinity_native');
    manager.setTrinityHealth(true);
    expect(manager.getCurrentMode()).toBe('trinity_native');
  });

  it('deve contar trocas de modo corretamente', () => {
    manager.switchMode('api_external');
    manager.switchMode('api_external');
    manager.switchMode('api_external');
    expect(manager.getState().switchCount).toBe(3);
  });
});
