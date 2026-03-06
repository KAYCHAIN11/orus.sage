/**
 * @alphalang/blueprint
 * @component: AgentInstanceManager
 * @cognitive-signature: Instance-Lifecycle, Resource-Management, Scaling, Orchestration
 * @minerva-version: 3.0
 * @evolution-level: Production
 * @orus-sage-engine: Omega-Instance-Orchestration
 * @bloco: 3
 */

import { EventEmitter } from 'events';

export interface AgentInstance {
  instanceId: string;
  agentId: string;
  workspaceId: string;
  status: 'idle' | 'active' | 'busy' | 'error' | 'terminated';
  createdAt: Date;
  lastActive: Date;
  terminatedAt?: Date;
  memoryUsage: number;
  cpuUsage: number;
  requestCount: number;
  errorCount: number;
  uptime: number;
  version: string;
}

export interface ScalingPolicy {
  minInstances: number;
  maxInstances: number;
  targetCpuUsage: number;
  targetMemoryUsage: number;
  scaleUpThreshold: number;
  scaleDownThreshold: number;
  cooldownPeriod: number;
}

export interface InstancePool {
  agentId: string;
  instances: AgentInstance[];
  policy: ScalingPolicy;
  totalRequests: number;
  averageResponseTime: number;
  healthScore: number;
}

export interface HealthCheck {
  instanceId: string;
  timestamp: Date;
  status: 'healthy' | 'degraded' | 'unhealthy';
  metrics: Record<string, any>;
  issues: string[];
}

export class AgentInstanceManager extends EventEmitter {
  private instances: Map<string, AgentInstance> = new Map();
  private pools: Map<string, InstancePool> = new Map();
  private healthChecks: Map<string, HealthCheck[]> = new Map();
  private scalingPolicies: Map<string, ScalingPolicy> = new Map();
  private logger: any;
  private defaultPolicy: ScalingPolicy = {
    minInstances: 1,
    maxInstances: 10,
    targetCpuUsage: 70,
    targetMemoryUsage: 75,
    scaleUpThreshold: 80,
    scaleDownThreshold: 30,
    cooldownPeriod: 60000
  };
  private healthCheckInterval = 30000; // 30 seconds

  constructor(private database?: any) {
    super();
  }

  /**
   * Create instance
   */
  public async createInstance(
    agentId: string,
    workspaceId: string,
    version?: string
  ): Promise<AgentInstance> {
    try {
      this.logger?.info(`Creating instance for agent ${agentId}`);

      const instance: AgentInstance = {
        instanceId: `instance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        agentId,
        workspaceId,
        status: 'idle',
        createdAt: new Date(),
        lastActive: new Date(),
        memoryUsage: 0,
        cpuUsage: 0,
        requestCount: 0,
        errorCount: 0,
        uptime: 0,
        version: version || '1.0.0'
      };

      this.instances.set(instance.instanceId, instance);

      // Initialize health checks
      this.healthChecks.set(instance.instanceId, []);
      this.startHealthMonitoring(instance.instanceId);

      // Save to database
      await this.database?.saveInstance(instance);

      this.emit('instance:created', { instanceId: instance.instanceId, agentId });
      return instance;
    } catch (error) {
      this.logger?.error('Error creating instance', error);
      throw error;
    }
  }

  /**
   * Destroy instance
   */
  public async destroyInstance(instanceId: string): Promise<void> {
    try {
      this.logger?.info(`Destroying instance ${instanceId}`);

      const instance = this.instances.get(instanceId);
      if (instance) {
        instance.status = 'terminated';
        instance.terminatedAt = new Date();

        await this.database?.updateInstance(instance);
        this.instances.delete(instanceId);
        this.healthChecks.delete(instanceId);

        this.emit('instance:destroyed', { instanceId });
      }
    } catch (error) {
      this.logger?.error('Error destroying instance', error);
      throw error;
    }
  }

  /**
   * Get active instances
   */
  public getActiveInstances(agentId: string): AgentInstance[] {
    return Array.from(this.instances.values()).filter(
      i => i.agentId === agentId && i.status !== 'terminated' && i.status !== 'error'
    );
  }

  /**
   * Scale instances
   */
  public async scaleInstances(agentId: string, targetCount: number): Promise<void> {
    try {
      this.logger?.info(`Scaling agent ${agentId} to ${targetCount} instances`);

      const current = this.getActiveInstances(agentId);

      if (current.length < targetCount) {
        // Scale up
        const needed = targetCount - current.length;
        for (let i = 0; i < needed; i++) {
          await this.createInstance(agentId, current[0]?.workspaceId || '');
        }
      } else if (current.length > targetCount) {
        // Scale down
        const excess = current.length - targetCount;
        const toDestroy = current.slice(0, excess);
        for (const instance of toDestroy) {
          await this.destroyInstance(instance.instanceId);
        }
      }

      this.emit('instances:scaled', { agentId, targetCount });
    } catch (error) {
      this.logger?.error('Error scaling instances', error);
      throw error;
    }
  }

  /**
   * Auto-scale based on metrics
   */
  public async autoScale(agentId: string): Promise<void> {
    try {
      const pool = this.pools.get(agentId);
      if (!pool) return;

      const policy = pool.policy;
      const avgCpu = this.calculateAverageCpu(pool.instances);
      const avgMemory = this.calculateAverageMemory(pool.instances);

      const currentLoad = (avgCpu + avgMemory) / 2;

      if (currentLoad > policy.scaleUpThreshold && pool.instances.length < policy.maxInstances) {
        this.logger?.info(`Auto-scaling up for ${agentId}`);
        await this.scaleInstances(agentId, Math.min(pool.instances.length + 1, policy.maxInstances));
      } else if (currentLoad < policy.scaleDownThreshold && pool.instances.length > policy.minInstances) {
        this.logger?.info(`Auto-scaling down for ${agentId}`);
        await this.scaleInstances(agentId, Math.max(pool.instances.length - 1, policy.minInstances));
      }
    } catch (error) {
      this.logger?.error('Error auto-scaling', error);
    }
  }

  /**
   * Get instance pool
   */
  public async getInstancePool(agentId: string): Promise<InstancePool> {
    try {
      let pool = this.pools.get(agentId);

      if (!pool) {
        pool = {
          agentId,
          instances: this.getActiveInstances(agentId),
          policy: this.scalingPolicies.get(agentId) || this.defaultPolicy,
          totalRequests: 0,
          averageResponseTime: 0,
          healthScore: 100
        };
        this.pools.set(agentId, pool);
      }

      // Update metrics
      pool.instances = this.getActiveInstances(agentId);
      pool.healthScore = this.calculatePoolHealth(pool);

      return pool;
    } catch (error) {
      this.logger?.error('Error getting instance pool', error);
      throw error;
    }
  }

  /**
   * Set scaling policy
   */
  public async setScalingPolicy(agentId: string, policy: ScalingPolicy): Promise<void> {
    try {
      this.scalingPolicies.set(agentId, policy);
      await this.database?.savePolicy(agentId, policy);

      this.emit('policy:updated', { agentId, policy });
    } catch (error) {
      this.logger?.error('Error setting policy', error);
      throw error;
    }
  }

  /**
   * Perform health check
   */
  public async performHealthCheck(instanceId: string): Promise<HealthCheck> {
    try {
      const instance = this.instances.get(instanceId);

      if (!instance) {
        throw new Error(`Instance ${instanceId} not found`);
      }

      const issues: string[] = [];
      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

      if (instance.cpuUsage > 85) issues.push('High CPU usage');
      if (instance.memoryUsage > 85) issues.push('High memory usage');
      if (instance.errorCount > 10) issues.push('High error count');

      if (issues.length >= 2) status = 'degraded';
      if (issues.length >= 3) status = 'unhealthy';

      const healthCheck: HealthCheck = {
        instanceId,
        timestamp: new Date(),
        status,
        metrics: {
          cpuUsage: instance.cpuUsage,
          memoryUsage: instance.memoryUsage,
          uptime: instance.uptime,
          requestCount: instance.requestCount
        },
        issues
      };

      const checks = this.healthChecks.get(instanceId) || [];
      checks.push(healthCheck);
      this.healthChecks.set(instanceId, checks);

      if (status === 'unhealthy') {
        await this.destroyInstance(instanceId);
        this.emit('instance:unhealthy', { instanceId });
      }

      return healthCheck;
    } catch (error) {
      this.logger?.error('Error performing health check', error);
      throw error;
    }
  }

  /**
   * Get instance statistics
   */
  public getInstanceStatistics(agentId: string): {
    totalInstances: number;
    activeInstances: number;
    totalRequests: number;
    totalErrors: number;
    averageUptime: number;
    healthScore: number;
  } {
    const instances = this.getActiveInstances(agentId);

    const totalRequests = instances.reduce((sum, i) => sum + i.requestCount, 0);
    const totalErrors = instances.reduce((sum, i) => sum + i.errorCount, 0);
    const averageUptime = instances.length > 0
      ? instances.reduce((sum, i) => sum + i.uptime, 0) / instances.length
      : 0;

    return {
      totalInstances: Array.from(this.instances.values()).filter(i => i.agentId === agentId).length,
      activeInstances: instances.length,
      totalRequests,
      totalErrors,
      averageUptime,
      healthScore: this.calculateHealthScore(instances)
    };
  }

  // PRIVATE METHODS

  private startHealthMonitoring(instanceId: string): void {
    setInterval(() => {
      this.performHealthCheck(instanceId).catch(err => this.logger?.error(err));
    }, this.healthCheckInterval);
  }

  private calculateAverageCpu(instances: AgentInstance[]): number {
    if (instances.length === 0) return 0;
    return instances.reduce((sum, i) => sum + i.cpuUsage, 0) / instances.length;
  }

  private calculateAverageMemory(instances: AgentInstance[]): number {
    if (instances.length === 0) return 0;
    return instances.reduce((sum, i) => sum + i.memoryUsage, 0) / instances.length;
  }

  private calculatePoolHealth(pool: InstancePool): number {
    if (pool.instances.length === 0) return 0;

    const errorRate = pool.instances.reduce((sum, i) => sum + (i.errorCount / (i.requestCount || 1)), 0) / pool.instances.length;
    const avgCpu = this.calculateAverageCpu(pool.instances);
    const avgMemory = this.calculateAverageMemory(pool.instances);

    return Math.max(0, 100 - (errorRate * 100 + avgCpu / 2 + avgMemory / 2));
  }

  private calculateHealthScore(instances: AgentInstance[]): number {
    if (instances.length === 0) return 0;

    const avgHealth = instances.reduce((sum, i) => {
      const errorRate = i.errorCount / (i.requestCount || 1);
      return sum + (100 - errorRate * 100);
    }, 0) / instances.length;

    return Math.max(0, Math.min(100, avgHealth));
  }
}

export default AgentInstanceManager;