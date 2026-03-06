import { Logger } from '../../shared/src/logger/logger';

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  date: string;
}

export interface WebContent {
  title: string;
  content: string;
  metadata: Record<string, any>;
}

/**
 * WebSearchAdapter - Integração com APIs externas
 */
export class WebSearchAdapter {
  private perplexityApiKey: string;
  private googleApiKey: string;
  private googleSearchEngineId: string;
  private logger: Logger;

  constructor(logger?: Logger) {
    this.perplexityApiKey = process.env.PERPLEXITY_API_KEY || '';
    this.googleApiKey = process.env.GOOGLE_API_KEY || '';
    this.googleSearchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID || '';
  this.logger = logger || Logger.create('WebSearchAdapter');
  }

  /**
   * Busca usando Perplexity API
   */
  async searchPerplexity(query: string, limit: number = 10): Promise<SearchResult[]> {
    if (!this.perplexityApiKey) {
      this.logger.warn('⚠️ Perplexity API key não configurada');
      return this.searchFallback(query, limit);
    }

    try {
      this.logger.debug(`🔍 Perplexity search: ${query}`);

      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.perplexityApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'pplx-70b-online',
          messages: [{ role: 'user', content: query }],
          max_tokens: 2000,
          return_citations: true
        })
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parsePerplexityResponse(data, limit);
    } catch (error) {
      this.logger.error('❌ Perplexity search error:', error);
      return this.searchGoogle(query, limit);
    }
  }

  /**
   * Busca usando Google Custom Search
   */
  async searchGoogle(query: string, limit: number = 10): Promise<SearchResult[]> {
    if (!this.googleApiKey || !this.googleSearchEngineId) {
      this.logger.warn('⚠️ Google Search API não configurada');
      return this.searchFallback(query, limit);
    }

    try {
      this.logger.debug(`🔍 Google search: ${query}`);

      const response = await fetch(
        `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${this.googleApiKey}&cx=${this.googleSearchEngineId}&num=${limit}`
      );

      if (!response.ok) {
        throw new Error(`Google API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseGoogleResponse(data);
    } catch (error) {
      this.logger.error('❌ Google search error:', error);
      return this.searchFallback(query, limit);
    }
  }

  /**
   * Fallback search (mock data)
   */
  async searchFallback(query: string, limit: number = 10): Promise<SearchResult[]> {
    this.logger.debug(`📄 Usando fallback search`);

    const mockResults: Record<string, SearchResult[]> = {
      'metaverse': [
        {
          title: 'Metaverse Market 2025',
          url: 'https://example.com/metaverse',
          snippet: 'Mercado de metaverso cresce exponencialmente',
          date: new Date().toISOString()
        }
      ]
    };

    const normalized = query.toLowerCase().split(' ')[0];
    return mockResults[normalized]?.slice(0, limit) || [];
  }

  /**
   * Parse resposta Perplexity
   */
  private parsePerplexityResponse(data: any, limit: number): SearchResult[] {
    try {
      const citations = data.citations || [];
      return citations.slice(0, limit).map((citation: any) => ({
        title: citation.title || 'No title',
        url: citation.url || '',
        snippet: citation.snippet || '',
        date: citation.date || new Date().toISOString()
      }));
    } catch (error) {
      this.logger.error('❌ Parse Perplexity error:', error);
      return [];
    }
  }

  /**
   * Parse resposta Google
   */
  private parseGoogleResponse(data: any): SearchResult[] {
    try {
      return (data.items || []).map((item: any) => ({
        title: item.title,
        url: item.link,
        snippet: item.snippet,
        date: new Date().toISOString()
      }));
    } catch (error) {
      this.logger.error('❌ Parse Google error:', error);
      return [];
    }
  }

  /**
   * Extrai conteúdo de URL
   */
  async extractContent(url: string): Promise<WebContent> {
    try {
      this.logger.debug(`📄 Extraindo conteúdo: ${url}`);

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}`);
      }

      const html = await response.text();
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/);
      const contentMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/);

      return {
        title: titleMatch?.[1] || 'No title',
        content: contentMatch?.[1]?.substring(0, 5000) || '',
        metadata: { url, fetchedAt: new Date().toISOString() }
      };
    } catch (error) {
      this.logger.error(`❌ Content extraction error:`, error);
      return {
        title: 'Error',
        content: '',
        metadata: { error: String(error), url }
      };
    }
  }
}

