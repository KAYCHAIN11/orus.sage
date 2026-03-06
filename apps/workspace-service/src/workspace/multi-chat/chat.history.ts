/* ============================================================================
 * CHAT HISTORY SERVICE - ORUS SAGE
 * ============================================================================
 * 
 * Gerencia histórico de conversas no workspace.
 * Armazena, recupera e gerencia mensagens de chat.
 * 
 * @module ChatHistory
 * @version 1.0.0
 * ============================================================================
 */

import { Logger } from '../../../../../libs/shared/src/logger/logger';
import type { 
  Chat, 
  Message, 
  MessageFilter,
  PaginationOptions,
  PaginatedResult 
} from './chat.types';

/**
 * ============================================================================
 * INTERFACES
 * ============================================================================
 */

interface HistoryMetrics {
  totalChats: number;
  totalMessages: number;
  averageMessagesPerChat: number;
  oldestMessage: Date | null;
  newestMessage: Date | null;
}

interface SearchOptions {
  query: string;
  chatIds?: string[];
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
}

interface ExportOptions {
  format: 'json' | 'csv' | 'markdown';
  includeMetadata?: boolean;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

/**
 * ============================================================================
 * CHAT HISTORY SERVICE
 * ============================================================================
 */
export class ChatHistoryService {
  private logger: Logger;
  private historyCache: Map<string, Chat[]>;
  private messageCache: Map<string, Message[]>;
  private maxCacheSize: number;
  private cacheTimeout: number;

  constructor() {
    this.logger = Logger.create('ChatHistory');
    this.historyCache = new Map();
    this.messageCache = new Map();
    this.maxCacheSize = 100; // Max chats em cache
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
  }

  /**
   * ============================================================================
   * HISTÓRIA DE CHATS
   * ============================================================================
   */

  /**
   * Obter histórico de chats de um workspace
   */
  async getChatHistory(
    workspaceId: string,
    options?: PaginationOptions
  ): Promise<PaginatedResult<Chat>> {
    try {
      this.logger.info('Getting chat history', { workspaceId });

      // Check cache
      const cacheKey = `${workspaceId}:${JSON.stringify(options)}`;
      const cached = this.historyCache.get(cacheKey);
      if (cached) {
        return {
          data: cached,
          total: cached.length,
          page: options?.page || 1,
          pageSize: options?.pageSize || 20
        };
      }

      // TODO: Buscar do banco
      const chats: Chat[] = [];

      // Cache result
      this.setCacheWithTimeout(this.historyCache, cacheKey, chats);

      return {
        data: chats,
        total: chats.length,
        page: options?.page || 1,
        pageSize: options?.pageSize || 20
      };
    } catch (error) {
      this.logger.error('Error getting chat history', error as Error);
      throw error;
    }
  }

  /**
   * Obter mensagens de um chat específico
   */
  async getChatMessages(
    chatId: string,
    options?: PaginationOptions
  ): Promise<PaginatedResult<Message>> {
    try {
      this.logger.info('Getting chat messages', { chatId });

      // Check cache
      const cacheKey = `messages:${chatId}:${JSON.stringify(options)}`;
      const cached = this.messageCache.get(cacheKey);
      if (cached) {
        return {
          data: cached,
          total: cached.length,
          page: options?.page || 1,
          pageSize: options?.pageSize || 50
        };
      }

      // TODO: Buscar do banco
      const messages: Message[] = [];

      // Cache result
      this.setCacheWithTimeout(this.messageCache, cacheKey, messages);

      return {
        data: messages,
        total: messages.length,
        page: options?.page || 1,
        pageSize: options?.pageSize || 50
      };
    } catch (error) {
      this.logger.error('Error getting chat messages', error as Error);
      throw error;
    }
  }

  /**
   * ============================================================================
   * BUSCA E FILTROS
   * ============================================================================
   */

  /**
   * Buscar mensagens no histórico
   */
  async searchMessages(
    workspaceId: string,
    options: SearchOptions
  ): Promise<Message[]> {
    try {
      this.logger.info('Searching messages', { workspaceId, query: options.query });

      // TODO: Implementar busca full-text
      const results: Message[] = [];

      return results;
    } catch (error) {
      this.logger.error('Error searching messages', error as Error);
      throw error;
    }
  }

  /**
   * Filtrar mensagens
   */
  async filterMessages(
    chatId: string,
    filter: MessageFilter
  ): Promise<Message[]> {
    try {
      this.logger.info('Filtering messages', { chatId, filter });

      const { data: messages } = await this.getChatMessages(chatId);

      let filtered = messages;

      // Filter by sender
      if (filter.senderId) {
        filtered = filtered.filter(m => m.senderId === filter.senderId);
      }

      // Filter by date range
      if (filter.fromDate) {
        filtered = filtered.filter(m => new Date(m.createdAt) >= filter.fromDate!);
      }
      if (filter.toDate) {
        filtered = filtered.filter(m => new Date(m.createdAt) <= filter.toDate!);
      }

      // Filter by content (contains)
      if (filter.contentContains) {
        filtered = filtered.filter(m => 
          m.content.toLowerCase().includes(filter.contentContains!.toLowerCase())
        );
      }

      return filtered;
    } catch (error) {
      this.logger.error('Error filtering messages', error as Error);
      throw error;
    }
  }

  /**
   * ============================================================================
   * MÉTRICAS E ESTATÍSTICAS
   * ============================================================================
   */

  /**
   * Obter métricas do histórico
   */
  async getHistoryMetrics(workspaceId: string): Promise<HistoryMetrics> {
    try {
      this.logger.info('Getting history metrics', { workspaceId });

      const { data: chats } = await this.getChatHistory(workspaceId);
      
      let totalMessages = 0;
      let oldestMessage: Date | null = null;
      let newestMessage: Date | null = null;

      for (const chat of chats) {
        const { data: messages } = await this.getChatMessages(chat.id);
        totalMessages += messages.length;

        for (const msg of messages) {
          const msgDate = new Date(msg.createdAt);
          if (!oldestMessage || msgDate < oldestMessage) {
            oldestMessage = msgDate;
          }
          if (!newestMessage || msgDate > newestMessage) {
            newestMessage = msgDate;
          }
        }
      }

      return {
        totalChats: chats.length,
        totalMessages,
        averageMessagesPerChat: chats.length > 0 ? totalMessages / chats.length : 0,
        oldestMessage,
        newestMessage
      };
    } catch (error) {
      this.logger.error('Error getting history metrics', error as Error);
      throw error;
    }
  }

  /**
   * ============================================================================
   * EXPORTAÇÃO
   * ============================================================================
   */

  /**
   * Exportar histórico
   */
  async exportHistory(
    workspaceId: string,
    options: ExportOptions
  ): Promise<string> {
    try {
      this.logger.info('Exporting history', { workspaceId, format: options.format });

      const { data: chats } = await this.getChatHistory(workspaceId);

      switch (options.format) {
        case 'json':
          return this.exportAsJSON(chats, options);
        case 'csv':
          return this.exportAsCSV(chats, options);
        case 'markdown':
          return this.exportAsMarkdown(chats, options);
        default:
          throw new Error(`Unsupported format: ${options.format}`);
      }
    } catch (error) {
      this.logger.error('Error exporting history', error as Error);
      throw error;
    }
  }

  /**
   * ============================================================================
   * LIMPEZA E MANUTENÇÃO
   * ============================================================================
   */

  /**
   * Deletar mensagens antigas
   */
  async deleteOldMessages(
    workspaceId: string,
    olderThan: Date
  ): Promise<number> {
    try {
      this.logger.info('Deleting old messages', { workspaceId, olderThan });

      // TODO: Implementar delete no banco
      const deletedCount = 0;

      this.logger.info('Deleted old messages', { deletedCount });
      return deletedCount;
    } catch (error) {
      this.logger.error('Error deleting old messages', error as Error);
      throw error;
    }
  }

  /**
   * Limpar cache
   */
  clearCache(workspaceId?: string): void {
    if (workspaceId) {
      // Clear cache específico do workspace
      const keysToDelete: string[] = [];
      this.historyCache.forEach((_, key) => {
        if (key.startsWith(workspaceId)) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach(key => this.historyCache.delete(key));

      this.logger.info('Cleared workspace cache', { workspaceId });
    } else {
      // Clear all cache
      this.historyCache.clear();
      this.messageCache.clear();
      this.logger.info('Cleared all cache');
    }
  }

  /**
   * ============================================================================
   * MÉTODOS PRIVADOS
   * ============================================================================
   */

  /**
   * Set cache com timeout
   */
  private setCacheWithTimeout<T>(
    cache: Map<string, T>,
    key: string,
    value: T
  ): void {
    // Check cache size
    if (cache.size >= this.maxCacheSize) {
      // Remove oldest entry
      const firstKey = cache.keys().next().value;
      if (firstKey) {
        cache.delete(firstKey);
      }
    }

    cache.set(key, value);

    // Set timeout to clear
    setTimeout(() => {
      cache.delete(key);
    }, this.cacheTimeout);
  }

  /**
   * Export as JSON
   */
  private async exportAsJSON(
    chats: Chat[],
    options: ExportOptions
  ): Promise<string> {
    const data = {
      exportedAt: new Date().toISOString(),
      totalChats: chats.length,
      chats: await Promise.all(
        chats.map(async (chat) => {
          const { data: messages } = await this.getChatMessages(chat.id);
          return {
            ...chat,
            messages: options.includeMetadata 
              ? messages 
              : messages.map(m => ({
                  content: m.content,
                  senderId: m.senderId,
                  createdAt: m.createdAt
                }))
          };
        })
      )
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Export as CSV
   */
  private async exportAsCSV(
    chats: Chat[],
    _options: ExportOptions
  ): Promise<string> {
    let csv = 'Chat ID,Message ID,Sender,Content,Created At\n';

    for (const chat of chats) {
      const { data: messages } = await this.getChatMessages(chat.id);
      for (const msg of messages) {
        csv += `${chat.id},${msg.id},${msg.senderId},"${msg.content.replace(/"/g, '""')}",${msg.createdAt}\n`;
      }
    }

    return csv;
  }

  /**
   * Export as Markdown
   */
  private async exportAsMarkdown(
    chats: Chat[],
    _options: ExportOptions
  ): Promise<string> {
    let md = '# Chat History Export\n\n';
    md += `Exported: ${new Date().toISOString()}\n\n`;

    for (const chat of chats) {
      md += `## Chat: ${chat.name || chat.id}\n\n`;
      
      const { data: messages } = await this.getChatMessages(chat.id);
      for (const msg of messages) {
        md += `**${msg.senderId}** (${msg.createdAt}):\n`;
        md += `${msg.content}\n\n`;
      }
    }

    return md;
  }
}

/**
 * ============================================================================
 * DEFAULT EXPORT
 * ============================================================================
 */
export default ChatHistoryService;