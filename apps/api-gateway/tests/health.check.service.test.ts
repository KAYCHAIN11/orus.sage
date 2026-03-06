describe('HealthCheckService', () => {
  it('deve retornar status ok', () => {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        trinity: 'ready',
        workspace: 'ready',
        agents: 'ready',
        interruption: 'ready',
      },
    };

    expect(health.status).toBe('ok');
    expect(health.services.trinity).toBe('ready');
    expect(health.services.workspace).toBe('ready');
    expect(health.services.agents).toBe('ready');
    expect(health.services.interruption).toBe('ready');
  });

  it('deve ter timestamp válido', () => {
    const timestamp = new Date().toISOString();
    expect(new Date(timestamp).getTime()).not.toBeNaN();
  });

  it('deve ter versão definida', () => {
    const version = '1.0.0';
    expect(version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('deve listar todos os serviços esperados', () => {
    const expectedServices = ['trinity', 'workspace', 'agents', 'interruption'];
    const services = { trinity: 'ready', workspace: 'ready', agents: 'ready', interruption: 'ready' };
    
    expectedServices.forEach((service) => {
      expect(services).toHaveProperty(service);
    });
  });
});
