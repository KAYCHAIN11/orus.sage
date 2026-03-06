import { Logger } from '../../shared/src/logger/logger';
import { Analysis } from './analysis.engine';

export interface Block {
  id: number;
  sectionId: string;
  name: string;
  description: string;
  contentSections: ContentSection[];
  order: number;
}

export interface ContentSection {
  heading: string;
  content: string;
  tables?: Table[];
  charts?: Chart[];
}

export interface Table {
  title: string;
  headers: string[];
  rows: any[][];
}

export interface Chart {
  type: 'bar' | 'line' | 'pie' | 'table';
  title: string;
  data: any;
}

export interface Section {
  id: string;
  name: string;
  description: string;
  blocks: Block[];
}

export interface Blueprint {
  title: string;
  subtitle: string;
  sections: Section[];
  metadata: {
    complexity: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'SUPREMA';
    engines: number;
    totalBlocks: number;
    timestamp: Date;
    hashMaster: string;
  };
}

export class BlueprintStructurer {
  private logger: Logger;

  constructor(logger?: Logger) {
    this.logger = logger || Logger.create('BlueprintStructurer');
  }

  /**
   * Estrutura blueprint a partir da análise
   */
  async structureBlueprint(
    analysis: Analysis,
    templateId: string = 'extractionCoreV7'
  ): Promise<Blueprint> {
    this.logger.info(`📐 Estruturando blueprint: ${templateId}`);

    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} não encontrado`);
    }

    const sections = await this.adaptSections(template.sections, analysis);

    const blueprint: Blueprint = {
      title: analysis.mainTopics[0] || 'Blueprint',
      subtitle: analysis.summary,
      sections,
      metadata: {
        complexity: this.calculateComplexity(analysis),
        engines: this.countEngines(analysis),
        totalBlocks: sections.reduce((sum, s) => sum + s.blocks.length, 0),
        timestamp: new Date(),
        hashMaster: this.generateHashMaster(analysis)
      }
    };

    this.logger.info(`✅ Blueprint com ${blueprint.metadata.totalBlocks} blocos criado`);
    return blueprint;
  }

  /**
   * Retorna template pelo ID
   */
  private getTemplate(templateId: string): { sections: Section[] } | null {
    const templates: Record<string, { sections: Section[] }> = {
      'extractionCoreV7': {
        sections: [
          {
            id: 'A',
            name: 'Fundação Empresarial',
            description: 'Visão geral, mercado, visão cognitiva',
            blocks: Array.from({ length: 10 }, (_, i) => ({
              id: i + 1,
              sectionId: 'A',
              name: `Bloco ${i + 1}`,
              description: 'Detalhes',
              contentSections: [],
              order: i + 1
            }))
          }
        ]
      },
      'businessPlan': {
        sections: [
          {
            id: 'overview',
            name: 'Overview',
            description: 'Visão geral',
            blocks: [
              {
                id: 1,
                sectionId: 'overview',
                name: 'Executive Summary',
                description: '',
                contentSections: [],
                order: 1
              }
            ]
          }
        ]
      }
    };

    return templates[templateId] || null;
  }

  /**
   * Adapta seções aos dados
   */
  private async adaptSections(
    templateSections: Section[],
    analysis: Analysis
  ): Promise<Section[]> {
    return templateSections.map(section => ({
      ...section,
      blocks: section.blocks.map(block => ({
        ...block,
        contentSections: [
          {
            heading: block.name,
            content: this.generateBlockContent(block, analysis)
          }
        ]
      }))
    }));
  }

  /**
   * Gera conteúdo de um bloco
   */
  private generateBlockContent(block: Block, analysis: Analysis): string {
    const insights = analysis.keyInsights.slice(0, 3);
    const content = insights.map(i => `• ${i.title}: ${i.description}`).join('\n');
    return `${block.description}\n\n${content}`;
  }

  /**
   * Calcula complexidade
   */
  private calculateComplexity(
    analysis: Analysis
  ): 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'SUPREMA' {
    const score = analysis.keyInsights.length + analysis.patterns.length;
    if (score > 30) return 'SUPREMA';
    if (score > 20) return 'ADVANCED';
    if (score > 10) return 'INTERMEDIATE';
    return 'BASIC';
  }

  /**
   * Conta engines
   */
  private countEngines(analysis: Analysis): number {
    let count = 0;
    if (analysis.keyInsights.length > 0) count += 5;
    if (analysis.patterns.length > 0) count += 5;
    if (analysis.gaps.length > 0) count += 3;
    if (analysis.recommendations.length > 0) count += 2;
    return Math.min(count, 30);
  }

  /**
   * Gera hash master
   */
  private generateHashMaster(analysis: Analysis): string {
    const timestamp = new Date().toISOString().replace(/[-:\.]/g, '');
    const hash = Math.random().toString(36).substring(2, 18);
    return `orus.sage.deep.research.${hash}.${timestamp}`;
  }
}

