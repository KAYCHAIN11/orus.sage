/**
 * ============================================================================
 * SHARED LOGGER - ORUS SAGE
 * ============================================================================
 * 
 * @location: libs/shared/src/logger/
 * @usage: import { Logger } from '@orus-sage/shared/logger';
 * @version: 1.0.0
 * 
 * Logger universal para todos os microserviços.
 * Suporta níveis: debug, info, warn, error, fatal
 * Output: Console (dev) + File (prod) + External services (optional)
 * 
 * ============================================================================
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: string;
  meta?: Record<string, any>;
  stack?: string;
}

export interface LoggerConfig {
  level: LogLevel;
  context?: string;
  enableColors?: boolean;
  enableTimestamp?: boolean;
  enableContext?: boolean;
  outputs?: LogOutput[];
}

export interface LogOutput {
  name: string;
  write: (entry: LogEntry) => void | Promise<void>;
}

/**
 * ============================================================================
 * LOGGER CLASS
 * ============================================================================
 */
export class Logger {
  private static instances: Map<string, Logger> = new Map();
  private config: LoggerConfig;
  private context: string;

  /**
   * Private constructor - use Logger.create() ou Logger.getInstance()
   */
  private constructor(context: string, config?: Partial<LoggerConfig>) {
    this.context = context;
    this.config = {
      level: LogLevel.INFO,
      context: context,
      enableColors: process.env.NODE_ENV !== 'production',
      enableTimestamp: true,
      enableContext: true,
      outputs: [],
      ...config
    };
  }

  /**
   * Criar logger com contexto
   */
  public static create(context: string, config?: Partial<LoggerConfig>): Logger {
    return new Logger(context, config);
  }

  /**
   * Obter instância singleton por contexto
   */
  public static getInstance(context: string): Logger {
    if (!Logger.instances.has(context)) {
      Logger.instances.set(context, new Logger(context));
    }
    return Logger.instances.get(context)!;
  }

  /**
   * Configurar logger
   */
  public configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Adicionar output customizado
   */
  public addOutput(output: LogOutput): void {
    this.config.outputs?.push(output);
  }

  /**
   * LOG DEBUG
   */
  public debug(message: string, meta?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, meta);
  }

  /**
   * LOG INFO
   */
  public info(message: string, meta?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, meta);
  }

  /**
   * LOG WARN
   */
  public warn(message: string, meta?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, meta);
  }

  /**
   * LOG ERROR
   */
  public error(message: string, error?: Error | any, meta?: Record<string, any>): void {
    const errorMeta = error instanceof Error
      ? { ...meta, error: error.message, stack: error.stack }
      : { ...meta, error };

    this.log(LogLevel.ERROR, message, errorMeta, error?.stack);
  }

  /**
   * LOG FATAL
   */
  public fatal(message: string, error?: Error | any, meta?: Record<string, any>): void {
    const errorMeta = error instanceof Error
      ? { ...meta, error: error.message, stack: error.stack }
      : { ...meta, error };

    this.log(LogLevel.FATAL, message, errorMeta, error?.stack);
  }

  /**
   * Log genérico (método interno)
   */
  private log(
    level: LogLevel,
    message: string,
    meta?: Record<string, any>,
    stack?: string
  ): void {
    // Check level
    if (level < this.config.level) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context: this.context,
      meta,
      stack
    };

    // Console output
    this.writeToConsole(entry);

    // Custom outputs
    if (this.config.outputs && this.config.outputs.length > 0) {
      this.config.outputs.forEach(output => {
        try {
          output.write(entry);
        } catch (err) {
          console.error(`Logger output error (${output.name}):`, err);
        }
      });
    }
  }

  /**
   * Write to console com formatação
   */
  private writeToConsole(entry: LogEntry): void {
    const parts: string[] = [];

    // Timestamp
    if (this.config.enableTimestamp) {
      parts.push(this.formatTimestamp(entry.timestamp));
    }

    // Level
    parts.push(this.formatLevel(entry.level));

    // Context
    if (this.config.enableContext && entry.context) {
      parts.push(this.formatContext(entry.context));
    }

    // Message
    parts.push(entry.message);

    // Meta
    if (entry.meta && Object.keys(entry.meta).length > 0) {
      parts.push(JSON.stringify(entry.meta, null, 2));
    }

    // Output
    const logLine = parts.join(' ');
    
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(logLine);
        break;
      case LogLevel.INFO:
        console.info(logLine);
        break;
      case LogLevel.WARN:
        console.warn(logLine);
        break;
      case LogLevel.ERROR:
        console.error(logLine);
        if (entry.stack) console.error(entry.stack);
        break;
      case LogLevel.FATAL:
        console.error(logLine);
        if (entry.stack) console.error(entry.stack);
        break;
    }
  }

  /**
   * Formatar timestamp
   */
  private formatTimestamp(timestamp: Date): string {
    const color = this.config.enableColors ? '\x1b[90m' : '';
    const reset = this.config.enableColors ? '\x1b[0m' : '';
    return `${color}${timestamp.toISOString()}${reset}`;
  }

  /**
   * Formatar level
   */
  private formatLevel(level: LogLevel): string {
    const levelNames = {
      [LogLevel.DEBUG]: 'DEBUG',
      [LogLevel.INFO]: 'INFO ',
      [LogLevel.WARN]: 'WARN ',
      [LogLevel.ERROR]: 'ERROR',
      [LogLevel.FATAL]: 'FATAL'
    };

    const colors = {
      [LogLevel.DEBUG]: '\x1b[36m', // Cyan
      [LogLevel.INFO]: '\x1b[32m',  // Green
      [LogLevel.WARN]: '\x1b[33m',  // Yellow
      [LogLevel.ERROR]: '\x1b[31m', // Red
      [LogLevel.FATAL]: '\x1b[35m'  // Magenta
    };

    const levelName = levelNames[level];
    
    if (this.config.enableColors) {
      const color = colors[level];
      const reset = '\x1b[0m';
      return `${color}[${levelName}]${reset}`;
    }

    return `[${levelName}]`;
  }

  /**
   * Formatar context
   */
  private formatContext(context: string): string {
    const color = this.config.enableColors ? '\x1b[33m' : '';
    const reset = this.config.enableColors ? '\x1b[0m' : '';
    return `${color}[${context}]${reset}`;
  }

  /**
   * Child logger (herda config mas com contexto diferente)
   */
  public child(context: string): Logger {
    return new Logger(
      `${this.context}:${context}`,
      this.config
    );
  }

  /**
   * Set log level
   */
  public setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  /**
   * Get log level
   */
  public getLevel(): LogLevel {
    return this.config.level;
  }
}

/**
 * ============================================================================
 * HELPER FUNCTIONS
 * ============================================================================
 */

/**
 * Create default logger
 */
export function createLogger(context: string): Logger {
  return Logger.create(context);
}

/**
 * Get logger instance
 */
export function getLogger(context: string): Logger {
  return Logger.getInstance(context);
}

/**
 * ============================================================================
 * CUSTOM OUTPUTS
 * ============================================================================
 */

/**
 * File output (write logs to file)
 */
export class FileLogOutput implements LogOutput {
  name = 'file';
  private filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  write(entry: LogEntry): void {
    const fs = require('fs');
    const line = JSON.stringify(entry) + '\n';
    
    try {
      fs.appendFileSync(this.filePath, line);
    } catch (err) {
      console.error('FileLogOutput error:', err);
    }
  }
}

/**
 * HTTP output (send logs to external service)
 */
export class HttpLogOutput implements LogOutput {
  name = 'http';
  private endpoint: string;
  private headers: Record<string, string>;

  constructor(endpoint: string, headers?: Record<string, string>) {
    this.endpoint = endpoint;
    this.headers = headers || {};
  }

  async write(entry: LogEntry): Promise<void> {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.headers
        },
        body: JSON.stringify(entry)
      });

      if (!response.ok) {
        console.error('HttpLogOutput error:', response.statusText);
      }
    } catch (err) {
      console.error('HttpLogOutput error:', err);
    }
  }
}

/**
 * ============================================================================
 * DEFAULT EXPORT
 * ============================================================================
 */
export default Logger;

/**
 * ============================================================================
 * EXEMPLO DE USO
 * ============================================================================
 * 
 * // Básico
 * const logger = createLogger('MyService');
 * logger.info('Service started');
 * logger.error('Error occurred', new Error('Something went wrong'));
 * 
 * // Com contexto
 * const dbLogger = logger.child('database');
 * dbLogger.info('Connected to database');
 * 
 * // Com outputs customizados
 * const logger = createLogger('MyService');
 * logger.addOutput(new FileLogOutput('./logs/app.log'));
 * logger.addOutput(new HttpLogOutput('https://logs.example.com/api/logs'));
 * 
 * // Configuração avançada
 * const logger = Logger.create('MyService', {
 *   level: LogLevel.DEBUG,
 *   enableColors: true,
 *   enableTimestamp: true,
 *   enableContext: true
 * });
 * 
 * logger.debug('Debug message', { userId: 123 });
 * logger.info('User logged in', { username: 'john' });
 * logger.warn('Rate limit approaching', { current: 95, limit: 100 });
 * logger.error('Database error', new Error('Connection lost'));
 * logger.fatal('Critical system failure', new Error('Out of memory'));
 * 
 * ============================================================================
 */