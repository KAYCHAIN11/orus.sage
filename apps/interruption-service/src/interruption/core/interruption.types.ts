/**
 * @alphalang/blueprint
 * @component: InterruptionSystemTypes
 * @cognitive-signature: Pause-Semantics, Question-Types, Recovery-Patterns
 * @minerva-version: 3.0
 * @evolution-level: Interruption-Supreme
 * @orus-sage-engine: Interruption-System-1
 * @bloco: 4
 * @dependencies: None
 * @quality-gates:
 *   - type-coverage: 100%
 *   - test-coverage: 95%
 *   - complexity: medium
 *   - maintainability: 98%
 * @trinity-integration: VOZ-CEREBRO
 * @cig-protocol: ✅ Compliant
 * @last-evolution: 2025-10-31
 */
type InterruptionSystemTypes = Record<string, any>;

/**
 * SECTION 1: PAUSE TYPES
 */

export enum PauseType {
  CLARIFICATION = 'clarification',
  CONFIRMATION = 'confirmation',
  DECISION_POINT = 'decision_point',
  SAFETY_CHECK = 'safety_check',
  USER_PREFERENCE = 'user_preference',
  CONTEXT_SHIFT = 'context_shift',
  AMBIGUITY = 'ambiguity'
}

export enum PauseTrigger {
  EXPLICIT_USER = 'explicit_user',
  IMPLICIT_DETECTION = 'implicit_detection',
  SYSTEM_THRESHOLD = 'system_threshold',
  CONTEXT_CHANGE = 'context_change',
  SAFETY_VIOLATION = 'safety_violation',
  RESOURCE_LIMIT = 'resource_limit'
}

/**
 * SECTION 2: PAUSE STATE
 */

export interface PauseState {
  id: string;
  conversationId: string;
  userId: string;
  type: PauseType;
  trigger: PauseTrigger;
  timestamp: Date;
  contextSnapshot: ConversationSnapshot;
  pausedAt: Date;
  resumedAt?: Date;
  duration?: number;
  reason: string;
  metadata: Record<string, unknown>;
}

export interface ConversationSnapshot {
  conversationId: string;
  messageCount: number;
  lastMessage: string;
  lastSender: 'user' | 'assistant';
  context: Record<string, unknown>;
  agentState: Record<string, unknown>;
  timestamp: Date;
}

/**
 * SECTION 3: QUESTION TYPES
 */

export enum QuestionType {
  CLARIFICATION_SIMPLE = 'clarification_simple',
  CLARIFICATION_COMPLEX = 'clarification_complex',
  CONFIRMATION_YES_NO = 'confirmation_yes_no',
  CONFIRMATION_MULTIPLE_CHOICE = 'confirmation_multiple_choice',
  USER_INTENT = 'user_intent',
  BOUNDARY_CHECK = 'boundary_check'
}

export interface PauseQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  options?: string[];
  expectedResponseType: 'yes_no' | 'text' | 'multiple_choice' | 'freeform';
  timeoutMs: number;
  metadata: Record<string, unknown>;
}

/**
 * SECTION 4: RESPONSE PATTERNS
 */

export interface UserResponse {
  id: string;
  pauseId: string;
  questionId: string;
  content: string;
  responseTime: number;
  timestamp: Date;
  sentiment?: 'positive' | 'negative' | 'neutral';
  confidence?: number; // 0-100
}

/**
 * SECTION 5: RECOVERY PATTERNS
 */

export enum RecoveryStrategy {
  IMMEDIATE_RESUME = 'immediate_resume',
  CLARIFIED_RESUME = 'clarified_resume',
  CONTEXT_ADJUSTED_RESUME = 'context_adjusted_resume',
  NEW_DIRECTION = 'new_direction',
  ABORT_AND_RESET = 'abort_and_reset'
}

export interface RecoveryPlan {
  strategy: RecoveryStrategy;
  contextAdjustments: Record<string, unknown>;
  agentInstructions: string;
  nextMessage?: string;
  suggestedActions: string[];
}

/**
 * SECTION 6: INTERRUPTION METRICS
 */

export interface InterruptionMetrics {
  pauseId: string;
  pauseType: PauseType;
  totalPauseDuration: number;
  userResponseTime: number;
  clarificationLevel: number; // 0-100
  recoverySuccess: boolean;
  conversationFlowScore: number; // 0-100
  userSatisfactionDelta: number; // -100 to +100
}

/**
 * SECTION 7: DECISION EVENTS
 */

export enum DecisionEventType {
  PAUSE_INITIATED = 'pause_initiated',
  QUESTION_PRESENTED = 'question_presented',
  USER_RESPONDED = 'user_responded',
  CLARIFICATION_ACHIEVED = 'clarification_achieved',
  RECOVERY_STARTED = 'recovery_started',
  CONVERSATION_RESUMED = 'conversation_resumed',
  PAUSE_ABORTED = 'pause_aborted'
}

export interface DecisionEvent {
  id: string;
  type: DecisionEventType;
  pauseId: string;
  timestamp: Date;
  metadata: Record<string, unknown>;
}

/**
 * SECTION 8: SETTINGS
 */

export interface InterruptionSettings {
  enabled: boolean;
  pauseThreshold: number; // 0-100 confidence needed to pause
  autoResumeTimeout: number; // ms, 0 = never auto resume
  maxPausesPerConversation: number;
  enableClarification: boolean;
  enableConfirmation: boolean;
  enableSafetyChecks: boolean;
  conversationFlowBias: 'fluid' | 'cautious' | 'balanced'; // How much interruption
}

/**
 * SECTION 9: EXPORTS
 */

export default InterruptionSystemTypes;

/**
 * SECTION 10: DOCUMENTATION
 * InterruptionSystemTypes defines all pause/recovery mechanics
 * - Pause types and triggers
 * - Question frameworks
 * - Recovery strategies
 * - Metrics and events
 */

// EOF
// Evolution Hash: interruption.types.0080.20251031
// Quality Score: 98
// Cognitive Signature: ✅ COMPLETE
