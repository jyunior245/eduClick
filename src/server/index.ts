import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import path from 'path';
import cors from 'cors';
import ProfessorRouter from '../presentation/routers/ProfessorRouter';
import ProfessorPublicoRouter from '../presentation/routers/ProfessorPublicoRouter';
import AulaRouter from '../presentation/routers/AulaRouter';
import AuthRouter from '../presentation/routers/AuthRouter';

const MemoryStore = require('express-session').MemoryStore;

const app = express();
const port = 3000;

app.use(cors({
  origin: 'http://localhost:1234',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  name: 'sid',
  secret: 'educlick-secret',
  resave: false,
  saveUninitialized: true,
  store: new MemoryStore(),
  cookie: { secure: false, sameSite: 'lax' }
}));

// Servir arquivos estáticos primeiro
app.use('/static', express.static(path.join(__dirname, '../../static')));

// Rotas da API
app.use('/api/professores', ProfessorRouter);
app.use('/api/professor-publico', ProfessorPublicoRouter);
app.use('/api/aulas', AulaRouter);
app.use('/api/auth', AuthRouter);

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