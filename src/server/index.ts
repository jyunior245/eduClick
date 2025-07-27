import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import path from 'path';
import cors from 'cors';
import ProfessorRouter from '../presentation/routers/ProfessorRouter';
import ProfessorPublicoRouter from '../presentation/routers/ProfessorPublicoRouter';
import AulaRouter from '../presentation/routers/AulaRouter';
import AuthRouter from '../presentation/routers/AuthRouter';
import { professorRepository, aulaRepository } from '../infrastructure/repositories/singletons';

const MemoryStore = require('express-session').MemoryStore;

const app = express();
const port = 3000;

app.use(express.json()); // Middleware para processar JSON

// Se o frontend está rodando em 1234, mantenha o CORS para 1234, mas garanta que o frontend faça requisições para 3000
app.use(cors({
  origin: 'http://localhost:1234', // frontend
  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  name: 'sid',
  secret: 'educlick-secret',
  resave: false,
  saveUninitialized: true,
  store: new MemoryStore(),
  // Voltar para configuração compatível com localhost
  cookie: { secure: false, sameSite: 'lax' }
}));

// Middleware de log de sessão e cookie
app.use((req, res, next) => {
  console.log('[Sessão] Cookie recebido:', req.headers.cookie, 'Sessão:', req.session);
  next();
});

// Log global para todas as requisições recebidas
app.use((req, res, next) => {
  console.log('[GLOBAL LOG]', req.method, req.originalUrl);
  next();
});

// Remover o middleware de log detalhado que lê manualmente o body da requisição
// Manter apenas express.json() e o log global simples

// Servir arquivos estáticos primeiro
app.use('/static', express.static(path.join(__dirname, '../../static')));

// Rotas da API
app.use('/api/professores', ProfessorRouter);
app.use('/api/professor-publico', ProfessorPublicoRouter);
app.use('/api/aulas', AulaRouter);
app.use('/aulas', AulaRouter);
app.use('/api/auth', AuthRouter);

// Endpoint de manutenção para corrigir professorIds das aulas antigas
app.post('/api/admin/corrigir-professor-ids', async (req, res) => {
  const professores = await professorRepository.listarTodos();
  const linkUnicoParaId: Record<string, string> = {};
  professores.forEach(p => {
    if (p.linkUnico) linkUnicoParaId[p.linkUnico] = p.id;
  });
  const aulasAntes = await aulaRepository.listarTodos();
  aulaRepository.corrigirProfessorIds(linkUnicoParaId);
  const aulasDepois = await aulaRepository.listarTodos();
  const alteradas = aulasDepois.filter((a, i) => a.professorId !== aulasAntes[i]?.professorId);
  res.json({
    totalAulas: aulasDepois.length,
    alteradas: alteradas.length,
    detalhes: alteradas.map(a => ({ id: a.id, professorId: a.professorId }))
  });
});

// Endpoint de diagnóstico para listar todas as aulas
app.get('/api/admin/listar-aulas', async (req, res) => {
  const aulas = await aulaRepository.listarTodos();
  // Log detalhado para depuração
  console.log('--- LISTAGEM DE TODAS AS AULAS ---');
  aulas.forEach(a => {
    console.log({
      id: a.id,
      professorId: a.professorId,
      titulo: a.titulo,
      reservas: a.reservas
    });
  });
  console.log('-----------------------------------');
  res.json(aulas.map(a => ({
    id: a.id,
    professorId: a.professorId,
    titulo: a.titulo,
    reservas: a.reservas
  })));
});

// Rota de teste simples
app.get('/api/test', (req, res) => {
  res.json({ message: 'Servidor funcionando!' });
});

// Rota para página pública do professor
app.get('/professor/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Rota catch-all para o frontend (deve ser a última)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});