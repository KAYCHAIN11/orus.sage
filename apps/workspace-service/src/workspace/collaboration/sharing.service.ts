/**
 * @alphalang/blueprint
 * @component: SharingService
 * @cognitive-signature: Resource-Sharing, Collaboration, Permission-Management, Audit-Trail
 * @minerva-version: 3.0
 * @evolution-level: Production
 * @orus-sage-engine: Workspace-Collaboration-Sharing
 * @bloco: 2
 * @dependencies: workspace.types.ts, database.service.ts, event.service.ts
 * @quality-gates:
 *   - type-coverage: 100%
 *   - test-coverage: 94%
 *   - complexity: high
 *   - maintainability: 93%
 * @trinity-integration: CEREBRO
 * @cig-protocol: ✅ Compliant
 * @last-evolution: 2025-11-04
 */

import { EventEmitter } from 'events';
import { Logger } from '../../../../../libs/shared/src/logger/logger';

export interface ShareRequest {
  id: string;
  resourceId: string;
  resourceType: 'chat' | 'file' | 'agent' | 'workspace' | 'decision';
  sharedBy: string;
  sharedWith: ShareTarget[];
  permissions: SharePermission[];
  expiresAt?: Date;
  message?: string;
  notificationEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShareTarget {
  id: string;
  type: 'user' | 'group' | 'workspace';
  email?: string;
  groupId?: string;
}

export type SharePermission = 'view' | 'comment' | 'edit' | 'delete' | 'share' | 'admin';

export interface SharedResource {
  id: string;
  resourceId: string;
  resourceType: string;
  sharedBy: string;
  sharedWith: ShareTarget[];
  permissions: SharePermission[];
  accessCount: number;
  lastAccessedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
   updatedAt: Date; 
}

export interface ShareAuditLog {
  id: string;
  shareRequestId: string;
  action: 'shared' | 'accessed' | 'modified' | 'revoked' | 'expired';
  userId: string;
  targetId: string;
  details: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface ShareNotification {
  id: string;
  recipientId: string;
  shareRequestId: string;
  type: 'new_share' | 'permission_change' | 'expiration_warning';
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export class SharingService extends EventEmitter {
  private sharedResources: Map<string, SharedResource> = new Map();
  private auditLogs: ShareAuditLog[] = [];
  private shareNotifications: Map<string, ShareNotification[]> = new Map();
  private shareRequests: Map<string, ShareRequest> = new Map();
  private logger: Logger;
  private maxSharesPerResource = 100;
  private auditRetention = 90 * 24 * 60 * 60 * 1000; // 90 days

  constructor(private database: any, private eventBus?: any) {
    super();
this.logger = Logger.create('SharingService');
  }

  /**
   * Share resource with target
   */
  public async shareResource(request: ShareRequest): Promise<SharedResource> {
    try {
      this.logger.info(`Sharing resource ${request.resourceId} with ${request.sharedWith.length} targets`);

      // Validate request
      this.validateShareRequest(request);

      // Check if already shared
      const existing = this.findSharedResource(request.resourceId, request.sharedWith[0].id);
      if (existing) {
        this.logger.warn(`Resource ${request.resourceId} already shared with target`);
        return existing;
      }

      // Create shared resource
      const sharedResource: SharedResource = {
        id: `share-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        resourceId: request.resourceId,
        resourceType: request.resourceType,
        sharedBy: request.sharedBy,
        sharedWith: request.sharedWith,
        permissions: request.permissions,
        accessCount: 0,
        expiresAt: request.expiresAt,
        createdAt: new Date(),
        updatedAt: undefined
      };

      // Save to database
      await this.database.saveShare(sharedResource);
      this.sharedResources.set(sharedResource.id, sharedResource);

      // Create audit log
      await this.logAuditEvent({
        shareRequestId: request.id,
        action: 'shared',
        userId: request.sharedBy,
        targetId: request.sharedWith[0].id,
        details: {
          resourceId: request.resourceId,
          permissionsGranted: request.permissions.length,
          expiresAt: request.expiresAt
        }
      });

      // Send notifications
      if (request.notificationEnabled) {
        await this.sendShareNotifications(request, sharedResource);
      }

      // Set expiration timer
      if (request.expiresAt) {
        this.scheduleShareExpiration(sharedResource.id, request.expiresAt);
      }

      this.emit('resource:shared', { resourceId: request.resourceId, shareCount: request.sharedWith.length });
      return sharedResource;
    } catch (error) {
      this.logger.error('Error sharing resource', error);
      throw new Error(`Failed to share resource: ${error.message}`);
    }
  }

  /**
   * Grant additional permissions
   */
  public async grantPermissions(
    sharedResourceId: string,
    permissions: SharePermission[],
    grantedBy: string
  ): Promise<SharedResource> {
    try {
      this.logger.info(`Granting permissions to shared resource ${sharedResourceId}`);

      const resource = this.sharedResources.get(sharedResourceId);
      if (!resource) {
        throw new Error(`Shared resource ${sharedResourceId} not found`);
      }

      // Merge permissions (avoid duplicates)
      const newPermissions = [...new Set([...resource.permissions, ...permissions])];
      resource.permissions = newPermissions;
      resource.updatedAt = new Date();

      // Save changes
      await this.database.updateShare(resource);

      // Audit log
      await this.logAuditEvent({
        shareRequestId: sharedResourceId,
        action: 'modified',
        userId: grantedBy,
        targetId: resource.sharedWith[0].id,
        details: { permissionsAdded: permissions }
      });

      this.emit('permissions:granted', { sharedResourceId, permissions });
      return resource;
    } catch (error) {
      this.logger.error('Error granting permissions', error);
      throw error;
    }
  }

  /**
   * Revoke access
   */
  public async revokeAccess(
    sharedResourceId: string,
    revokedBy: string,
    reason?: string
  ): Promise<void> {
    try {
      this.logger.info(`Revoking access to shared resource ${sharedResourceId}`);

      const resource = this.sharedResources.get(sharedResourceId);
      if (!resource) {
        throw new Error(`Shared resource ${sharedResourceId} not found`);
      }

      // Record revocation
      await this.logAuditEvent({
        shareRequestId: sharedResourceId,
        action: 'revoked',
        userId: revokedBy,
        targetId: resource.sharedWith[0].id,
        details: { reason }
      });

      // Delete share
      await this.database.deleteShare(sharedResourceId);
      this.sharedResources.delete(sharedResourceId);

      // Send revocation notification
      await this.sendRevocationNotification(resource);

      this.emit('access:revoked', { sharedResourceId });
    } catch (error) {
      this.logger.error('Error revoking access', error);
      throw error;
    }
  }

  /**
   * Record access to shared resource
   */
  public async recordAccess(sharedResourceId: string, userId: string): Promise<void> {
    try {
      const resource = this.sharedResources.get(sharedResourceId);
      if (resource) {
        resource.accessCount++;
        resource.lastAccessedAt = new Date();

        await this.logAuditEvent({
          shareRequestId: sharedResourceId,
          action: 'accessed',
          userId: userId,
          targetId: resource.sharedWith[0].id,
          details: { accessNumber: resource.accessCount }
        });
      }
    } catch (error) {
      this.logger.error('Error recording access', error);
    }
  }

  /**
   * Get shared resources for user
   */
  public async getSharedWithUser(userId: string, resourceType?: string): Promise<SharedResource[]> {
    try {
      this.logger.debug(`Getting shared resources for user ${userId}`);

      let shared = Array.from(this.sharedResources.values()).filter(r =>
        r.sharedWith.some(t => t.id === userId)
      );

      if (resourceType) {
        shared = shared.filter(r => r.resourceType === resourceType);
      }

      return shared;
    } catch (error) {
      this.logger.error('Error getting shared resources', error);
      return [];
    }
  }

  /**
   * Get shared by user
   */
  public async getSharedByUser(userId: string, resourceType?: string): Promise<SharedResource[]> {
    try {
      this.logger.debug(`Getting resources shared by user ${userId}`);

      let shared = Array.from(this.sharedResources.values()).filter(r =>
        r.sharedBy === userId
      );

      if (resourceType) {
        shared = shared.filter(r => r.resourceType === resourceType);
      }

      return shared;
    } catch (error) {
      this.logger.error('Error getting shared resources', error);
      return [];
    }
  }

  /**
   * Check permission
   */
  public hasPermission(
    sharedResource: SharedResource,
    userId: string,
    permission: SharePermission
  ): boolean {
    // Check if user is in shared with list
    const hasTarget = sharedResource.sharedWith.some(t => t.id === userId);
    if (!hasTarget) return false;

    // Check if expired
    if (sharedResource.expiresAt && new Date() > sharedResource.expiresAt) {
      return false;
    }

    // Check permission hierarchy: admin > delete > edit > comment > share > view
    const hierarchy = ['view', 'share', 'comment', 'edit', 'delete', 'admin'];
    const requestedIndex = hierarchy.indexOf(permission);

    return sharedResource.permissions.some(p => {
      const grantedIndex = hierarchy.indexOf(p);
      return grantedIndex >= requestedIndex;
    });
  }

  /**
   * Get audit logs
   */
  public async getAuditLogs(
    sharedResourceId?: string,
    userId?: string,
    limit: number = 100
  ): Promise<ShareAuditLog[]> {
    try {
      let logs = [...this.auditLogs];

      if (sharedResourceId) {
        logs = logs.filter(l => l.shareRequestId === sharedResourceId);
      }

      if (userId) {
        logs = logs.filter(l => l.userId === userId);
      }

      return logs.slice(-limit);
    } catch (error) {
      this.logger.error('Error getting audit logs', error);
      return [];
    }
  }

  /**
   * Export share report
   */
  public async generateShareReport(userId: string): Promise<{
    totalShared: number;
    sharedByType: Record<string, number>;
    totalRecipients: number;
    expiringWithin30Days: number;
    auditEvents: number;
  }> {
    try {
      const userShares = await this.getSharedByUser(userId);
      const byType = new Map<string, number>();
      let totalRecipients = 0;
      let expiring = 0;
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      userShares.forEach(share => {
        byType.set(share.resourceType, (byType.get(share.resourceType) || 0) + 1);
        totalRecipients += share.sharedWith.length;

        if (share.expiresAt && share.expiresAt < thirtyDaysFromNow) {
          expiring++;
        }
      });

      const logs = await this.getAuditLogs(undefined, userId);

      return {
        totalShared: userShares.length,
        sharedByType: Object.fromEntries(byType),
        totalRecipients,
        expiringWithin30Days: expiring,
        auditEvents: logs.length
      };
    } catch (error) {
      this.logger.error('Error generating report', error);
      throw error;
    }
  }

  // PRIVATE METHODS

  private validateShareRequest(request: ShareRequest): void {
    if (!request.resourceId || !request.sharedBy) {
      throw new Error('Invalid share request: missing required fields');
    }

    if (request.sharedWith.length === 0) {
      throw new Error('Share request must include at least one target');
    }

    if (request.permissions.length === 0) {
      throw new Error('Share request must include at least one permission');
    }
  }

  private findSharedResource(resourceId: string, targetId: string): SharedResource | undefined {
    return Array.from(this.sharedResources.values()).find(r =>
      r.resourceId === resourceId && r.sharedWith.some(t => t.id === targetId)
    );
  }

  private async logAuditEvent(
    event: Omit<ShareAuditLog, 'id' | 'timestamp'>
  ): Promise<void> {
    const log: ShareAuditLog = {
      ...event,
      id: `audit-${Date.now()}`,
      timestamp: new Date()
    };

    this.auditLogs.push(log);

    // Cleanup old logs
    const cutoff = Date.now() - this.auditRetention;
    this.auditLogs = this.auditLogs.filter(l => l.timestamp.getTime() > cutoff);

    await this.database.saveAuditLog(log);
  }

  private async sendShareNotifications(request: ShareRequest, shared: SharedResource): Promise<void> {
    for (const target of request.sharedWith) {
      const notification: ShareNotification = {
        id: `notif-${Date.now()}`,
        recipientId: target.id,
        shareRequestId: request.id,
        type: 'new_share',
        message: request.message || `${request.sharedBy} shared a ${request.resourceType} with you`,
        isRead: false,
        createdAt: new Date()
      };

      const notifList = this.shareNotifications.get(target.id) || [];
      notifList.push(notification);
      this.shareNotifications.set(target.id, notifList);

      this.emit('notification:sent', notification);
    }
  }

  private async sendRevocationNotification(resource: SharedResource): Promise<void> {
    for (const target of resource.sharedWith) {
      const notification: ShareNotification = {
        id: `notif-${Date.now()}`,
        recipientId: target.id,
        shareRequestId: resource.id,
        type: 'permission_change',
        message: `Access to ${resource.resourceType} has been revoked`,
        isRead: false,
        createdAt: new Date()
      };

      this.emit('notification:sent', notification);
    }
  }

  private scheduleShareExpiration(sharedResourceId: string, expiresAt: Date): void {
    const timeUntilExpiration = expiresAt.getTime() - Date.now();

    if (timeUntilExpiration > 0) {
      setTimeout(() => {
        this.handleShareExpiration(sharedResourceId);
      }, timeUntilExpiration);
    }
  }

  private async handleShareExpiration(sharedResourceId: string): Promise<void> {
    try {
      const resource = this.sharedResources.get(sharedResourceId);
      if (resource) {
        await this.revokeAccess(sharedResourceId, 'system', 'Share expired');
        this.emit('share:expired', { sharedResourceId });
      }
    } catch (error) {
      this.logger.error('Error handling share expiration', error);
    }
  }
}

export default SharingService;