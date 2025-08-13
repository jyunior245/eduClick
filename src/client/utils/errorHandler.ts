// Sistema centralizado de tratamento de erros

import { logger } from './logger';
import { mostrarToast } from '../components/Toast';

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public isOperational = true
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ErrorHandler {
  static handle(error: Error | AppError, context?: string): void {
    const errorMessage = context ? `${context}: ${error.message}` : error.message;
    
    if (error instanceof AppError && error.isOperational) {
      logger.warn(errorMessage);
      mostrarToast(error.message, 'danger');
    } else {
      logger.error(errorMessage, error);
      mostrarToast('Ocorreu um erro inesperado. Tente novamente.', 'danger');
    }
  }

  static async handleAsync<T>(
    promise: Promise<T>,
    context?: string,
    fallback?: T
  ): Promise<T | undefined> {
    try {
      return await promise;
    } catch (error) {
      this.handle(error as Error, context);
      return fallback;
    }
  }

  static createOperationalError(message: string, code: string): AppError {
    return new AppError(message, code);
  }

  static createSystemError(message: string, code: string): AppError {
    return new AppError(message, code, undefined, false);
  }
} 