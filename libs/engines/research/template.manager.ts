import { Logger } from '../../shared/src/logger/logger';
import { Blueprint } from './blueprint.structurer';
import { Analysis } from './analysis.engine';

export interface Template {
  id: string;
  name: string;
  description: string;
  complexity: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'SUPREMA';
  category: 'business' | 'technical' | 'research' | 'analysis';
  render: (analysis: Analysis) => Promise<Blueprint>;
}

/**
 * TemplateManager - Gerencia templates de blueprints
 */
export class TemplateManager {
  private templates: Map<string, Template> = new Map();
  private logger: Logger;

  constructor(logger?: Logger) {
     this.logger = logger || Logger.create('TemplateManager');
    this.registerDefaultTemplates();
  }

  /**
   * Registra templates padrão
   */
  private registerDefaultTemplates(): void {
    this.templates.set('extractioncore-v7', {
      id: 'extractioncore-v7',
      name: 'ExtractionCore V7 SUPREME',
      description: '31 blocos estruturados em 3 seções',
      complexity: 'SUPREMA',
      category: 'research',
      render: async (analysis: Analysis) => this.renderExtractionCoreV7(analysis)
    });

    this.templates.set('business-plan', {
      id: 'business-plan',
      name: 'Business Plan',
      description: 'Plano de negócios executivo',
      complexity: 'ADVANCED',
      category: 'business',
      render: async (analysis: Analysis) => this.renderBusinessPlan(analysis)
    });

    this.logger.info(`✅ ${this.templates.size} templates registrados`);
  }

  /**
   * Retorna template
   */
  getTemplate(templateId: string): Template | undefined {
    return this.templates.get(templateId);
  }

  /**
   * Lista templates
   */
  listTemplates(category?: string): Template[] {
    const templates = Array.from(this.templates.values());
    if (category) {
      return templates.filter(t => t.category === category);
    }
    return templates;
  }

  /**
   * Aplica template aos dados
   */
  async applyTemplate(analysis: Analysis, templateId: string): Promise<Blueprint> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} não encontrado`);
    }
    this.logger.info(`📐 Aplicando template: ${template.name}`);
    return template.render(analysis);
  }

  /**
   * Renderiza ExtractionCore V7
   */
  private async renderExtractionCoreV7(analysis: Analysis): Promise<Blueprint> {
    return {
      title: `${analysis.mainTopics[0]} - ExtractionCore V7`,
      subtitle: analysis.summary,
      sections: [
        {
          id: 'A',
          name: 'Fundação Empresarial',
          description: 'Fundação, mercado, visão cognitiva',
          blocks: Array.from({ length: 10 }, (_, i) => ({
            id: i + 1,
            sectionId: 'A',
            name: `Bloco ${i + 1}`,
            description: '',
            contentSections: [],
            order: i + 1
          }))
        }
      ],
      metadata: {
        complexity: 'SUPREMA',
        engines: 30,
        totalBlocks: 10,
        timestamp: new Date(),
        hashMaster: this.generateHashMaster(analysis.mainTopics[0])
      }
    };
  }

  /**
   * Renderiza Business Plan
   */
  private async renderBusinessPlan(analysis: Analysis): Promise<Blueprint> {
    return {
      title: `${analysis.mainTopics[0]} - Business Plan`,
      subtitle: 'Plano de negócios estratégico',
      sections: [
        {
          id: 'overview',
          name: 'Overview',
          description: 'Visão geral executiva',
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
      ],
      metadata: {
        complexity: 'ADVANCED',
        engines: 20,
        totalBlocks: 1,
        timestamp: new Date(),
        hashMaster: this.generateHashMaster(analysis.mainTopics[0])
      }
    };
  }

  /**
   * Gera hash master
   */
  private generateHashMaster(topic: string): string {
    const timestamp = new Date().toISOString().replace(/[-:\.]/g, '');
    const hash = Math.random().toString(36).substring(2, 16);
    return `orus.sage.template.${hash}.${timestamp}`;
  }

  /**
   * Registra template customizado
   */
  registerTemplate(template: Template): void {
    this.templates.set(template.id, template);
    this.logger.info(`✅ Template registrado: ${template.name}`);
  }
}
