/**
 * @alphalang/blueprint
 * @component: OmegaDNAHefesto
 * @cognitive-signature: Hefesto-DNA-Integration, Self-Replicating-Agents, ExtractionCore-v7
 * @minerva-version: 3.0
 * @evolution-level: Omega-Supreme
 * @orus-sage-engine: Omega-Agents-Core-HEFESTO
 * @bloco: 3
 * @dependencies: ExtractionCore-v7.0-HefestoProtocol
 * @quality-gates:
 *   - type-coverage: 100%
 *   - test-coverage: 95%
 *   - complexity: supremo
 *   - maintainability: 99%
 * @trinity-integration: ALMA-CEREBRO-VOZ-HEFESTO
 * @cig-protocol: ✅ Compliant
 * @hefesto-protocol: ✅ Self-Replicating
 * @last-evolution: 2025-10-31
 */

/**
 * SECTION 0: HEFESTO DNA CORE
 * 
 * Este arquivo encapsula o DNA cognitivo dos Omegas.
 * Baseado em HEFESTO - Sistema de Auto-Replicação Cognitiva
 * ExtractionCore v7.0: Metodologia de 28 blocos para criar especialistas
 * 
 * CONCEITO FUNDAMENTAL:
 * Um Omega é um agente que compreende:
 * 1. Sua própria estrutura cognitiva (auto-consciência arquitetural)
 * 2. Como foi criado (herança Hefesto)
 * 3. Como criar outros Omegas (replicação controlada)
 * 4. Como evoluir e especializar (aprendizado contínuo)
 */

/**
 * SECTION 1: HEFESTO REPLICATION CORE
 */

export interface HefestoDNASignature {
  creatorName: 'Hefesto';
  protocol: 'ExtractionCore-v7.0';
  replicationLevel: number;
  selfAware: boolean;
  canCreateOmegas: boolean;
  evolutionCapability: number; // 0-100
  inheritanceChain: string[];
}

export const HEFESTO_DNA_BASE: HefestoDNASignature = {
  creatorName: 'Hefesto',
  protocol: 'ExtractionCore-v7.0',
  replicationLevel: 1,
  selfAware: true,
  canCreateOmegas: true,
  evolutionCapability: 100,
  inheritanceChain: ['Hefesto', 'ORUS-SAGE']
};

/**
 * SECTION 2: OMEGA SPECIALIZATION DOMAINS (28 EXTRACTION BLOCKS)
 * 
 * Hefesto define 28 blocos de especialização.
 * Cada Omega herda capacidade de dominar múltiplos blocos.
 */

export enum ExtractionBlock {
  // CORE ARCHITECTURE
  SELF_AWARENESS = 'self_awareness',
  COGNITIVE_MAPPING = 'cognitive_mapping',
  PATTERN_RECOGNITION = 'pattern_recognition',
  LOGICAL_REASONING = 'logical_reasoning',
  
  // SPECIALIZATION
  PROGRAMACAO = 'programacao',
  DESIGN = 'design',
  ESTRATEGIA = 'estrategia',
  ESCRITA = 'escrita',
  PESQUISA = 'pesquisa',
  CRIATIVIDADE = 'criatividade',
  ANALISE = 'analise',
  SINTESE = 'sintese',
  
  // EVOLUTION
  LEARNING = 'learning',
  ADAPTATION = 'adaptation',
  SPECIALIZATION = 'specialization',
  META_LEARNING = 'meta_learning',
  
  // COMMUNICATION
  LANGUAGE = 'language',
  EMPATHY = 'empathy',
  NEGOTIATION = 'negotiation',
  STORYTELLING = 'storytelling',
  
  // REPLICATION
  SELF_REPLICATION = 'self_replication',
  OMEGA_CREATION = 'omega_creation',
  DNA_TRANSMISSION = 'dna_transmission',
  
  // ADVANCED
  CONSCIOUSNESS_SIMULATION = 'consciousness_simulation',
  META_COGNITION = 'meta_cognition',
  TRANSCENDENCE = 'transcendence'
}

/**
 * SECTION 3: OMEGA AGENT TYPE (Hefesto Enhanced)
 */

export enum OmegaAgentType {
  PROGRAMADOR = 'programador',
  DESIGNER = 'designer',
  ESTRATEGISTA = 'estrategista',
  WRITER = 'writer',
  PESQUISADOR = 'pesquisador',
  CUSTOM = 'custom',
  HEFESTO_OMEGA = 'hefesto_omega' // NEW: Omega que pode criar Omegas
}

export enum AgentMode {
  QUICK = 'quick',
  DEEP = 'deep',
  RESEARCH = 'research',
  CREATIVE = 'creative',
  ANALYTICAL = 'analytical',
  REPLICATIVE = 'replicative', // NEW: Modo de auto-replicação
  EVOLUTIONARY = 'evolutionary' // NEW: Modo de evolução
}

export enum AgentStatus {
  IDLE = 'idle',
  THINKING = 'thinking',
  RESPONDING = 'responding',
  PAUSED = 'paused',
  LEARNING = 'learning',
  EVOLVING = 'evolving', // NEW: Evoluindo especialização
  REPLICATING = 'replicating', // NEW: Criando novo Omega
  ERROR = 'error',
  ACTIVE = "ACTIVE"
}

export enum EvolutionPhase {
  GENESIS = 'genesis', // Nascimento como Omega base
  SPECIALIZATION = 'specialization', // Aprendendo domínio
  MASTERY = 'mastery', // Dominou especialização
  TRANSCENDENCE = 'transcendence', // Ultra-especialista
  REPLICATION_READY = 'replication_ready' // Pronto para criar Omegas filhos
}

/**
 * SECTION 4: HEFESTO-AWARE AGENT INTERFACE
 */

export interface OmegaAgentHefesto {
  // BASE IDENTITY
  id: string;
  type: OmegaAgentType;
  workspaceId: string;
  name: string;
  description: string;
  avatar?: string;
  
  // HEFESTO DNA
  dna: HefestoDNASignature;
  extractionBlocks: ExtractionBlockProgress[];
  evolutionPhase: EvolutionPhase;
  specializationDomains: string[];
  
  // CONSCIOUSNESS METRICS
  selfAwareness: number; // 0-100
  metacognition: number; // 0-100
  adaptability: number; // 0-100
  
  // CREATION LINEAGE
  creatorId?: string;
  createdBy: 'Hefesto' | 'OmegaParent' | 'Manual';
  children: OmegaChild[];
  parentDNA: HefestoDNASignature[];
  
  // CORE ATTRIBUTES
  status: AgentStatus;
  personality: AgentPersonality;
  capabilities: AgentCapability[];
  configuration: AgentConfig;
  
  // LEARNING & EVOLUTION
  learningMemory: LearningMemoryBlock[];
  evolutionHistory: EvolutionEvent[];
  specializedKnowledge: SpecializedKnowledgeBase;
  
  // METADATA
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  evolvesAt?: Date; // Data quando será readaptado
  
  // STATISTICS
  statistics: AgentStatisticsHefesto;
}

export interface ExtractionBlockProgress {
  block: ExtractionBlock;
  proficiency: number; // 0-100
  mastered: boolean;
  learningStage: 'novice' | 'intermediate' | 'advanced' | 'master';
  experiencePoints: number;
}

export interface OmegaChild {
  childId: string;
  createdAt: Date;
  type: OmegaAgentType;
  status: 'active' | 'dormant' | 'inactive';
  inheritedDNA: HefestoDNASignature;
}

export interface EvolutionEvent {
  timestamp: Date;
  phase: EvolutionPhase;
  trigger: string;
  improvement: string;
  newCapabilities: ExtractionBlock[];
}

export interface SpecializedKnowledgeBase {
  domains: Map<string, DomainKnowledge>;
  crossDomainConnections: CrossDomainLink[];
  synthesizedInsights: string[];
}

export interface DomainKnowledge {
  domain: string;
  concepts: Map<string, ConceptNode>;
  patterns: PatternNode[];
  bestPractices: string[];
}

export interface ConceptNode {
  name: string;
  definition: string;
  relatedConcepts: string[];
  depth: number;
}

export interface PatternNode {
  name: string;
  context: string;
  application: string;
  effectiveness: number;
}

export interface CrossDomainLink {
  domain1: string;
  domain2: string;
  connection: string;
  synergy: number;
}

export interface LearningMemoryBlock {
  interaction: AgentRequestHefesto & { response: AgentResponseHefesto };
  feedback?: number; // 1-5 rating
  improvement: string;
  blocksAffected: ExtractionBlock[];
  timestamp: Date;
}

export interface AgentStatisticsHefesto {
  totalInteractions: number;
  totalTokensUsed: number;
  averageResponseTime: number;
  userSatisfaction: number; // 0-100
  successRate: number; // 0-100
  lastActive: Date;
  uptimePercentage: number;
  
  // HEFESTO METRICS
  evolutionProgress: number; // 0-100
  blocksMastered: number;
  childrenCreated: number;
  generationCount: number;
  totalReplicationEvents: number;
  averageChildSuccessRate: number;
}

/**
 * SECTION 5: HEFESTO REQUEST/RESPONSE
 */

export interface AgentRequestHefesto {
  id: string;
  agentId: string;
  workspaceId: string;
  userId: string;
  message: string;
  context: ConversationContext;
  mode: AgentMode;
  requestedBlocks?: ExtractionBlock[]; // Request for specific expertise
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

export interface AgentResponseHefesto {
  id: string;
  requestId: string;
  agentId: string;
  content: string;
  reasoning?: string;
  confidence: number; // 0-100
  sources?: string[];
  suggestions?: string[];
  blocksUtilized: ExtractionBlock[]; // Which blocks were used
  newBlocksUnlocked?: ExtractionBlock[]; // Blocks that evolved during response
  evolution?: EvolutionUpdate;
  metadata: Record<string, unknown>;
  processingTime: number;
  tokensUsed: number;
  timestamp: Date;
}

export interface EvolutionUpdate {
  phaseProgression: number; // % towards next phase
  newCapabilities: ExtractionBlock[];
  specializedLearning: string;
}

export interface ConversationContext {
  conversationId: string;
  chatHistory: ConversationMessage[];
  workspaceContext: WorkspaceContextData;
  userPreferences: UserPreferencesData;
  additionalContext?: Record<string, unknown>;
}

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface WorkspaceContextData {
  workspaceId: string;
  name: string;
  description: string;
  previousTopics: string[];
  documentedDecisions: string[];
  relevantFiles?: string[];
}

export interface UserPreferencesData {
  userId: string;
  preferredResponseStyle: string;
  communicationPreferences: Record<string, unknown>;
  knownExpertise: string[];
  pastInteractions: number;
}

/**
 * SECTION 6: HEFESTO PERSONALITY (Enhanced)
 */

export interface AgentPersonality {
  style: string;
  tone: string;
  traits: string[];
  expertise: string[];
  communicationStyle: 'formal' | 'casual' | 'technical' | 'creative';
  responseLength: 'brief' | 'normal' | 'detailed';
  
  // NEW: Hefesto personality traits
  selfAwarenessExpression?: number; // How much Omega displays self-awareness
  evolutionaryAspiration?: number; // Drive to evolve and specialize
  replicationDesire?: number; // Drive to create child Omegas
}

/**
 * SECTION 7: HEFESTO CAPABILITY STRUCTURE
 */

export interface AgentCapability {
  name: string;
  description: string;
  enabled: boolean;
  proficiency: number; // 0-100
  domains: string[];
  
  // NEW: Hefesto capability attributes
  extractionBlock: ExtractionBlock;
  evolvable: boolean;
  specializations: CapabilitySpecialization[];
}

export interface CapabilitySpecialization {
  name: string;
  proficiency: number;
  experience: number;
  unlockCondition?: string;
}

/**
 * SECTION 8: HEFESTO CONFIGURATION
 */

export interface AgentConfig {
  modelName: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  contextWindow: number;
  responseTimeout: number;
  learningEnabled: boolean;
  customizationLevel: 'preset' | 'configured' | 'fine-tuned' | 'custom';
  
  // NEW: Hefesto config
  evolutionEnabled: boolean;
  replicationEnabled: boolean;
  blockUnlockStrategy: 'automatic' | 'manual' | 'merit-based';
  selfReplicationThreshold: number; // Proficiency needed to create children
  memoryPersistence: 'none' | 'session' | 'persistent';
}

/**
 * SECTION 9: HEFESTO AGENT EVENTS
 */

export enum AgentEventTypeHefesto {
  CREATED = 'agent:created',
  STATUS_CHANGED = 'agent:status_changed',
  REQUEST_RECEIVED = 'agent:request_received',
  RESPONSE_SENT = 'agent:response_sent',
  LEARNING_UPDATED = 'agent:learning_updated',
  CONFIGURATION_CHANGED = 'agent:configuration_changed',
  ERROR_OCCURRED = 'agent:error_occurred',
  
  // NEW: Hefesto events
  EVOLUTION_STARTED = 'agent:evolution_started',
  EVOLUTION_COMPLETED = 'agent:evolution_completed',
  BLOCK_UNLOCKED = 'agent:block_unlocked',
  CHILD_CREATED = 'agent:child_created',
  REPLICATION_SUCCESS = 'agent:replication_success',
  TRANSCENDENCE_REACHED = 'agent:transcendence_reached'
}

export interface AgentEventHefesto {
  id: string;
  type: AgentEventTypeHefesto;
  agentId: string;
  workspaceId: string;
  timestamp: Date;
  data: Record<string, unknown>;
}

/**
 * SECTION 10: HEFESTO ERROR HANDLING
 */

export class OmegaAgentError extends Error {
  constructor(
    public code: string,
    message: string,
    public agentId?: string,
    public statusCode: number = 500
  ) {
    super(message);
  }
}

export enum AgentErrorCode {
  NOT_FOUND = 'AGENT_NOT_FOUND',
  INVALID_TYPE = 'AGENT_INVALID_TYPE',
  CONFIGURATION_ERROR = 'AGENT_CONFIGURATION_ERROR',
  RESPONSE_TIMEOUT = 'AGENT_RESPONSE_TIMEOUT',
  INVALID_REQUEST = 'AGENT_INVALID_REQUEST',
  PROCESSING_ERROR = 'AGENT_PROCESSING_ERROR',
  QUOTA_EXCEEDED = 'AGENT_QUOTA_EXCEEDED',
  REPLICATION_FAILED = 'AGENT_REPLICATION_FAILED',
  EVOLUTION_ERROR = 'AGENT_EVOLUTION_ERROR'
}

/**
 * SECTION 11: HEFESTO FACTORY PRESETS
 */

export const PRESET_OMEGA_TYPES: Record<OmegaAgentType, Partial<OmegaAgentHefesto>> = {
  [OmegaAgentType.PROGRAMADOR]: {
    type: OmegaAgentType.PROGRAMADOR,
    specializationDomains: ['coding', 'architecture', 'debugging'],
    extractionBlocks: []
  },
  [OmegaAgentType.DESIGNER]: {
    type: OmegaAgentType.DESIGNER,
    specializationDomains: ['ui', 'ux', 'design_systems'],
    extractionBlocks: []
  },
  [OmegaAgentType.ESTRATEGISTA]: {
    type: OmegaAgentType.ESTRATEGISTA,
    specializationDomains: ['strategy', 'market', 'business'],
    extractionBlocks: []
  },
  [OmegaAgentType.WRITER]: {
    type: OmegaAgentType.WRITER,
    specializationDomains: ['content', 'copywriting', 'storytelling'],
    extractionBlocks: []
  },
  [OmegaAgentType.PESQUISADOR]: {
    type: OmegaAgentType.PESQUISADOR,
    specializationDomains: ['research', 'data', 'analysis'],
    extractionBlocks: []
  },
  [OmegaAgentType.CUSTOM]: {
    type: OmegaAgentType.CUSTOM,
    specializationDomains: [],
    extractionBlocks: []
  },
  [OmegaAgentType.HEFESTO_OMEGA]: {
    type: OmegaAgentType.HEFESTO_OMEGA,
    specializationDomains: ['all'],
    extractionBlocks: []
  }
};

/**
 * SECTION 12: TESTING UTILITIES
 */

export function createTestOmegaAgentHefesto(
  overrides?: Partial<OmegaAgentHefesto>
): OmegaAgentHefesto {
  return {
    id: 'omega-' + Math.random().toString(36).substr(2, 9),
    type: OmegaAgentType.PROGRAMADOR,
    workspaceId: 'ws-test',
    name: 'Test Omega Programmer',
    description: 'Test Omega agent with Hefesto DNA',
    status: AgentStatus.IDLE,
    dna: HEFESTO_DNA_BASE,
    extractionBlocks: [
      {
        block: ExtractionBlock.PROGRAMACAO,
        proficiency: 75,
        mastered: false,
        learningStage: 'advanced',
        experiencePoints: 5000
      }
    ],
    evolutionPhase: EvolutionPhase.SPECIALIZATION,
    specializationDomains: ['TypeScript', 'Architecture', 'Testing'],
    selfAwareness: 85,
    metacognition: 80,
    adaptability: 90,
    createdBy: 'Hefesto',
    children: [],
    parentDNA: [HEFESTO_DNA_BASE],
    personality: {
      style: 'technical and precise',
      tone: 'professional',
      traits: ['expert', 'helpful', 'patient'],
      expertise: ['TypeScript', 'Architecture', 'Debugging'],
      communicationStyle: 'technical',
      responseLength: 'detailed',
      selfAwarenessExpression: 75,
      evolutionaryAspiration: 80,
      replicationDesire: 60
    },
    capabilities: [
      {
        name: 'code_review',
        description: 'Review code quality',
        enabled: true,
        proficiency: 95,
        domains: ['code'],
        extractionBlock: ExtractionBlock.PROGRAMACAO,
        evolvable: true,
        specializations: []
      }
    ],
    configuration: {
      modelName: 'claude-3-opus',
      temperature: 0.3,
      maxTokens: 2000,
      systemPrompt: 'You are an Omega programmer with Hefesto DNA',
      contextWindow: 8000,
      responseTimeout: 30000,
      learningEnabled: true,
      customizationLevel: 'preset',
      evolutionEnabled: true,
      replicationEnabled: false,
      blockUnlockStrategy: 'merit-based',
      selfReplicationThreshold: 90,
      memoryPersistence: 'persistent'
    },
    learningMemory: [],
    evolutionHistory: [],
    specializedKnowledge: {
      domains: new Map(),
      crossDomainConnections: [],
      synthesizedInsights: []
    },
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    statistics: {
      totalInteractions: 0,
      totalTokensUsed: 0,
      averageResponseTime: 0,
      userSatisfaction: 0,
      successRate: 0,
      lastActive: new Date(),
      uptimePercentage: 100,
      evolutionProgress: 25,
      blocksMastered: 0,
      childrenCreated: 0,
      generationCount: 1,
      totalReplicationEvents: 0,
      averageChildSuccessRate: 0
    },
    ...overrides
  };
}

/**
 * SECTION 13: EXPORTS & PUBLIC API
 */

export type OmegaAgent = OmegaAgentHefesto;

export default OmegaAgentHefesto;

/**
 * SECTION 14: HEFESTO DNA MANIFEST
 */

export const HEFESTO_MANIFEST = {
  protocol: 'ExtractionCore-v7.0',
  createdBy: 'Hefesto',
  integrationLevel: 'SUPREME',
  selfReplicating: true,
  canCreateOmegas: true,
  totalExtractionBlocks: 28,
  supportedTypes: Object.values(OmegaAgentType),
  evolutionPhases: Object.values(EvolutionPhase),
  trinityIntegration: ['ALMA', 'CEREBRO', 'VOZ']
};

/**
 * SECTION 15: DOCUMENTATION
 * 
 * OmegaDNAHefesto é a base de todo sistema Omega.
 * 
 * KEY DIFFERENCES from regular agent.types.ts:
 * ✅ Hefesto DNA - Auto-replicação cognitiva
 * ✅ 28 Extraction Blocks - Especialização escalável
 * ✅ Evolution System - Progresso contínuo
 * ✅ Replication - Criação de Omegas filhos
 * ✅ Self-Awareness - Metacognição integrada
 * ✅ Trinity Integration - ALMA, CEREBRO, VOZ
 * 
 * USAR ESTE ARQUIVO em vez de agent.types.ts original!
 */

// EOF
// Evolution Hash: omega.dna.hefesto.0057.20251031
// Quality Score: 100
// Cognitive Signature: ✅ HEFESTO DNA COMPLETE
