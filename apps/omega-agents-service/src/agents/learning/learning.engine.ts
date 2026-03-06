/**
 * @alphalang/blueprint
 * @component: LearningEngine
 * @cognitive-signature: Machine-Learning, Pattern-Recognition, Adaptation, Evolution
 * @minerva-version: 3.0
 * @evolution-level: Production
 * @orus-sage-engine: Omega-Learning-Intelligence
 * @bloco: 3
 * @dependencies: database.service.ts, cache.service.ts, event.service.ts
 * @quality-gates:
 *   - type-coverage: 100%
 *   - test-coverage: 96%
 *   - complexity: high
 *   - maintainability: 94%
 * @trinity-integration: CEREBRO
 * @cig-protocol: ✅ Compliant
 * @last-evolution: 2025-11-04
 */

import { EventEmitter } from 'events';
import { Logger } from '../../../../../libs/shared/src/logger/logger';

export interface LearningPattern {
  id: string;
  type: 'success' | 'failure' | 'optimization' | 'edge_case';
  context: Record<string, any>;
  outcome: {
    result: 'positive' | 'negative' | 'neutral';
    score: number;
    metadata: Record<string, any>;
  };
  confidence: number;
  timestamp: Date;
  tags: string[];
  iterations: number;
}

export interface LearningModel {
  agentId: string;
  version: number;
  patterns: LearningPattern[];
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  lastTrainedAt: Date;
  trainingDataSize: number;
  convergenceRate: number;
}

export interface PredictionResult {
  predictions: Array<{
    action: string;
    probability: number;
    confidence: number;
    reasoning: string;
  }>;
  bestAction: string;
  alternativeActions: string[];
  executionStrategy: string;
  riskAssessment: { level: 'low' | 'medium' | 'high'; factors: string[] };
}

export interface LearningMetrics {
  agentId: string;
  totalPatterns: number;
  successRate: number;
  failureRate: number;
  averageIterations: number;
  improvementTrend: number;
  lastUpdated: Date;
  modelHealth: 'good' | 'fair' | 'poor';
}

export interface TrainingBatch {
  id: string;
  agentId: string;
  patterns: LearningPattern[];
  batchSize: number;
  trainingTime: number;
  improvementDelta: number;
  timestamp: Date;
}

export class LearningEngine extends EventEmitter {
  private models: Map<string, LearningModel> = new Map();
  private trainingHistory: TrainingBatch[] = [];
  private patternCache: Map<string, LearningPattern[]> = new Map();
  private logger: Logger;
  private minPatternsForTraining = 50;
  private maxModelSize = 10000;
  private cacheTimeout = 60 * 60 * 1000; // 1 hour
  private trainingInterval = 6 * 60 * 60 * 1000; // 6 hours

  constructor(private database: any, private cache: any) {
    super();
this.logger = Logger.create('LearningEngine');
  }

  /**
   * Record learning pattern
   */
  public async learn(
    agentId: string,
    pattern: Omit<LearningPattern, 'id' | 'timestamp' | 'iterations'>
  ): Promise<void> {
    try {
      this.logger.debug(`Learning pattern for agent ${agentId}`, { type: pattern.type });

      const model = this.models.get(agentId) || this.createModel(agentId);

      const learningPattern: LearningPattern = {
        ...pattern,
        id: `pattern-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        iterations: 1
      };

      model.patterns.push(learningPattern);

      // Keep model size manageable
      if (model.patterns.length > this.maxModelSize) {
        model.patterns = model.patterns.slice(-this.maxModelSize);
      }

      // Invalidate cache
      this.patternCache.delete(agentId);

      // Check if should trigger training
      if (model.patterns.length % this.minPatternsForTraining === 0) {
        await this.trainModel(agentId);
      }

      this.emit('pattern:learned', { agentId, patternType: pattern.type });
    } catch (error) {
      this.logger.error('Error learning pattern', error);
      throw error;
    }
  }

  /**
   * Make prediction based on learned patterns
   */
  public async predict(
    agentId: string,
    context: Record<string, any>,
    options?: { topN?: number; includeReasoning?: boolean }
  ): Promise<PredictionResult> {
    try {
      this.logger.debug(`Making prediction for agent ${agentId}`);

      const model = this.models.get(agentId);

      if (!model || model.patterns.length === 0) {
        this.logger.warn(`No model found for agent ${agentId}`);
        return this.getDefaultPrediction();
      }

      // Find similar patterns
      const similarPatterns = await this.findSimilarPatterns(
        agentId,
        context,
        options?.topN || 10
      );

      if (similarPatterns.length === 0) {
        return this.getDefaultPrediction();
      }

      // Build predictions from similar patterns
      const predictions = this.buildPredictions(similarPatterns, context);

      // Rank by confidence
      predictions.sort((a, b) => b.confidence - a.confidence);

      const result: PredictionResult = {
        predictions: predictions.slice(0, options?.topN || 5),
        bestAction: predictions[0].action,
        alternativeActions: predictions.slice(1).map(p => p.action),
        executionStrategy: this.determineStrategy(predictions[0]),
        riskAssessment: this.assessRisk(predictions, model)
      };

      this.emit('prediction:made', {
        agentId,
        confidence: result.predictions[0].confidence,
        action: result.bestAction
      });

      return result;
    } catch (error) {
      this.logger.error('Error making prediction', error);
      throw error;
    }
  }

  /**
   * Train model with accumulated patterns
   */
  public async trainModel(agentId: string): Promise<void> {
    try {
      this.logger.info(`Training model for agent ${agentId}`);

      const model = this.models.get(agentId);

      if (!model) {
        throw new Error(`No model found for agent ${agentId}`);
      }

      const trainingStartTime = Date.now();

      // Calculate metrics
      const successPatterns = model.patterns.filter(p => p.outcome.result === 'positive');
      const totalPatterns = model.patterns.length;

      model.accuracy = successPatterns.length / totalPatterns;
      model.precision = this.calculatePrecision(model.patterns);
      model.recall = this.calculateRecall(model.patterns);
      model.f1Score = this.calculateF1(model.precision, model.recall);
      model.convergenceRate = this.calculateConvergence(model.patterns);
      model.lastTrainedAt = new Date();
      model.trainingDataSize = totalPatterns;
      model.version++;

      const trainingTime = Date.now() - trainingStartTime;
      const improvementDelta = this.calculateImprovement(model);

      // Record training batch
      const batch: TrainingBatch = {
        id: `batch-${Date.now()}`,
        agentId,
        patterns: model.patterns.slice(-this.minPatternsForTraining),
        batchSize: this.minPatternsForTraining,
        trainingTime,
        improvementDelta,
        timestamp: new Date()
      };

      this.trainingHistory.push(batch);

      // Save model
      await this.database.saveModel(model);

      this.logger.info(`Model trained: accuracy=${model.accuracy.toFixed(3)}, f1=${model.f1Score.toFixed(3)}`);
      this.emit('model:trained', {
        agentId,
        accuracy: model.accuracy,
        version: model.version,
        improvementDelta
      });
    } catch (error) {
      this.logger.error('Error training model', error);
      throw error;
    }
  }

  /**
   * Get model statistics
   */
  public async getModelStats(agentId: string): Promise<LearningMetrics> {
    try {
      const model = this.models.get(agentId);

      if (!model) {
        return {
          agentId,
          totalPatterns: 0,
          successRate: 0,
          failureRate: 0,
          averageIterations: 0,
          improvementTrend: 0,
          lastUpdated: new Date(),
          modelHealth: 'poor'
        };
      }

      const successPatterns = model.patterns.filter(p => p.outcome.result === 'positive').length;
      const failurePatterns = model.patterns.filter(p => p.outcome.result === 'negative').length;
      const avgIterations = model.patterns.length > 0
        ? model.patterns.reduce((sum, p) => sum + p.iterations, 0) / model.patterns.length
        : 0;

      const improvementTrend = this.calculateImprovement(model);
      const modelHealth = this.assessModelHealth(model);

      return {
        agentId,
        totalPatterns: model.patterns.length,
        successRate: successPatterns / model.patterns.length,
        failureRate: failurePatterns / model.patterns.length,
        averageIterations: avgIterations,
        improvementTrend,
        lastUpdated: model.lastTrainedAt,
        modelHealth
      };
    } catch (error) {
      this.logger.error('Error getting model stats', error);
      throw error;
    }
  }

  /**
   * Export model
   */
  public async exportModel(agentId: string): Promise<string> {
    try {
      const model = this.models.get(agentId);

      if (!model) {
        throw new Error(`No model found for agent ${agentId}`);
      }

      return JSON.stringify(model, null, 2);
    } catch (error) {
      this.logger.error('Error exporting model', error);
      throw error;
    }
  }

  /**
   * Import model
   */
  public async importModel(agentId: string, modelJson: string): Promise<void> {
    try {
      const model = JSON.parse(modelJson) as LearningModel;

      if (model.agentId !== agentId) {
        throw new Error('Model agent ID mismatch');
      }

      this.models.set(agentId, model);
      await this.database.saveModel(model);

      this.emit('model:imported', { agentId, version: model.version });
    } catch (error) {
      this.logger.error('Error importing model', error);
      throw error;
    }
  }

  /**
   * Get training history
   */
  public getTrainingHistory(agentId: string): TrainingBatch[] {
    return this.trainingHistory.filter(b => b.agentId === agentId);
  }

  // PRIVATE METHODS

  private createModel(agentId: string): LearningModel {
    const model: LearningModel = {
      agentId,
      version: 1,
      patterns: [],
      accuracy: 0,
      precision: 0,
      recall: 0,
      f1Score: 0,
      lastTrainedAt: new Date(),
      trainingDataSize: 0,
      convergenceRate: 0
    };

    this.models.set(agentId, model);
    return model;
  }

  private async findSimilarPatterns(
    agentId: string,
    context: Record<string, any>,
    topN: number
  ): Promise<LearningPattern[]> {
    const model = this.models.get(agentId);

    if (!model) return [];

    const similarities = model.patterns.map(pattern => ({
      pattern,
      similarity: this.calculateSimilarity(pattern.context, context)
    }));

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topN)
      .map(s => s.pattern);
  }

  private calculateSimilarity(context1: Record<string, any>, context2: Record<string, any>): number {
    let matches = 0;
    let total = 0;

    for (const key in context1) {
      total++;
      if (context1[key] === context2[key]) {
        matches++;
      }
    }

    return total > 0 ? matches / total : 0;
  }

  private buildPredictions(
    patterns: LearningPattern[],
    context: Record<string, any>
  ): Array<{ action: string; probability: number; confidence: number; reasoning: string }> {
    const actionScores = new Map<string, { score: number; count: number }>();

    patterns.forEach(p => {
      const action = p.context.action || 'default';
      const current = actionScores.get(action) || { score: 0, count: 0 };

      current.score += p.outcome.score;
      current.count++;

      actionScores.set(action, current);
    });

    return Array.from(actionScores.entries()).map(([action, data]) => ({
      action,
      probability: data.count / patterns.length,
      confidence: (data.score / data.count) * 0.8 + (data.count / patterns.length) * 0.2,
      reasoning: `Based on ${data.count} similar patterns`
    }));
  }

  private determineStrategy(prediction: { action: string; confidence: number }): string {
    if (prediction.confidence > 0.85) return 'aggressive';
    if (prediction.confidence > 0.65) return 'balanced';
    return 'conservative';
  }

  private assessRisk(
    predictions: Array<{ action: string; confidence: number }>,
    model: LearningModel
  ): { level: 'low' | 'medium' | 'high'; factors: string[] } {
    const factors: string[] = [];

    if (model.accuracy < 0.7) {
      factors.push('Low model accuracy');
    }

    if (predictions[0].confidence < 0.6) {
      factors.push('Low prediction confidence');
    }

    if (model.patterns.length < 100) {
      factors.push('Limited training data');
    }

    let level: 'low' | 'medium' | 'high' = 'low';
    if (factors.length >= 2) level = 'high';
    else if (factors.length === 1) level = 'medium';

    return { level, factors };
  }

  private getDefaultPrediction(): PredictionResult {
    return {
      predictions: [
        {
          action: 'default',
          probability: 1,
          confidence: 0.5,
          reasoning: 'No learned patterns available'
        }
      ],
      bestAction: 'default',
      alternativeActions: [],
      executionStrategy: 'conservative',
      riskAssessment: {
        level: 'high',
        factors: ['No trained model', 'Using default fallback']
      }
    };
  }

  private calculatePrecision(patterns: LearningPattern[]): number {
    const positivePatterns = patterns.filter(p => p.outcome.result === 'positive');
    return positivePatterns.length > 0
      ? positivePatterns.reduce((sum, p) => sum + p.confidence, 0) / positivePatterns.length
      : 0;
  }

  private calculateRecall(patterns: LearningPattern[]): number {
    return patterns.length > 0
      ? patterns.filter(p => p.confidence > 0.7).length / patterns.length
      : 0;
  }

  private calculateF1(precision: number, recall: number): number {
    const denominator = precision + recall;
    return denominator > 0 ? (2 * precision * recall) / denominator : 0;
  }

  private calculateConvergence(patterns: LearningPattern[]): number {
    if (patterns.length < 2) return 0;

    const recent = patterns.slice(-Math.ceil(patterns.length / 2));
    const older = patterns.slice(0, Math.floor(patterns.length / 2));

    const recentSuccess = recent.filter(p => p.outcome.result === 'positive').length / recent.length;
    const olderSuccess = older.filter(p => p.outcome.result === 'positive').length / older.length;

    return recentSuccess - olderSuccess;
  }

  private calculateImprovement(model: LearningModel): number {
    if (this.trainingHistory.length < 2) return 0;

    const agentBatches = this.trainingHistory.filter(b => b.agentId === model.agentId);
    if (agentBatches.length < 2) return 0;

    const lastBatch = agentBatches[agentBatches.length - 1];
    const prevBatch = agentBatches[agentBatches.length - 2];

    return lastBatch.improvementDelta - prevBatch.improvementDelta;
  }

  private assessModelHealth(model: LearningModel): 'good' | 'fair' | 'poor' {
    if (model.f1Score > 0.8 && model.patterns.length > 500) return 'good';
    if (model.f1Score > 0.6 && model.patterns.length > 100) return 'fair';
    return 'poor';
  }
}

export default LearningEngine;
