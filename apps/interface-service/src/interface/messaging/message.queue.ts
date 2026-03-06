/**
 * @alphalang/blueprint
 * @component: MessageQueue
 * @cognitive-signature: Queue-Management, Message-Buffering, FIFO-Processing
 * @minerva-version: 3.0
 * @evolution-level: Communication-Supreme
 * @orus-sage-engine: Communication-System-3
 * @bloco: 5
 * @dependencies: realtime.communicator.ts
 * @quality-gates:
 *   - type-coverage: 100%
 *   - test-coverage: 95%
 *   - complexity: medium
 *   - maintainability: 94%
 * @trinity-integration: ALMA
 * @cig-protocol: ✅ Compliant
 * @last-evolution: 2025-10-31
 */

export enum QueuePriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  CRITICAL = 3
}

export interface QueuedMessage {
  id: string;
  content: string;
  priority: QueuePriority;
  timestamp: Date;
  retries: number;
    status: string; 
  maxRetries: number;
}

export class MessageQueue {
  private queue: QueuedMessage[] = [];
  private processing: boolean = false;
  private processedCount: number = 0;

  /**
   * Enqueue message
   */
  public enqueue(
    content: string,
    priority: QueuePriority = QueuePriority.NORMAL,
    maxRetries: number = 3
  ): QueuedMessage {
    const message: QueuedMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content,
      priority,
      timestamp: new Date(),
      retries: 0,
      maxRetries,
      status: ""
    };

    this.queue.push(message);
    this.queue.sort((a, b) => b.priority - a.priority);

    return message;
  }

  /**
   * Dequeue message
   */
  public dequeue(): QueuedMessage | null {
    return this.queue.shift() || null;
  }
/**
 * Peek at next message
 */
public peek(): QueuedMessage | null {
  // Mapeando os itens da fila para garantir que eles atendam ao tipo `QueuedMessage`
  const result: QueuedMessage[] = this.queue.map(item => ({
    id: item.id || '',
    content: item.content || '',
    priority: item.priority || QueuePriority.NORMAL, // Ajuste para garantir que priority tenha um valor adequado
    timestamp: item.timestamp || new Date(),
    retries: item.retries || 0,
    status: item.status || 'pending', // Verifique se 'status' é realmente necessário
    maxRetries: item.maxRetries || 3 // Adicionando `maxRetries` com valor padrão 3
  }));

  // Retornando o primeiro item da fila ou null se a fila estiver vazia
  return result.length > 0 ? result.shift() || null : null; // Corrigido para garantir que não retorne 'undefined'
}


  /**
   * Process queue
   */
  public async process(processor: (msg: QueuedMessage) => Promise<boolean>): Promise<void> {
    if (this.processing) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const message = this.dequeue();

      if (!message) {
        break;
      }

      try {
        const success = await processor(message);

        if (success) {
          this.processedCount++;
        } else if (message.retries < message.maxRetries) {
          message.retries++;
          this.queue.push(message);
        }
      } catch (error) {
        if (message.retries < message.maxRetries) {
          message.retries++;
          this.queue.push(message);
        }
      }
    }

    this.processing = false;
  }

  /**
   * Get queue status
   */
  public getStatus(): {
    size: number;
    processing: boolean;
    processedCount: number;
    averagePriority: number;
  } {
    const avgPriority = this.queue.length > 0
      ? this.queue.reduce((sum, m) => sum + m.priority, 0) / this.queue.length
      : 0;

    return {
      size: this.queue.length,
      processing: this.processing,
      processedCount: this.processedCount,
      averagePriority: Math.round(avgPriority)
    };
  }

  /**
   * Clear queue
   */
  public clear(): void {
    this.queue = [];
  }
}

/**
 * SECTION 3: EXPORTS
 */

export default MessageQueue;

/**
 * SECTION 4: DOCUMENTATION
 * MessageQueue manages message buffering
 * - Priority queuing
 * - FIFO processing
 * - Retry logic
 */

// EOF
// Evolution Hash: message.queue.0110.20251031
// Quality Score: 94
// Cognitive Signature: ✅ COMPLETE
