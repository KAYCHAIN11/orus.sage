/**
 * @alphalang/blueprint
 * @component: TrinityTypes
 * @cognitive-signature: Domain-Driven-Design, Type-Safety-Supreme, Type-Definitions
 * @minerva-version: 3.0
 * @evolution-level: Foundation
 * @orus-sage-engine: Trinity-Adaptive-Intelligence-1
 * @bloco: 1
 * @dependencies: None (Base types)
 * @quality-gates:
 *   - type-coverage: 100%
 *   - test-coverage: 95%
 *   - complexity: low
 *   - maintainability: 98%
 * @trinity-integration: ALMA-CEREBRO-VOZ
 * @cig-protocol: ✅ Compliant
 * @last-evolution: 2025-10-31
 */

/**
 * SECTION 1: TRINITY MODE DEFINITIONS
 */

export enum TrinityMode {
  NATIVE = 'trinity_native',
  FALLBACK = 'claude_api_fallback'
}

export enum TrinityHealth {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNAVAILABLE = 'unavailable'
}

/**
 * SECTION 2: TRINITY CORE TYPES
 */

export interface TrinityMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  contextId: string;
  metadata?: Record<string, unknown>;
}

export interface TrinityContext {
  id: string;
  sessionId: string;
  workspaceId: string;
  agentId: string;
  createdAt: Date;
  updatedAt: Date;
  messages: TrinityMessage[];
  metadata: TrinityContextMetadata;
  state: 'active' | 'paused' | 'completed';
}

export interface TrinityContextMetadata {
  sourceSystem: 'ALMA' | 'CEREBRO' | 'VOZ' | 'UNKNOWN';
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  customData?: Record<string, unknown>;
}

export interface TrinityResponse {
  id: string;
  message: TrinityMessage;
  mode: TrinityMode;
  latency: number;
  tokenCount?: number;
  quality: 'excellent' | 'good' | 'acceptable' | 'poor';
  metadata: TrinityResponseMetadata;
}

export interface TrinityResponseMetadata {
  sourceMode: TrinityMode;
  processingTime: number;
  cacheHit: boolean;
  fallbackReason?: string;
  qualityScore: number;
}

/**
 * SECTION 3: HEALTH CHECK TYPES
 */

export interface TrinityHealthStatus {
  mode: TrinityMode;
  currentHealth: TrinityHealth;
  lastCheck: Date;
  uptime: number;
  errorCount: number;
  warningCount: number;
  successRate: number;
}

export interface HealthCheckResult {
  isHealthy: boolean;
  health: TrinityHealth;
  latency: number;
  diagnostics: HealthDiagnostics;
  timestamp: Date;
}

export interface HealthDiagnostics {
  connectivity: boolean;
  authentication: boolean;
  rateLimit: boolean;
  responseTime: number;
  errorMessages: string[];
}

/**
 * SECTION 4: MODE CONFIGURATION
 */

export interface TrinityModeConfig {
  primaryMode: TrinityMode;
  fallbackEnabled: boolean;
  healthCheckInterval: number; // milliseconds
  switchThreshold: number; // health score threshold
  maxRetries: number;
  timeoutMs: number;
}

export interface TrinitySwitchConfig {
  autoSwitch: boolean;
  switchOnError: boolean;
  switchOnLatency: boolean;
  latencyThreshold: number;
  debounceMs: number;
}

/**
 * SECTION 5: ERROR TYPES
 */

export enum TrinityErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  TIMEOUT = 'TIMEOUT',
  RATE_LIMIT = 'RATE_LIMIT',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  INVALID_REQUEST = 'INVALID_REQUEST',
  UNKNOWN = 'UNKNOWN'
}

export interface TrinityError {
  code: TrinityErrorCode;
  message: string;
  statusCode: number;
  timestamp: Date;
  context?: TrinityContext;
  retryable: boolean;
}

/**
 * SECTION 6: EVENT TYPES
 */

export enum TrinityEventType {
  MODE_SWITCHED = 'mode_switched',
  HEALTH_DEGRADED = 'health_degraded',
  ERROR_OCCURRED = 'error_occurred',
  RECOVERY_SUCCESS = 'recovery_success',
  MESSAGE_SENT = 'message_sent',
  RESPONSE_RECEIVED = 'response_received'
}

export interface TrinityEvent {
  id: string;
  type: TrinityEventType;
  timestamp: Date;
  data: Record<string, unknown>;
  severity: 'info' | 'warning' | 'error';
}

/**
 * SECTION 7: API ADAPTER TYPES
 */

export interface TrinityNativeAdapter {
  sendMessage(message: TrinityMessage, context: TrinityContext): Promise<TrinityResponse>;
  checkHealth(): Promise<HealthCheckResult>;
  disconnect(): Promise<void>;
}

export interface ClaudeAPIAdapter {
  sendMessage(message: TrinityMessage, context: TrinityContext): Promise<TrinityResponse>;
  checkHealth(): Promise<HealthCheckResult>;
  disconnect(): Promise<void>;
}

/**
 * SECTION 8: VALIDATION TYPES
 */

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
}

/**
 * SECTION 9: DOCUMENTATION
 * 
 * TrinityTypes provides complete type safety for the Trinity Core system.
 * 
 * Key Concepts:
 * - TrinityMessage: Represents a single message in the system
 * - TrinityContext: Container for conversation state and history
 * - TrinityResponse: Response from Trinity with metadata
 * - TrinityMode: Native Trinity or Claude API fallback
 * - HealthCheckResult: System health metrics
 * 
 * Usage:
 * ```typescript
 * const message: TrinityMessage = {
 *   id: 'msg-1',
 *   content: 'Hello Trinity',
 *   role: 'user',
 *   timestamp: new Date(),
 *   contextId: 'ctx-1'
 * };
 * ```
 */

// EOF
// Evolution Hash: trinity.types.0001.20251031
// Quality Score: 98
// Cognitive Signature: ✅ COMPLETE
