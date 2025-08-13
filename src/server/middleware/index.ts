import { Request, Response, NextFunction } from 'express';

// Middleware de tratamento de erros
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Erro interno do servidor.' });
}

// Middleware de autenticação (exemplo)
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // Implemente a lógica de autenticação aqui
  next();
}