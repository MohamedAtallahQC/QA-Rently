/**
 * Logger utility for test automation with different log levels and formatting
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  source?: string;
}

export class Logger {
  private static instance: Logger;
  private currentLevel: LogLevel;
  private logs: LogEntry[] = [];
  private readonly maxLogs = 1000;

  private constructor() {
    this.currentLevel = process.env['DEBUG'] === 'true' ? LogLevel.DEBUG : LogLevel.INFO;
  }

  /**
   * Get singleton instance of Logger
   */
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Set the current log level
   */
  public setLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  /**
   * Get the current log level
   */
  public getLevel(): LogLevel {
    return this.currentLevel;
  }

  /**
   * Log an error message
   */
  public error(message: string, context?: Record<string, any>, source?: string): void {
    this.log(LogLevel.ERROR, message, context, source);
  }

  /**
   * Log a warning message
   */
  public warn(message: string, context?: Record<string, any>, source?: string): void {
    this.log(LogLevel.WARN, message, context, source);
  }

  /**
   * Log an info message
   */
  public info(message: string, context?: Record<string, any>, source?: string): void {
    this.log(LogLevel.INFO, message, context, source);
  }

  /**
   * Log a debug message
   */
  public debug(message: string, context?: Record<string, any>, source?: string): void {
    this.log(LogLevel.DEBUG, message, context, source);
  }

  /**
   * Log a trace message
   */
  public trace(message: string, context?: Record<string, any>, source?: string): void {
    this.log(LogLevel.TRACE, message, context, source);
  }

  /**
   * Log a message with specified level
   */
  private log(level: LogLevel, message: string, context?: Record<string, any>, source?: string): void {
    if (level <= this.currentLevel) {
      const logEntry: LogEntry = {
        timestamp: new Date(),
        level,
        message,
        context,
        source
      };

      this.logs.push(logEntry);
      this.trimLogs();
      this.outputLog(logEntry);
    }
  }

  /**
   * Output log entry to console
   */
  private outputLog(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString();
    const levelName = LogLevel[entry.level].padEnd(5);
    const source = entry.source ? `[${entry.source}]` : '';
    const context = entry.context ? `\n${JSON.stringify(entry.context, null, 2)}` : '';

    const logMessage = `${timestamp} ${levelName} ${source} ${entry.message}${context}`;

    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(logMessage);
        break;
      case LogLevel.WARN:
        console.warn(logMessage);
        break;
      case LogLevel.INFO:
        console.info(logMessage);
        break;
      case LogLevel.DEBUG:
      case LogLevel.TRACE:
        console.log(logMessage);
        break;
    }
  }

  /**
   * Get all log entries
   */
  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Get log entries by level
   */
  public getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  /**
   * Clear all logs
   */
  public clearLogs(): void {
    this.logs = [];
  }

  /**
   * Trim logs to maximum count
   */
  private trimLogs(): void {
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  /**
   * Create a child logger with a specific source
   */
  public createChild(source: string): ChildLogger {
    return new ChildLogger(this, source);
  }
}

/**
 * Child logger that automatically includes source information
 */
export class ChildLogger {
  constructor(private parent: Logger, private source: string) {}

  public error(message: string, context?: Record<string, any>): void {
    this.parent.error(message, context, this.source);
  }

  public warn(message: string, context?: Record<string, any>): void {
    this.parent.warn(message, context, this.source);
  }

  public info(message: string, context?: Record<string, any>): void {
    this.parent.info(message, context, this.source);
  }

  public debug(message: string, context?: Record<string, any>): void {
    this.parent.debug(message, context, this.source);
  }

  public trace(message: string, context?: Record<string, any>): void {
    this.parent.trace(message, context, this.source);
  }
}

// Export default instance
export const logger = Logger.getInstance();