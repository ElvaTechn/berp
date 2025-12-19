export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

class Logger {
  private context?: string;
  private userId?: string;

  constructor(context?: string) {
    this.context = context;
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  private formatMessage(level: LogLevel, message: string, metadata?: Record<string, any>): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.context,
      userId: this.userId,
      metadata
    };
  }

  private log(level: LogLevel, message: string, metadata?: Record<string, any>) {
    const logEntry = this.formatMessage(level, message, metadata);
    
    // Em desenvolvimento, usa console para facilitar debugging
    if (process.env.NODE_ENV === 'development') {
      const logMethod = level === LogLevel.ERROR ? 'error' : 
                      level === LogLevel.WARN ? 'warn' : 
                      level === LogLevel.INFO ? 'info' : 'debug';
      
      const contextStr = logEntry.context ? `[${logEntry.context}]` : '';
      const userStr = logEntry.userId ? `[User:${logEntry.userId}]` : '';
      const metaStr = logEntry.metadata ? ` ${JSON.stringify(logEntry.metadata)}` : '';
      
      console[logMethod](`${logEntry.timestamp} ${level} ${contextStr}${userStr} ${logEntry.message}${metaStr}`);
    } else {
      // Em produção, enviar para serviço de logging (ex: Datadog, Sentry, etc.)
      // Por enquanto, apenas evita expor dados sensíveis no console
      this.sendToLogService(logEntry);
    }
  }

  private async sendToLogService(logEntry: LogEntry) {
    // Integrar com serviço de logging externo aqui
    // Por enquanto, guarda logs críticos em arquivo ou buffer
    if (logEntry.level === LogLevel.ERROR) {
      // Aqui você poderia integrar com Sentry, Datadog, etc.
      // Ou salvar em arquivo de logs no servidor
    }
  }

  error(message: string, metadata?: Record<string, any>) {
    this.log(LogLevel.ERROR, message, metadata);
  }

  warn(message: string, metadata?: Record<string, any>) {
    this.log(LogLevel.WARN, message, metadata);
  }

  info(message: string, metadata?: Record<string, any>) {
    this.log(LogLevel.INFO, message, metadata);
  }

  debug(message: string, metadata?: Record<string, any>) {
    this.log(LogLevel.DEBUG, message, metadata);
  }
}

// Logger global para uso geral
export const logger = new Logger();

// Factory para criar loggers com contexto específico
export const createLogger = (context: string) => new Logger(context);