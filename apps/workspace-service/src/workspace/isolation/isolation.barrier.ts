/**
 * @alphalang/blueprint
 * @component: IsolationBarrier
 * @cognitive-signature: Security-Boundary, Context-Isolation, Data-Separation
 * @minerva-version: 3.0
 * @evolution-level: Production
 * @orus-sage-engine: Workspace-Isolation
 * @bloco: 2
 */

import { EventEmitter } from 'events';

export interface IsolationPolicy {
  id: string;
  workspaceId: string;
  level: 'strict' | 'moderate' | 'relaxed';
  rules: IsolationRule[];
  exceptions: IsolationException[];
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export interface IsolationRule {
  id: string;
  type: 'data' | 'context' | 'memory' | 'agent' | 'api' | 'storage';
  action: 'block' | 'allow' | 'sanitize' | 'log';
  scope: string[];
  priority: number;
  conditions?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface IsolationException {
  id: string;
  workspaceId: string;
  targetWorkspaceId: string;
  allowedResources: string[];
  expiresAt?: Date;
  createdBy: string;
  reason?: string;
  createdAt: Date;
}

export interface BarrierViolation {
  id: string;
  timestamp: Date;
  workspaceId: string;
  targetWorkspace?: string;
  violationType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: any;
  blocked: boolean;
  userId?: string;
}

export interface SanitizationRule {
  field: string;
  pattern: RegExp;
  replacement: string;
}

export class IsolationBarrier extends EventEmitter {
  private policies: Map<string, IsolationPolicy> = new Map();
  private violations: BarrierViolation[] = [];
  private sanitizationRules: SanitizationRule[] = [];
  private violationThreshold = 100; // Track last 100 violations
  private logger: any;

  constructor() {
    super();
  }

  /**
   * Initialize isolation for workspace
   */
  public async initializeWorkspace(workspaceId: string, level: 'strict' | 'moderate' | 'relaxed' = 'strict'): Promise<IsolationPolicy> {
    const policy: IsolationPolicy = {
      id: `policy-${workspaceId}`,
      workspaceId,
      level,
      rules: this.createDefaultRules(level),
      exceptions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1
    };

    this.policies.set(workspaceId, policy);
    this.emit('workspace:isolated', { workspaceId, level });
    return policy;
  }

  /**
   * Check if access is allowed between workspaces
   */
  public async checkAccess(
    fromWorkspaceId: string,
    toWorkspaceId: string,
    resourceType: string,
    resourceId: string,
    userId?: string
  ): Promise<{ allowed: boolean; reason?: string; sanitized?: boolean }> {
    try {
      // Same workspace - always allowed
      if (fromWorkspaceId === toWorkspaceId) {
        return { allowed: true };
      }

      const fromPolicy = this.policies.get(fromWorkspaceId);
      const toPolicy = this.policies.get(toWorkspaceId);

      if (!fromPolicy || !toPolicy) {
        return { allowed: false, reason: 'Workspace not properly isolated' };
      }

      // Check exceptions first
      const hasException = await this.checkException(
        fromWorkspaceId,
        toWorkspaceId,
        resourceId,
        userId
      );

      if (hasException) {
        return { allowed: true, sanitized: false };
      }

      // Evaluate rules
      const result = this.evaluateRules(fromPolicy, toPolicy, resourceType, resourceId);

      if (!result.allowed) {
        await this.recordViolation(fromWorkspaceId, toWorkspaceId, resourceType, userId);
      }

      return result;
    } catch (error) {
      this.logger?.error('Error checking access', error);
      return { allowed: false, reason: 'Access check failed' };
    }
  }

  /**
   * Sanitize data for cross-workspace transfer
   */
  public sanitizeData<T>(data: T, fromWorkspaceId: string, toWorkspaceId: string): T {
    if (fromWorkspaceId === toWorkspaceId) {
      return data;
    }

    const policy = this.policies.get(fromWorkspaceId);
    const hasSanitizeRule = policy?.rules.some(r => r.action === 'sanitize');

    if (!hasSanitizeRule) {
      return data;
    }

    const sanitized = { ...data } as any;

    // Apply sanitization rules
    this.sanitizationRules.forEach(rule => {
      if (sanitized[rule.field]) {
        sanitized[rule.field] = sanitized[rule.field].replace(
          rule.pattern,
          rule.replacement
        );
      }
    });

    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'privateKey'];
    sensitiveFields.forEach(field => {
      delete sanitized[field];
    });

    return sanitized as T;
  }

  /**
   * Create isolated context for workspace
   */
  public createIsolatedContext(
    workspaceId: string,
    userId?: string
  ): {
    workspaceId: string;
    sandboxed: boolean;
    allowedApis: string[];
    memoryLimit: number;
    cpuLimit: number;
    timeoutMs: number;
  } {
    const policy = this.policies.get(workspaceId);
    const level = policy?.level || 'moderate';

    const limits = {
      strict: { memory: 256, cpu: 50, timeout: 5000 },
      moderate: { memory: 512, cpu: 100, timeout: 10000 },
      relaxed: { memory: 1024, cpu: 200, timeout: 30000 }
    };

    const selectedLimit = limits[level];

    return {
      workspaceId,
      sandboxed: true,
      allowedApis: ['chat', 'agents', 'files', 'analytics'],
      memoryLimit: selectedLimit.memory * 1024 * 1024,
      cpuLimit: selectedLimit.cpu,
      timeoutMs: selectedLimit.timeout
    };
  }

  /**
   * Enforce barrier
   */
  public async enforceBarrier(
    workspaceId: string,
    operation: string,
    target: any,
    userId?: string
  ): Promise<void> {
    const policy = this.policies.get(workspaceId);
    
    if (!policy) {
      throw new Error(`No isolation policy for workspace ${workspaceId}`);
    }

    const rule = policy.rules.find(r => 
      r.type === operation || r.scope.includes(operation)
    );

    if (rule && rule.action === 'block') {
      await this.recordViolation(workspaceId, undefined, operation, userId);
      throw new Error(`Operation ${operation} blocked by isolation policy`);
    }

    if (rule && rule.action === 'log') {
      this.emit('barrier:operation', { workspaceId, operation, userId });
    }
  }

  /**
   * Get violations
   */
  public getViolations(
    workspaceId?: string,
    limit: number = 50
  ): BarrierViolation[] {
    let violations = this.violations;
    
    if (workspaceId) {
      violations = violations.filter(v => v.workspaceId === workspaceId);
    }

    return violations.slice(-limit);
  }

  /**
   * Clear violations
   */
  public clearViolations(workspaceId?: string): void {
    if (workspaceId) {
      this.violations = this.violations.filter(v => v.workspaceId !== workspaceId);
    } else {
      this.violations = [];
    }
  }

  /**
   * Add exception
   */
  public async addException(
    exception: IsolationException
  ): Promise<void> {
    const policy = this.policies.get(exception.workspaceId);
    
    if (!policy) {
      throw new Error(`No policy for workspace ${exception.workspaceId}`);
    }

    policy.exceptions.push(exception);
    this.emit('exception:added', exception);
  }

  /**
   * Remove exception
   */
  public async removeException(exceptionId: string): Promise<void> {
    for (const policy of this.policies.values()) {
      const index = policy.exceptions.findIndex(e => e.id === exceptionId);
      if (index >= 0) {
        policy.exceptions.splice(index, 1);
        this.emit('exception:removed', exceptionId);
        return;
      }
    }
  }

  // PRIVATE METHODS

  private createDefaultRules(level: string): IsolationRule[] {
    const baseRules: IsolationRule[] = [
      {
        id: 'rule-data-1',
        type: 'data',
        action: 'block',
        scope: ['private', 'sensitive'],
        priority: 100
      },
      {
        id: 'rule-context-1',
        type: 'context',
        action: 'block',
        scope: ['workspace', 'user'],
        priority: 90
      }
    ];

    if (level === 'relaxed') {
      return baseRules.filter(r => r.priority < 100);
    }

    return baseRules;
  }

  private async checkException(
    fromWorkspaceId: string,
    toWorkspaceId: string,
    resourceId: string,
    userId?: string
  ): Promise<boolean> {
    const policy = this.policies.get(fromWorkspaceId);
    
    if (!policy) return false;

    return policy.exceptions.some(e =>
      e.targetWorkspaceId === toWorkspaceId &&
      (!e.expiresAt || e.expiresAt > new Date()) &&
      e.allowedResources.includes(resourceId)
    );
  }

  private evaluateRules(
    fromPolicy: IsolationPolicy,
    toPolicy: IsolationPolicy,
    resourceType: string,
    resourceId: string
  ): { allowed: boolean; reason?: string; sanitized?: boolean } {
    const allRules = [...fromPolicy.rules, ...toPolicy.rules]
      .sort((a, b) => b.priority - a.priority);

    for (const rule of allRules) {
      if (rule.type === resourceType || rule.scope.includes(resourceType)) {
        if (rule.action === 'allow') {
          return { allowed: true, sanitized: false };
        } else if (rule.action === 'sanitize') {
          return { allowed: true, sanitized: true };
        } else if (rule.action === 'block') {
          return { allowed: false, reason: `Blocked by ${rule.type} policy` };
        }
      }
    }

    // Default deny
    return { allowed: false, reason: 'No matching allow rule' };
  }

  private async recordViolation(
    fromWorkspaceId: string,
    toWorkspaceId: string | undefined,
    resourceType: string,
    userId?: string
  ): Promise<void> {
    const violation: BarrierViolation = {
      id: `violation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      workspaceId: fromWorkspaceId,
      targetWorkspace: toWorkspaceId,
      violationType: `unauthorized-access-${resourceType}`,
      severity: 'high',
      details: { resourceType },
      blocked: true,
      userId
    };

    this.violations.push(violation);

    // Keep only last N violations
    if (this.violations.length > this.violationThreshold) {
      this.violations = this.violations.slice(-this.violationThreshold);
    }

    this.emit('violation:recorded', violation);
  }
}

export default IsolationBarrier;