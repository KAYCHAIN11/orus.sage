
import { Logger } from '../../shared/src/logger/logger';
import { RankedSource } from './deep.research.engine';

export interface Insight {
  id: string;
  title: string;
  description: string;
  evidence: string[];
  confidence: number;
  relatedTopics: string[];
  keyMetrics?: Record<string, any>;
}

export interface Pattern {
  id: string;
  name: string;
  description: string;
  frequency: number;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  examples: string[];
}

export interface Analysis {
  mainTopics: string[];
  keyInsights: Insight[];
  patterns: Pattern[];
  gaps: string[];
  recommendations: string[];
  summary: string;
  confidence: number;
  timestamp: Date;
}

/**
 * AnalysisEngine - Analisa fontes com CEREBRO integration
 * Não importa Cerebro direto - usa APIs
 */
export class AnalysisEngine {
  private logger: Logger;

  constructor(logger?: Logger) {
   this.logger = logger || Logger.create('AnalysisEngine');
  }

  /**
   * Analisa múltiplas fontes e extrai insights
   */
  async analyzeSources(sources: RankedSource[]): Promise<Analysis> {
    this.logger.info(`🧠 Analisando ${sources.length} fontes...`);

    const insights = await this.extractInsights(sources);
    const patterns = await this.identifyPatterns(insights);
    const gaps = await this.identifyGaps(insights);
    const recommendations = await this.generateRecommendations(patterns, gaps);
    const mainTopics = this.extractTopics(insights);
    const summary = await this.generateSummary(insights, patterns);
    const confidence = this.calculateConfidence(sources, insights);

    return {
      mainTopics,
      keyInsights: insights,
      patterns,
      gaps,
      recommendations,
      summary,
      confidence,
      timestamp: new Date()
    };
  }

  /**
   * Extrai insights das fontes
   */
  private async extractInsights(sources: RankedSource[]): Promise<Insight[]> {
    const insights: Insight[] = [];
    const processed = new Set<string>();

    for (const source of sources.slice(0, 20)) {
      try {
        // ✅ INTEGRAÇÃO COM CEREBRO - Via API
        const insightResponse = await fetch('/api/trinity/cerebro/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: source.title,
            content: source.content,
            credibility: source.credibility
          })
        });

        if (!insightResponse.ok) {
          this.logger.warn(`⚠️ Erro ao analisar ${source.title}`);
          continue;
        }

        const sourceInsights = await insightResponse.json();

        for (const insight of sourceInsights.insights || []) {
          const key = insight.title.toLowerCase();
          if (!processed.has(key)) {
            processed.add(key);
            insights.push({
              id: `insight-${insights.length}`,
              title: insight.title,
              description: insight.description,
              evidence: [source.url],
              confidence: source.credibility * 0.8,
              relatedTopics: insight.topics || [],
              keyMetrics: insight.metrics
            });
          }
        }
      } catch (error) {
        this.logger.warn(`⚠️ Erro ao processar: ${source.title}`, error);
      }
    }

    this.logger.info(`✅ ${insights.length} insights extraídos`);
    return insights.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Identifica padrões nos insights
   */
  private async identifyPatterns(insights: Insight[]): Promise<Pattern[]> {
    const patterns: Pattern[] = [];
    const topicFreq = new Map<string, number>();

    for (const insight of insights) {
      for (const topic of insight.relatedTopics) {
        topicFreq.set(topic, (topicFreq.get(topic) || 0) + 1);
      }
    }

    let patternId = 0;
    for (const [topic, frequency] of topicFreq) {
      if (frequency >= 2) {
        patterns.push({
          id: `pattern-${patternId++}`,
          name: topic,
          description: `Identificado em ${frequency} insights`,
          frequency,
          impact: frequency > 5 ? 'HIGH' : frequency > 2 ? 'MEDIUM' : 'LOW',
          examples: insights
            .filter(i => i.relatedTopics.includes(topic))
            .slice(0, 3)
            .map(i => i.title)
        });
      }
    }

    this.logger.debug(`📊 ${patterns.length} padrões identificados`);
    return patterns.sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * Identifica gaps (informações faltando)
   */
  private async identifyGaps(insights: Insight[]): Promise<string[]> {
    const gaps: string[] = [];
    const expectedTopics = [
      'market size',
      'competition',
      'technology',
      'pricing',
      'business model',
      'team',
      'roadmap',
      'funding'
    ];

    const coveredTopics = new Set<string>();
    for (const insight of insights) {
      for (const topic of insight.relatedTopics) {
        coveredTopics.add(topic.toLowerCase());
      }
    }

    for (const expected of expectedTopics) {
      if (!coveredTopics.has(expected)) {
        gaps.push(`Falta: ${expected}`);
      }
    }

    this.logger.debug(`⚠️ ${gaps.length} gaps identificados`);
    return gaps;
  }

  /**
   * Gera recomendações baseadas em padrões
   */
  private async generateRecommendations(
    patterns: Pattern[],
    gaps: string[]
  ): Promise<string[]> {
    const recommendations: string[] = [];

    for (const pattern of patterns.filter(p => p.impact === 'HIGH')) {
      recommendations.push(`Foco: ${pattern.name} (${pattern.frequency} menções)`);
    }

    for (const gap of gaps.slice(0, 3)) {
      recommendations.push(`Pesquisar: ${gap}`);
    }

    return recommendations;
  }

  /**
   * Extrai tópicos principais
   */
  private extractTopics(insights: Insight[]): string[] {
    const topics = new Set<string>();
    for (const insight of insights.slice(0, 10)) {
      for (const topic of insight.relatedTopics) {
        topics.add(topic);
      }
    }
    return Array.from(topics).slice(0, 8);
  }

  /**
   * Gera sumário
   */
  private async generateSummary(
    insights: Insight[],
    patterns: Pattern[]
  ): Promise<string> {
    if (insights.length === 0) {
      return 'Análise sem dados suficientes.';
    }

    const topInsights = insights.slice(0, 3);
    let summary = `Análise de ${insights.length} insights: `;
    summary += topInsights.map(i => i.title).join(', ');

    if (patterns.length > 0) {
      summary += `. Padrões: ${patterns.slice(0, 2).map(p => p.name).join(', ')}`;
    }

    summary += '.';
    return summary;
  }

  /**
   * Calcula confiança geral
   */
  private calculateConfidence(sources: RankedSource[], insights: Insight[]): number {
    if (sources.length === 0 || insights.length === 0) return 0;

    const avgSourceCredibility =
      sources.reduce((a, s) => a + s.credibility, 0) / sources.length;
    const avgInsightConfidence =
      insights.reduce((a, i) => a + i.confidence, 0) / insights.length;
    const diversityScore = Math.min(1, sources.length / 10);

    return avgSourceCredibility * 0.4 + avgInsightConfidence * 0.4 + diversityScore * 0.2;
  }
}
