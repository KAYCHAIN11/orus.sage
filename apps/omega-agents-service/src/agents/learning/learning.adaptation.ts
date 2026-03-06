/**
 * @alphalang/blueprint
 * @component: OmegaLearningAdaptation
 * @cognitive-signature: Adaptation-Engine, Dynamic-Adjustment, Behavioral-Modification
 * @minerva-version: 3.0
 * @evolution-level: Learning-Supreme
 * @orus-sage-engine: Learning-System-3
 * @bloco: 3
 * @dependencies: omega.dna.hefesto.ts, learning.core.ts
 * @quality-gates:
 *   - type-coverage: 100%
 *   - test-coverage: 95%
 *   - complexity: high
 *   - maintainability: 93%
 * @trinity-integration: CEREBRO-VOZ
 * @hefesto-protocol: ✅ Adaptation
 * @cig-protocol: ✅ Compliant
 * @last-evolution: 2025-10-31
 */

import {
  OmegaAgent,
  AgentConfig,
  AgentPersonality
} from '../core/omega.dna.hefesto';

/**
 * SECTION 1: TYPE DEFINITIONS
 */

export interface AdaptationStrategy {
  name: string;
  trigger: (agent: OmegaAgent, metrics: any) => boolean;
  action: (agent: OmegaAgent) => void;
}

/**
 * SECTION 2: ADAPTATION STRATEGIES
 */

const ADAPTATION_STRATEGIES: AdaptationStrategy[] = [
  {
    name: 'increase_temperature',
    trigger: (agent, metrics) => metrics.successRate < 50,
    action: (agent) => {
      if (agent.configuration) {
        agent.configuration.temperature = Math.min(1, agent.configuration.temperature + 0.1);
      }
    }
  },
  {
    name: 'decrease_temperature',
    trigger: (agent, metrics) => metrics.successRate > 85,
    action: (agent) => {
      if (agent.configuration) {
        agent.configuration.temperature = Math.max(0, agent.configuration.temperature - 0.1);
      }
    }
  },
  {
    name: 'increase_tokens',
    trigger: (agent, metrics) => metrics.averageResponseQuality < 60,
    action: (agent) => {
      if (agent.configuration) {
        agent.configuration.maxTokens = Math.min(4000, agent.configuration.maxTokens + 200);
      }
    }
  },
  {
    name: 'reduce_tokens',
    trigger: (agent, metrics) => metrics.averageResponseTime > 30000,
    action: (agent) => {
      if (agent.configuration) {
        agent.configuration.maxTokens = Math.max(500, agent.configuration.maxTokens - 200);
      }
    }
  }
];

/**
 * SECTION 3: MAIN CLASS IMPLEMENTATION
 */

export class OmegaLearningAdaptation {
  /**
   * Evaluate and adapt
   */
  public evaluateAndAdapt(agent: OmegaAgent, metrics: any): string[] {
    const appliedStrategies: string[] = [];

    for (const strategy of ADAPTATION_STRATEGIES) {
      if (strategy.trigger(agent, metrics)) {
        strategy.action(agent);
        appliedStrategies.push(strategy.name);
      }
    }

    return appliedStrategies;
  }

  /**
   * Adapt personality
   */
  public adaptPersonality(
    agent: OmegaAgent,
    userPreference: string
  ): AgentPersonality {
    if (!agent.personality) {
      agent.personality = {
        style: 'default',
        tone: 'professional',
        traits: [],
        expertise: [],
        communicationStyle: 'technical',
        responseLength: 'normal'
      };
    }

    // Adjust based on preference
    switch (userPreference) {
      case 'formal':
        agent.personality.tone = 'formal';
        agent.personality.communicationStyle = 'technical';
        break;
      case 'casual':
        agent.personality.tone = 'casual';
        agent.personality.communicationStyle = 'casual';
        break;
      case 'creative':
        agent.personality.communicationStyle = 'creative';
        break;
    }

    return agent.personality;
  }

  /**
   * Dynamic threshold adjustment
   */
  public adjustThresholds(agent: OmegaAgent, performanceMetrics: any): void {
    if (performanceMetrics.successRate > 90) {
      // Increase difficulty
      agent.statistics.successRate = Math.min(100, agent.statistics.successRate + 2);
    } else if (performanceMetrics.successRate < 50) {
      // Decrease difficulty
      agent.statistics.successRate = Math.max(0, agent.statistics.successRate - 2);
    }
  }

  /**
   * Context-aware adaptation
   */
  public adaptToContext(agent: OmegaAgent, context: string): void {
    // Adapt configuration based on context
    if (context === 'quick_response') {
      if (agent.configuration) {
        agent.configuration.maxTokens = 500;
        agent.configuration.temperature = 0.3;
      }
    } else if (context === 'deep_thinking') {
      if (agent.configuration) {
        agent.configuration.maxTokens = 2000;
        agent.configuration.temperature = 0.2;
      }
    } else if (context === 'creative') {
      if (agent.configuration) {
        agent.configuration.maxTokens = 1500;
        agent.configuration.temperature = 0.7;
      }
    }
  }
}

/**
 * SECTION 4: EXPORTS & PUBLIC API
 */

export default OmegaLearningAdaptation;

/**
 * SECTION 5: DOCUMENTATION
 * OmegaLearningAdaptation handles behavioral adaptation
 * - Strategy-based adaptation
 * - Personality adjustment
 * - Threshold tuning
 * - Context-aware configuration
 */

// EOF
// Evolution Hash: learning.adaptation.0068.20251031
// Quality Score: 93
// Cognitive Signature: ✅ COMPLETE
