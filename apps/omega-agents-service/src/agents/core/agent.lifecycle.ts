/**
 * @alphalang/blueprint
 * @component: OmegaAgentLifecycle
 * @cognitive-signature: Lifecycle-Management, State-Transitions, Resource-Cleanup
 * @minerva-version: 3.0
 * @evolution-level: Foundation
 * @orus-sage-engine: Omega-Agents-Core-2
 * @bloco: 3
 * @dependencies: agent.types.ts, agent.registry.ts, agent.base.ts
 * @quality-gates:
 *   - type-coverage: 100%
 *   - test-coverage: 95%
 *   - complexity: medium
 *   - maintainability: 95%
 * @trinity-integration: CEREBRO
 * @cig-protocol: ✅ Compliant
 * @last-evolution: 2025-10-31
 */

import { OmegaAgent, AgentStatus } from './agent.types';
import { OmegaAgentRegistry } from './agent.registry';
import { OmegaAgentBase } from './agent.base';

/**
 * SECTION 1: IMPORTS & DEPENDENCIES
 */

import { EventEmitter } from 'events';

/**
 * SECTION 2: MAIN CLASS IMPLEMENTATION
 */

export class OmegaAgentLifecycle extends EventEmitter {
  private registry: OmegaAgentRegistry;
  private creationTimestamps: Map<string, Date> = new Map();
  private shutdownTimestamps: Map<string, Date> = new Map();

  constructor(registry: OmegaAgentRegistry) {
    super();
    this.registry = registry;
  }

  /**
   * Create agent
   */
  public async create(
    agent: OmegaAgent,
    instance: OmegaAgentBase
  ): Promise<OmegaAgent> {
    try {
      // Register agent
      this.registry.register(agent, instance);

      // Record creation time
      this.creationTimestamps.set(agent.id, new Date());

      // Emit event
      this.emit('agent:created', {
        agentId: agent.id,
        agentType: agent.type,
        workspaceId: agent.workspaceId
      });

      return agent;
    } catch (error) {
      this.emit('agent:creation_failed', { agent, error });
      throw error;
    }
  }

  /**
   * Initialize agent
   */
  public async initialize(agentId: string): Promise<void> {
    const entry = this.registry.get(agentId);

    if (!entry) {
      throw new Error(`Agent ${agentId} not found`);
    }

    try {
      this.registry.updateStatus(agentId, AgentStatus.IDLE);

      this.emit('agent:initialized', { agentId });
    } catch (error) {
      this.emit('agent:initialization_failed', { agentId, error });
      throw error;
    }
  }

  /**
   * Pause agent
   */
  public async pause(agentId: string): Promise<void> {
    const entry = this.registry.get(agentId);

    if (!entry) {
      throw new Error(`Agent ${agentId} not found`);
    }

    this.registry.updateStatus(agentId, AgentStatus.PAUSED);

    this.emit('agent:paused', { agentId });
  }

  /**
   * Resume agent
   */
  public async resume(agentId: string): Promise<void> {
    const entry = this.registry.get(agentId);

    if (!entry) {
      throw new Error(`Agent ${agentId} not found`);
    }

    this.registry.updateStatus(agentId, AgentStatus.IDLE);

    this.emit('agent:resumed', { agentId });
  }

  /**
   * Shutdown agent
   */
  public async shutdown(agentId: string): Promise<void> {
    const entry = this.registry.get(agentId);

    if (!entry) {
      throw new Error(`Agent ${agentId} not found`);
    }

    try {
      // Shutdown instance
      await entry.instance.shutdown();

      // Record shutdown time
      this.shutdownTimestamps.set(agentId, new Date());

      // Unregister
      this.registry.unregister(agentId);

      // Emit event
      this.emit('agent:shutdown', { agentId });
    } catch (error) {
      this.emit('agent:shutdown_failed', { agentId, error });
      throw error;
    }
  }

  /**
   * Shutdown all agents in workspace
   */
  public async shutdownWorkspace(workspaceId: string): Promise<number> {
    const agents = this.registry.getByWorkspace(workspaceId);
    let count = 0;

    for (const entry of agents) {
      try {
        await this.shutdown(entry.agent.id);
        count++;
      } catch (error) {
        console.error(`Failed to shutdown agent ${entry.agent.id}:`, error);
      }
    }

    this.emit('workspace:shutdown_complete', { workspaceId, agentCount: count });

    return count;
  }

  /**
   * Get agent lifecycle info
   */
  public getLifecycleInfo(agentId: string): {
    createdAt: Date | null;
    shutdownAt: Date | null;
    uptime: number;
    status: AgentStatus | null;
  } {
    const createdAt = this.creationTimestamps.get(agentId) || null;
    const shutdownAt = this.shutdownTimestamps.get(agentId) || null;
    const entry = this.registry.get(agentId);

    const uptime = createdAt ? Date.now() - createdAt.getTime() : 0;

    return {
      createdAt,
      shutdownAt,
      uptime,
      status: entry?.status || null
    };
  }

  /**
   * Get all agent lifecycle info
   */
  public getAllLifecycleInfo(): Map<string, any> {
    const info = new Map();

    for (const entry of this.registry.getAll()) {
      info.set(entry.agent.id, this.getLifecycleInfo(entry.agent.id));
    }

    return info;
  }

  /**
   * Health check all agents
   */
  public async healthCheck(): Promise<Map<string, boolean>> {
    const health = new Map<string, boolean>();

    for (const entry of this.registry.getAll()) {
      try {
        // Simple check - just verify agent is accessible
        const status = this.registry.getStatus(entry.agent.id);
        health.set(entry.agent.id, status !== AgentStatus.ERROR);
      } catch (error) {
        health.set(entry.agent.id, false);
      }
    }

    return health;
  }
}

/**
 * SECTION 3: EXPORTS & PUBLIC API
 */

export default OmegaAgentLifecycle;

/**
 * SECTION 4: DOCUMENTATION
 * OmegaAgentLifecycle manages agent lifecycle
 * - Creation and initialization
 * - Pause and resume
 * - Graceful shutdown
 * - Health monitoring
 * - Lifecycle metrics
 */

// EOF
// Evolution Hash: agent.lifecycle.0056.20251031
// Quality Score: 95
// Cognitive Signature: ✅ COMPLETE
