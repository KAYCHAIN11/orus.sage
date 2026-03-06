/**
 * @alphalang/blueprint
 * @component: AgentContextBinder
 * @cognitive-signature: Context-Binding, Workspace-Association, State-Management, Lifecycle
 * @minerva-version: 3.0
 * @evolution-level: Production
 * @orus-sage-engine: Omega-Context-Binding
 * @bloco: 3
 */

import { EventEmitter } from 'events';

export interface ContextBinding {
  id: string;
  agentId: string;
  workspaceId: string;
  context: ContextData;
  boundAt: Date;
  expiresAt?: Date;
  status: 'active' | 'suspended' | 'expired';
  accessCount: number;
  lastAccessedAt?: Date;
}

export interface ContextData {
  projectInfo?: {
    name: string;
    description?: string;
    technologies?: string[];
    architecture?: string;
  };
  previousInteractions: Array<{
    topic: string;
    timestamp: Date;
    outcome: string;
  }>;
  userPreferences: {
    codeStyle?: string;
    verbosity?: 'concise' | 'detailed' | 'balanced';
    language?: string;
  };
  metadata: Record<string, any>;
  constraints?: {
    maxTokens?: number;
    timeoutMs?: number;
    apiLimits?: Record<string, number>;
  };
}

export interface BindingStats {
  totalBindings: number;
  activeBindings: number;
  suspendedBindings: number;
  expiredBindings: number;
  averageLifetime: number;
  mostUsedWorkspace: string;
  totalAccesses: number;
}

export interface ContextSnapshot {
  bindingId: string;
  timestamp: Date;
  contextHash: string;
  changes: Array<{
    field: string;
    oldValue: any;
    newValue: any;
  }>;
}

export class AgentContextBinder extends EventEmitter {
  private bindings: Map<string, ContextBinding> = new Map();
  private contextSnapshots: Map<string, ContextSnapshot[]> = new Map();
  private bindingHistory: ContextBinding[] = [];
  private logger: any;
  private maxBindingsPerAgent = 50;
  private contextTimeout = 24 * 60 * 60 * 1000; // 24 hours
  private snapshotInterval = 60 * 60 * 1000; // 1 hour

  constructor(private database?: any) {
    super();
  }

  /**
   * Bind context to agent
   */
  public async bindContext(
    agentId: string,
    workspaceId: string,
    context: ContextData,
    expiresAt?: Date
  ): Promise<ContextBinding> {
    try {
      this.logger?.info(`Binding context to agent ${agentId} in workspace ${workspaceId}`);

      // Check binding limit
      const existingBindings = this.getAgentBindings(agentId).length;
      if (existingBindings >= this.maxBindingsPerAgent) {
        throw new Error(`Agent ${agentId} has reached maximum bindings`);
      }

      const binding: ContextBinding = {
        id: `binding-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        agentId,
        workspaceId,
        context,
        boundAt: new Date(),
        expiresAt: expiresAt || new Date(Date.now() + this.contextTimeout),
        status: 'active',
        accessCount: 0
      };

      this.bindings.set(binding.id, binding);
      this.bindingHistory.push({ ...binding });

      // Save to database
      await this.database?.saveBinding(binding);

      // Schedule expiration
      if (binding.expiresAt) {
        this.scheduleExpiration(binding.id, binding.expiresAt);
      }

      // Initialize snapshots
      this.contextSnapshots.set(binding.id, []);
      this.startSnapshotting(binding.id);

      this.emit('context:bound', { bindingId: binding.id, agentId, workspaceId });
      return binding;
    } catch (error) {
      this.logger?.error('Error binding context', error);
      throw error;
    }
  }

  /**
   * Get context
   */
  public async getContext(agentId: string, workspaceId: string): Promise<ContextData | null> {
    try {
      const binding = this.findBinding(agentId, workspaceId);

      if (!binding) {
        return null;
      }

      // Update access metrics
      binding.accessCount++;
      binding.lastAccessedAt = new Date();

      // Check expiration
      if (binding.expiresAt && new Date() > binding.expiresAt) {
        await this.unbindContext(binding.id);
        return null;
      }

      this.emit('context:accessed', { bindingId: binding.id, accessCount: binding.accessCount });
      return binding.context;
    } catch (error) {
      this.logger?.error('Error getting context', error);
      return null;
    }
  }

  /**
   * Update context
   */
  public async updateContext(
    bindingId: string,
    updates: Partial<ContextData>
  ): Promise<ContextBinding> {
    try {
      const binding = this.bindings.get(bindingId);
      if (!binding) {
        throw new Error(`Binding ${bindingId} not found`);
      }

      // Create snapshot before update
      const snapshot = this.createSnapshot(binding);

      // Update context
      binding.context = { ...binding.context, ...updates };

      // Save changes
      await this.database?.updateBinding(binding);

      // Record snapshot
      const snapshots = this.contextSnapshots.get(bindingId) || [];
      snapshots.push(snapshot);
      this.contextSnapshots.set(bindingId, snapshots);

      this.emit('context:updated', { bindingId, changes: Object.keys(updates) });
      return binding;
    } catch (error) {
      this.logger?.error('Error updating context', error);
      throw error;
    }
  }

  /**
   * Unbind context
   */
  public async unbindContext(bindingId: string): Promise<void> {
    try {
      const binding = this.bindings.get(bindingId);
      if (!binding) {
        throw new Error(`Binding ${bindingId} not found`);
      }

      // Archive before deletion
      binding.status = 'expired';
      await this.database?.deleteBinding(bindingId);

      this.bindings.delete(bindingId);
      this.contextSnapshots.delete(bindingId);

      this.emit('context:unbound', { bindingId });
    } catch (error) {
      this.logger?.error('Error unbinding context', error);
      throw error;
    }
  }

  /**
   * Get all bindings for agent
   */
  public getAgentBindings(agentId: string): ContextBinding[] {
    return Array.from(this.bindings.values()).filter(b => b.agentId === agentId);
  }

  /**
   * Get all bindings for workspace
   */
  public getWorkspaceBindings(workspaceId: string): ContextBinding[] {
    return Array.from(this.bindings.values()).filter(b => b.workspaceId === workspaceId);
  }

  /**
   * Get binding statistics
   */
  public getStatistics(): BindingStats {
    const allBindings = Array.from(this.bindings.values());
    const activeBindings = allBindings.filter(b => b.status === 'active').length;
    const suspendedBindings = allBindings.filter(b => b.status === 'suspended').length;
    const expiredBindings = allBindings.filter(b => b.status === 'expired').length;

    const lifetimes = allBindings.map(b =>
      (b.expiresAt?.getTime() || Date.now()) - b.boundAt.getTime()
    );
    const avgLifetime = lifetimes.length > 0
      ? lifetimes.reduce((a, b) => a + b, 0) / lifetimes.length
      : 0;

    const workspaceAccessCounts = new Map<string, number>();
    allBindings.forEach(b => {
      workspaceAccessCounts.set(b.workspaceId, (workspaceAccessCounts.get(b.workspaceId) || 0) + b.accessCount);
    });

    const mostUsedWorkspace = Array.from(workspaceAccessCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || '';

    const totalAccesses = allBindings.reduce((sum, b) => sum + b.accessCount, 0);

    return {
      totalBindings: allBindings.length,
      activeBindings,
      suspendedBindings,
      expiredBindings,
      averageLifetime: Math.round(avgLifetime),
      mostUsedWorkspace,
      totalAccesses
    };
  }

  /**
   * Get context history
   */
  public getContextHistory(bindingId: string): ContextSnapshot[] {
    return this.contextSnapshots.get(bindingId) || [];
  }

  /**
   * Suspend binding
   */
  public async suspendBinding(bindingId: string): Promise<void> {
    try {
      const binding = this.bindings.get(bindingId);
      if (binding) {
        binding.status = 'suspended';
        await this.database?.updateBinding(binding);
        this.emit('binding:suspended', { bindingId });
      }
    } catch (error) {
      this.logger?.error('Error suspending binding', error);
      throw error;
    }
  }

  /**
   * Resume binding
   */
  public async resumeBinding(bindingId: string): Promise<void> {
    try {
      const binding = this.bindings.get(bindingId);
      if (binding) {
        binding.status = 'active';
        await this.database?.updateBinding(binding);
        this.emit('binding:resumed', { bindingId });
      }
    } catch (error) {
      this.logger?.error('Error resuming binding', error);
      throw error;
    }
  }

  // PRIVATE METHODS

  private findBinding(agentId: string, workspaceId: string): ContextBinding | undefined {
    return Array.from(this.bindings.values()).find(
      b => b.agentId === agentId && b.workspaceId === workspaceId && b.status === 'active'
    );
  }

  private createSnapshot(binding: ContextBinding): ContextSnapshot {
    return {
      bindingId: binding.id,
      timestamp: new Date(),
      contextHash: this.hashContext(binding.context),
      changes: []
    };
  }

  private hashContext(context: ContextData): string {
    return Buffer.from(JSON.stringify(context)).toString('base64');
  }

  private scheduleExpiration(bindingId: string, expiresAt: Date): void {
    const timeUntilExpiration = expiresAt.getTime() - Date.now();

    if (timeUntilExpiration > 0) {
      setTimeout(() => {
        this.handleExpiration(bindingId);
      }, timeUntilExpiration);
    }
  }

  private async handleExpiration(bindingId: string): Promise<void> {
    try {
      const binding = this.bindings.get(bindingId);
      if (binding) {
        await this.unbindContext(bindingId);
        this.emit('binding:expired', { bindingId });
      }
    } catch (error) {
      this.logger?.error('Error handling expiration', error);
    }
  }

  private startSnapshotting(bindingId: string): void {
    setInterval(() => {
      const binding = this.bindings.get(bindingId);
      if (binding) {
        const snapshot = this.createSnapshot(binding);
        const snapshots = this.contextSnapshots.get(bindingId) || [];
        snapshots.push(snapshot);
        this.contextSnapshots.set(bindingId, snapshots);
      }
    }, this.snapshotInterval);
  }
}

export default AgentContextBinder;