import { Logger } from '../../shared/src/logger/logger';

// ✅ IMPORTS CORRETOS - Integração com Trinity (não local)
// As dependências Cerebro e Alma virão via DI (Dependency Injection)

export interface ResearchSource {
  id: string;
  title: string;
  url: string;
  content: string;
  source: 'web' | 'database' | 'document' | 'paper';
  credibility: number; // 0-1
  recency: number; // 0-1
  relevance: number; // 0-1
  extractedAt: Date;
}

export interface RankedSource extends ResearchSource {
  score: number;
  rank: number;
}

export interface ResearchQuery {
  query: string;
  domains?: string[];
  maxSources?: number;
  minCredibility?: number;
  timeframe?: 'week' | 'month' | 'year' | 'all';
}

export interface ResearchResult {
  query: string;
  sources: RankedSource[];
  totalSources: number;
  topSources: RankedSource[];
  searchTime: number;
  metadata: {
    sources_breakdown: Record<string, number>;
    avg_credibility: number;
    avg_recency: number;
  };
}

/**
 * DeepResearchEngine - Motor de pesquisa multi-fonte
 * Integra com Trinity Alma/Cerebro via interfaces (não imports diretos)
 */
export class DeepResearchEngine {
  private sourceCache: Map<string, ResearchSource[]> = new Map();
  private logger: Logger;
  
  private rankingWeights = {
    credibility: 0.4,
    recency: 0.3,
    relevance: 0.3
  };

  /**
   * Constructor com DI
   * Obs: Cerebro/Alma são injetados via API/Service, não diretos
   */
  constructor(logger?: Logger) {
   this.logger = logger || Logger.create('DeepResearchEngine');
  }

  /**
   * Pesquisa multi-fonte: web + databases + documentos
   */
  async searchMultiSource(params: ResearchQuery): Promise<ResearchResult> {
    const startTime = Date.now();
    const maxSources = params.maxSources || 50;

    this.logger.info(`🔍 Iniciando pesquisa: "${params.query}"`);

    // Verifica cache
    const cacheKey = `${params.query}:${params.domains?.join(',')}`;
    if (this.sourceCache.has(cacheKey)) {
      this.logger.debug(`✅ Resultado encontrado em cache`);
      const cached = this.sourceCache.get(cacheKey)!;
      return this.rankAndReturnSources(params.query, cached, startTime);
    }

    // Pesquisa paralela em 3 fontes
    const [webSources, dbSources, docSources] = await Promise.all([
      this.searchWeb(params.query, maxSources / 3),
      this.searchDatabase(params.query, maxSources / 3),
      this.searchDocuments(params.query, maxSources / 3)
    ]);

    const allSources = [...webSources, ...dbSources, ...docSources];
    const filtered = allSources.filter(
      s => s.credibility >= (params.minCredibility || 0.3)
    );

    this.sourceCache.set(cacheKey, filtered);
    this.logger.info(`📊 ${filtered.length} fontes encontradas`);

    return this.rankAndReturnSources(params.query, filtered, startTime);
  }

  /**
   * Pesquisa em web (Perplexity API / Google Custom Search)
   */
  private async searchWeb(query: string, limit: number): Promise<ResearchSource[]> {
    try {
      this.logger.debug(`🌐 Pesquisando web para: "${query}"`);

      const perplexityKey = process.env.PERPLEXITY_API_KEY;
      if (!perplexityKey) {
        this.logger.warn('⚠️ Perplexity API key não configurada');
        return this.searchWebFallback(query, limit);
      }

      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${perplexityKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'pplx-70b-online',
          messages: [{ role: 'user', content: query }],
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error(`Perplexity error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.citations?.map((citation: any, idx: number) => ({
        id: `web-${idx}`,
        title: citation.title || query,
        url: citation.url,
        content: citation.snippet || '',
        source: 'web' as const,
        credibility: 0.8,
        recency: this.calculateRecency(citation.date),
        relevance: 0.9,
        extractedAt: new Date()
      })) || [];
    } catch (error) {
      this.logger.error(`❌ Web search error:`, error);
      return this.searchWebFallback(query, limit);
    }
  }

  /**
   * Fallback para web search
   */
  private async searchWebFallback(query: string, limit: number): Promise<ResearchSource[]> {
    this.logger.debug(`📄 Usando fallback para web search`);
    
    // Mock data para testes
    const mockResults: Record<string, ResearchSource[]> = {
      'metaverse': [
        {
          id: 'web-mock-1',
          title: 'Metaverse Market Growth 2025',
          url: 'https://example.com/metaverse-market',
          content: 'Global metaverse market projected to reach $450 billion by 2030',
          source: 'web',
          credibility: 0.8,
          recency: 1.0,
          relevance: 0.95,
          extractedAt: new Date()
        }
      ]
    };

    const normalized = query.toLowerCase().split(' ')[0];
    return mockResults[normalized]?.slice(0, limit) || [];
  }

  /**
   * Pesquisa em base de dados interna
   */
  private async searchDatabase(query: string, limit: number): Promise<ResearchSource[]> {
    try {
      this.logger.debug(`🗄️ Pesquisando em database: "${query}"`);

      // ✅ CHAMADA CORRETA - Via API da workspace-service
      const response = await fetch('/api/research/db-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, limit })
      });

      if (!response.ok) {
        throw new Error(`DB search error: ${response.statusText}`);
      }

      const results = await response.json();

      return results.map((row: any, idx: number) => ({
        id: `db-${idx}`,
        title: row.title,
        url: row.url || '',
        content: row.content,
        source: 'database' as const,
        credibility: 0.85,
        recency: this.calculateRecency(row.created_at),
        relevance: row.relevance_score || 0.7,
        extractedAt: new Date()
      }));
    } catch (error) {
      this.logger.error(`❌ Database search error:`, error);
      return [];
    }
  }

  /**
   * Pesquisa em documentos do workspace
   */
  private async searchDocuments(query: string, limit: number): Promise<ResearchSource[]> {
    try {
      this.logger.debug(`📄 Pesquisando documentos: "${query}"`);

      // ✅ CHAMADA CORRETA - Via API da workspace-service
      const response = await fetch('/api/research/doc-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, limit })
      });

      if (!response.ok) {
        throw new Error(`Doc search error: ${response.statusText}`);
      }

      const results = await response.json();

      return results.map((doc: any, idx: number) => ({
        id: `doc-${idx}`,
        title: doc.title,
        url: doc.path,
        content: doc.excerpt,
        source: 'document' as const,
        credibility: 0.75,
        recency: this.calculateRecency(doc.uploadedAt),
        relevance: doc.relevance_score || 0.6,
        extractedAt: new Date()
      }));
    } catch (error) {
      this.logger.error(`❌ Document search error:`, error);
      return [];
    }
  }

  /**
   * Ordena fontes por score
   */
  async rankSources(sources: ResearchSource[]): Promise<RankedSource[]> {
    const ranked = sources.map(source => ({
      ...source,
      score: this.calculateScore(source),
      rank: 0
    }));

    ranked.sort((a, b) => b.score - a.score);
    ranked.forEach((source, idx) => {
      source.rank = idx + 1;
    });

    return ranked;
  }

  /**
   * Calcula score combinado
   */
  private calculateScore(source: ResearchSource): number {
    return (
      source.credibility * this.rankingWeights.credibility +
      source.recency * this.rankingWeights.recency +
      source.relevance * this.rankingWeights.relevance
    );
  }

  /**
   * Calcula recency score baseado em data
   */
  private calculateRecency(dateStr?: string): number {
    if (!dateStr) return 0.5;
    
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);

      if (diffDays < 7) return 1.0;
      if (diffDays < 30) return 0.8;
      if (diffDays < 365) return 0.5;
      return 0.2;
    } catch {
      return 0.5;
    }
  }

  /**
   * Retorna resultado com ranking
   */
  private async rankAndReturnSources(
    query: string,
    sources: ResearchSource[],
    startTime: number
  ): Promise<ResearchResult> {
    const ranked = await this.rankSources(sources);
    const topSources = ranked.slice(0, 10);

    return {
      query,
      sources: ranked,
      totalSources: ranked.length,
      topSources,
      searchTime: Date.now() - startTime,
      metadata: {
        sources_breakdown: {
          web: sources.filter(s => s.source === 'web').length,
          database: sources.filter(s => s.source === 'database').length,
          documents: sources.filter(s => s.source === 'document').length,
          papers: sources.filter(s => s.source === 'paper').length
        },
        avg_credibility: ranked.length > 0 
          ? ranked.reduce((a, s) => a + s.credibility, 0) / ranked.length 
          : 0,
        avg_recency: ranked.length > 0
          ? ranked.reduce((a, s) => a + s.recency, 0) / ranked.length
          : 0
      }
    };
  }

  /**
   * Limpa cache se muito grande
   */
  clearCache(): void {
    if (this.sourceCache.size > 100) {
      const entries = Array.from(this.sourceCache.entries());
      entries.slice(0, 50).forEach(([key]) => {
        this.sourceCache.delete(key);
      });
      this.logger.debug(`🧹 Cache limpo`);
    }
  }
}