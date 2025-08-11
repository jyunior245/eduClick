import 'express-session';

declare module 'express-session' {
  interface SessionData {
    professorId?: string;
    alunoId?: string;
    usuario?: any;
    // outros campos customizados
  }
} 