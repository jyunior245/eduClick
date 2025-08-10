import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import path from 'path';
import cors from 'cors';
import ProfessorRouter from './routes/professorRoutes';
import { Usuario } from './entities/Usuario';
import ProfessorPublicoRouter from './routes/professorPublicoRoutes';
import AulaRouter from './routes/aulaRoutes';
import AuthRouter from './routes/authRoutes';
import HorarioIndisponivelRouter from './routes/horarioIndisponivelRoutes';
import ReservaRouter from './routes/reservaRoutes';
import { Professor } from './entities/Professor';
import { Request, Response, NextFunction } from 'express';
import { Aula } from './entities/Aula';
import { AppDataSource } from '../infrastructure/database/dataSource';


const PgSession = require('connect-pg-simple')(session);

// Async handler para resolver problemas de tipo com funções async
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => (req: Request, res: Response, next: NextFunction) => Promise.resolve(fn(req, res, next)).catch(next);
// Certifique-se que NextFunction está importado

AppDataSource.initialize().then(() => {
  // Todas as configurações Express e rotas
  const app = express();
  const port = 3000;

  app.use(express.json());
  app.use(cors({
    origin: 'http://localhost:1234',
    credentials: true
  }));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(session({
    name: 'sid',
    secret: 'educlick-secret',
    resave: false,
    saveUninitialized: false,
    store: new PgSession({
      conString: 'postgres://postgres:postgres@localhost/educlick',
      createTableIfMissing: true
    }),
    cookie: { secure: false, sameSite: 'lax' }
  }));

  // Middleware de log de sessão e cookie
  app.use((req, res, next) => {
    console.log('[Sessão] Cookie recebido:', req.headers.cookie, 'Sessão:', (req as any).session);
    next();
  });
  app.use((req, res, next) => {
    console.log('[GLOBAL LOG]', req.method, req.originalUrl);
    next();
  });

  // Servir arquivos estáticos do frontend
  app.use(express.static(path.join(__dirname, '../client')));

  // Fallback para SPA: servir index.html para qualquer rota não-API
  app.get(/^\/(?!api\/).*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
  });

  // Rotas da API
  app.use('/api/professores', ProfessorRouter);
  app.use('/api/professor-publico', ProfessorPublicoRouter);
  app.use('/api/aulas', AulaRouter);
  app.use('/api/auth', AuthRouter);
  app.use('/api/horario-indisponivel', HorarioIndisponivelRouter);
  app.use('/api/reservas', ReservaRouter);

  // Endpoint para exibir aulas disponíveis e agendamentos do aluno já estavam implementados nos routers

  // Rota de fallback para SPA (deve ser a última)
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
  });

  app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
  });
}).catch((error) => {
  console.error('Erro ao inicializar o DataSource:', error);
});
// Remova qualquer uso de getRepository fora do bloco de inicialização