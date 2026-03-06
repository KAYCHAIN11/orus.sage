import { Logger } from '../../shared/src/logger/logger';
import { Blueprint } from './blueprint.structurer';

export interface Document {
  id: string;
  format: 'pdf' | 'markdown' | 'html';
  title: string;
  content: string;
  metadata: {
    author: string;
    createdAt: Date;
    wordCount: number;
    pageCount?: number;
  };
  downloadUrl?: string;
}

/**
 * DocumentGenerator - Gera documentos estruturados
 */
export class DocumentGenerator {
  private logger: Logger;

  constructor(logger?: Logger) {
    this.logger = logger || Logger.create('DocumentGenerator');
  }

  /**
   * Gera documento a partir do blueprint
   */
  async generateDocument(
    blueprint: Blueprint,
    format: 'pdf' | 'markdown' = 'pdf'
  ): Promise<Document> {
    this.logger.info(`📄 Gerando documento: ${blueprint.title}`);

    const markdown = await this.renderMarkdown(blueprint);
    const wordCount = markdown.split(/\s+/).length;

    let content = markdown;
    let downloadUrl: string | undefined;

    if (format === 'pdf') {
      // ✅ CHAMADA CORRETA - Via API de conversão
      downloadUrl = await this.uploadAndConvert(markdown, blueprint.title);
    } else {
      downloadUrl = await this.uploadMarkdown(markdown, blueprint.title);
    }

    this.logger.info(`✅ Documento gerado: ${wordCount} palavras`);

    return {
      id: `doc-${Date.now()}`,
      format,
      title: blueprint.title,
      content,
      metadata: {
        author: 'ORUS SAGE Deep Research',
        createdAt: new Date(),
        wordCount,
        pageCount: Math.ceil(wordCount / 250)
      },
      downloadUrl
    };
  }

  /**
   * Renderiza blueprint como markdown
   */
  private async renderMarkdown(blueprint: Blueprint): Promise<string> {
    let md = '';

    // Hash Master
    md += `# Hash Master\n\`\`\`\n${blueprint.metadata.hashMaster}\n\`\`\`\n\n`;

    // Título
    md += `# ${blueprint.title}\n\n`;
    md += `**${blueprint.subtitle}**\n\n`;

    // Índice
    md += `## ÍNDICE - ${blueprint.metadata.totalBlocks} BLOCOS\n\n`;
    for (const section of blueprint.sections) {
      md += `### SEÇÃO ${section.id}: ${section.name}\n`;
      for (const block of section.blocks) {
        md += `${block.order}. ${block.name}\n`;
      }
      md += '\n';
    }

    md += '\n---\n\n';

    // Conteúdo
    for (const section of blueprint.sections) {
      md += `## SEÇÃO ${section.id}: ${section.name}\n\n`;
      md += `${section.description}\n\n`;

      for (const block of section.blocks) {
        md += `### BLOCO ${block.id} - ${block.name}\n\n`;
        md += `*${block.description}*\n\n`;

        for (const contentSection of block.contentSections) {
          md += `#### ${contentSection.heading}\n\n`;
          md += `${contentSection.content}\n\n`;
        }
      }

      md += '\n---\n\n';
    }

    // Metadata
    md += `# METADATA\n`;
    md += `- **Complexidade**: ${blueprint.metadata.complexity}\n`;
    md += `- **Engines**: ${blueprint.metadata.engines}\n`;
    md += `- **Blocos**: ${blueprint.metadata.totalBlocks}\n`;

    return md;
  }

  /**
   * Upload e conversão para PDF
   */
  private async uploadAndConvert(
    markdown: string,
    filename: string
  ): Promise<string> {
    try {
      // ✅ CHAMADA CORRETA - Via API de documentos
      const response = await fetch('/api/documents/convert-and-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: markdown,
          filename: `${filename}.md`,
          format: 'pdf'
        })
      });

      if (!response.ok) {
        throw new Error(`Conversion error: ${response.statusText}`);
      }

      const { downloadUrl } = await response.json();
      return downloadUrl;
    } catch (error) {
      this.logger.error('❌ Document conversion error:', error);
      return '';
    }
  }

  /**
   * Upload markdown
   */
  private async uploadMarkdown(
    content: string,
    filename: string
  ): Promise<string> {
    try {
      // ✅ CHAMADA CORRETA - Via API de documentos
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          filename: `${filename}.md`,
          contentType: 'text/markdown'
        })
      });

      if (!response.ok) {
        throw new Error(`Upload error: ${response.statusText}`);
      }

      const { downloadUrl } = await response.json();
      return downloadUrl;
    } catch (error) {
      this.logger.error('❌ Document upload error:', error);
      return '';
    }
  }
}
