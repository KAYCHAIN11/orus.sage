interface TrinityConfig {
  mode: 'trinity_native' | 'api_external';
  apiKey?: string;
  models: {
    quick: string;
    deep: string;
  };
  maxTokens: {
    quick: number;
    deep: number;
  };
  timeout: number;
  healthCheckInterval: number;
}

const DEFAULT_CONFIG: TrinityConfig = {
  mode: 'api_external',
  models: {
    quick: 'claude-3-5-sonnet-20241022',
    deep: 'claude-3-opus-20240229',
  },
  maxTokens: {
    quick: 2048,
    deep: 8192,
  },
  timeout: 30000,
  healthCheckInterval: 30000,
};

describe('TrinityConfig', () => {
  it('deve ter modo padrão api_external', () => {
    expect(DEFAULT_CONFIG.mode).toBe('api_external');
  });

  it('deve ter modelos definidos', () => {
    expect(DEFAULT_CONFIG.models.quick).toBeDefined();
    expect(DEFAULT_CONFIG.models.deep).toBeDefined();
  });

  it('deve ter modelo quick correto', () => {
    expect(DEFAULT_CONFIG.models.quick).toContain('sonnet');
  });

  it('deve ter modelo deep correto', () => {
    expect(DEFAULT_CONFIG.models.deep).toContain('opus');
  });

  it('deve ter maxTokens deep maior que quick', () => {
    expect(DEFAULT_CONFIG.maxTokens.deep).toBeGreaterThan(DEFAULT_CONFIG.maxTokens.quick);
  });

  it('deve ter timeout definido', () => {
    expect(DEFAULT_CONFIG.timeout).toBeGreaterThan(0);
  });

  it('deve ter healthCheckInterval definido', () => {
    expect(DEFAULT_CONFIG.healthCheckInterval).toBeGreaterThan(0);
  });

  it('deve permitir override de configuração', () => {
    const custom: TrinityConfig = { ...DEFAULT_CONFIG, timeout: 60000 };
    expect(custom.timeout).toBe(60000);
    expect(custom.mode).toBe(DEFAULT_CONFIG.mode);
  });
});
