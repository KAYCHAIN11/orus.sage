/**
 * @alphalang/blueprint
 * @component: SwitchingAnalytics
 * @cognitive-signature: Analytics, Metrics, Usage-Tracking, Pattern-Recognition
 * @minerva-version: 3.0
 * @evolution-level: Production
 * @orus-sage-engine: Workspace-Switching-Analytics
 * @bloco: 2
 */

import { EventEmitter } from 'events';

export interface SwitchingMetrics {
  userId: string;
  workspaceId: string;
  switchCount: number;
  averageSwitchDuration: number;
  mostVisited: WorkspaceVisit[];
  patterns: SwitchPattern[];
  peakSwitchTimes: Array<{ hour: number; count: number }>;
  timestamp: Date;
}

export interface SwitchEvent {
  id: string;
  userId: string;
  fromWorkspace: string;
  toWorkspace: string;
  duration: number; // milliseconds
  timestamp: Date;
  userAgent?: string;
  ipAddress?: string;
}

export interface WorkspaceVisit {
  workspaceId: string;
  visitCount: number;
  totalTimeSpent: number;
  averageSessionDuration: number;
  lastVisited: Date;
}

export interface SwitchPattern {
  from: string;
  to: string;
  frequency: number;
  averageTime: number;
  confidence: number;
}

export interface SessionData {
  sessionId: string;
  userId: string;
  workspaceId: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  events: string[];
  resourcesAccessed: Array<{ type: string; id: string }>;
}

export interface AnalyticsReport {
  userId: string;
  period: 'daily' | 'weekly' | 'monthly';
  totalSwitches: number;
  totalSessionTime: number;
  avgSessionDuration: number;
  mostProductiveHour: number;
  workspaceBreakdown: Record<string, number>;
  recommendations: string[];
}

export class SwitchingAnalytics extends EventEmitter {
  private switchEvents: SwitchEvent[] = [];
  private sessions: Map<string, SessionData> = new Map();
  private metrics: Map<string, SwitchingMetrics> = new Map();
  private metricsCache: Map<string, { data: SwitchingMetrics; timestamp: number }> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private eventRetention = 30 * 24 * 60 * 60 * 1000; // 30 days
  private logger: any;

  constructor(private database?: any) {
    super();
  }

  /**
   * Track workspace switch
   */
  public async trackSwitch(
    userId: string,
    fromWorkspace: string,
    toWorkspace: string,
    metadata?: { userAgent?: string; ipAddress?: string }
  ): Promise<SwitchEvent> {
    try {
      const switchEvent: SwitchEvent = {
        id: `switch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        fromWorkspace,
        toWorkspace,
        duration: 0,
        timestamp: new Date(),
        userAgent: metadata?.userAgent,
        ipAddress: metadata?.ipAddress
      };

      this.switchEvents.push(switchEvent);

      // Save to database
      await this.database?.saveSwitchEvent(switchEvent);

      // Update metrics cache
      this.metricsCache.delete(`metrics-${userId}`);

      this.emit('workspace:switched', { userId, fromWorkspace, toWorkspace });
      return switchEvent;
    } catch (error) {
      this.logger?.error('Error tracking switch', error);
      throw error;
    }
  }

  /**
   * Start session
   */
  public async startSession(
    userId: string,
    workspaceId: string,
    sessionId?: string
  ): Promise<SessionData> {
    try {
      const session: SessionData = {
        sessionId: sessionId || `session-${Date.now()}`,
        userId,
        workspaceId,
        startTime: new Date(),
        duration: 0,
        events: [],
        resourcesAccessed: []
      };

      this.sessions.set(session.sessionId, session);
      return session;
    } catch (error) {
      this.logger?.error('Error starting session', error);
      throw error;
    }
  }

  /**
   * End session
   */
  public async endSession(sessionId: string): Promise<SessionData> {
    try {
      const session = this.sessions.get(sessionId);
      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }

      session.endTime = new Date();
      session.duration = session.endTime.getTime() - session.startTime.getTime();

      await this.database?.saveSession(session);
      this.sessions.delete(sessionId);

      this.emit('session:ended', { sessionId, duration: session.duration });
      return session;
    } catch (error) {
      this.logger?.error('Error ending session', error);
      throw error;
    }
  }

  /**
   * Get analytics for user
   */
  public async getAnalytics(userId: string): Promise<SwitchingMetrics> {
    try {
      // Check cache
      const cacheKey = `metrics-${userId}`;
      const cached = this.metricsCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }

      const userEvents = this.switchEvents.filter(e => e.userId === userId);

      // Calculate metrics
      const switchCount = userEvents.length;
      const avgDuration = userEvents.length > 0
        ? userEvents.reduce((sum, e) => sum + e.duration, 0) / userEvents.length
        : 0;

      // Find most visited
      const visitCounts = new Map<string, number>();
      userEvents.forEach(e => {
        visitCounts.set(e.toWorkspace, (visitCounts.get(e.toWorkspace) || 0) + 1);
      });

      const mostVisited: WorkspaceVisit[] = Array.from(visitCounts.entries())
        .map(([workspaceId, visitCount]) => ({
          workspaceId,
          visitCount,
          totalTimeSpent: 0,
          averageSessionDuration: 0,
          lastVisited: new Date()
        }))
        .sort((a, b) => b.visitCount - a.visitCount)
        .slice(0, 5);

      // Identify patterns
      const patterns = this.identifySwitchPatterns(userEvents);

      // Peak times
      const peakSwitchTimes = this.calculatePeakTimes(userEvents);

      const metrics: SwitchingMetrics = {
        userId,
        workspaceId: userEvents.length > 0 ? userEvents[userEvents.length - 1].toWorkspace : '',
        switchCount,
        averageSwitchDuration: avgDuration,
        mostVisited,
        patterns,
        peakSwitchTimes,
        timestamp: new Date()
      };

      this.metricsCache.set(cacheKey, { data: metrics, timestamp: Date.now() });
      return metrics;
    } catch (error) {
      this.logger?.error('Error getting analytics', error);
      throw error;
    }
  }

  /**
   * Get patterns
   */
  public async getPatterns(userId: string): Promise<SwitchPattern[]> {
    try {
      const userEvents = this.switchEvents.filter(e => e.userId === userId);
      return this.identifySwitchPatterns(userEvents);
    } catch (error) {
      this.logger?.error('Error getting patterns', error);
      return [];
    }
  }

  /**
   * Generate productivity report
   */
  public async generateProductivityReport(userId: string, days: number = 7): Promise<AnalyticsReport> {
    try {
      const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
      const recentEvents = this.switchEvents.filter(
        e => e.userId === userId && e.timestamp.getTime() > cutoff
      );

      const workspaceTime = new Map<string, number>();
      const peakHours = new Map<number, number>();

      recentEvents.forEach(e => {
        const hour = new Date(e.timestamp).getHours();
        peakHours.set(hour, (peakHours.get(hour) || 0) + 1);
        workspaceTime.set(e.toWorkspace, (workspaceTime.get(e.toWorkspace) || 0) + e.duration);
      });

      const totalTime = Array.from(workspaceTime.values()).reduce((sum, t) => sum + t, 0);
      const avgSessionDuration = recentEvents.length > 0 ? totalTime / recentEvents.length : 0;

      const mostProductiveHour = Array.from(peakHours.entries())
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 0;

      const report: AnalyticsReport = {
        userId,
        period: 'daily',
        totalSwitches: recentEvents.length,
        totalSessionTime: totalTime,
        avgSessionDuration,
        mostProductiveHour,
        workspaceBreakdown: Object.fromEntries(workspaceTime),
        recommendations: this.generateRecommendations(recentEvents)
      };

      return report;
    } catch (error) {
      this.logger?.error('Error generating report', error);
      throw error;
    }
  }

  /**
   * Export analytics
   */
  public async exportAnalytics(userId: string, format: 'json' | 'csv' = 'json'): Promise<string> {
    try {
      const analytics = await this.getAnalytics(userId);

      if (format === 'json') {
        return JSON.stringify(analytics, null, 2);
      } else if (format === 'csv') {
        return this.convertToCsv(analytics);
      }

      return '';
    } catch (error) {
      this.logger?.error('Error exporting analytics', error);
      throw error;
    }
  }

  /**
   * Cleanup old events
   */
  public async cleanupOldEvents(): Promise<number> {
    try {
      const cutoff = Date.now() - this.eventRetention;
      const initialCount = this.switchEvents.length;

      this.switchEvents = this.switchEvents.filter(e => e.timestamp.getTime() > cutoff);

      return initialCount - this.switchEvents.length;
    } catch (error) {
      this.logger?.error('Error cleaning up events', error);
      return 0;
    }
  }

  // PRIVATE METHODS

  private identifySwitchPatterns(events: SwitchEvent[]): SwitchPattern[] {
    const patterns = new Map<string, { count: number; totalTime: number }>();

    events.forEach(e => {
      const key = `${e.fromWorkspace}-${e.toWorkspace}`;
      const pattern = patterns.get(key) || { count: 0, totalTime: 0 };
      pattern.count++;
      pattern.totalTime += e.duration;
      patterns.set(key, pattern);
    });

    return Array.from(patterns.entries())
      .map(([key, data]) => {
        const [from, to] = key.split('-');
        return {
          from,
          to,
          frequency: data.count,
          averageTime: data.totalTime / data.count,
          confidence: (data.count / events.length) * 100
        };
      })
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);
  }

  private calculatePeakTimes(events: SwitchEvent[]): Array<{ hour: number; count: number }> {
    const hours = new Map<number, number>();

    events.forEach(e => {
      const hour = new Date(e.timestamp).getHours();
      hours.set(hour, (hours.get(hour) || 0) + 1);
    });

    return Array.from(hours.entries())
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private generateRecommendations(events: SwitchEvent[]): string[] {
    const recommendations: string[] = [];

    if (events.length > 50) {
      recommendations.push('High workspace switching frequency - consider organizing workspaces');
    }

    if (events.length < 5) {
      recommendations.push('Low workspace switching - consider using multiple workspaces');
    }

    return recommendations;
  }

  private convertToCsv(analytics: SwitchingMetrics): string {
    let csv = 'Metric,Value\n';
    csv += `Switch Count,${analytics.switchCount}\n`;
    csv += `Average Duration,${analytics.averageSwitchDuration}\n`;
    csv += `Most Visited Workspaces,${analytics.mostVisited.map(v => v.workspaceId).join('|')}\n`;
    return csv;
  }
}

export default SwitchingAnalytics;
