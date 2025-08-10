import request from 'supertest';
import express from 'express';
import session from 'express-session';
import ProfessorRouter from '../../presentation/routers/ProfessorRouter';
import AulaRouter from '../../presentation/routers/AulaRouter';
import ProfessorPublicoRouter from '../../presentation/routers/ProfessorPublicoRouter';
import bodyParser from 'body-parser';
// Importar os singletons reais
import { professorRepository, aulaRepository } from '../../infrastructure/repositories/singletons';

const app = express();
app.use(bodyParser.json());
app.use(session({ secret: 'test', resave: false, saveUninitialized: true }));
app.use('/api/professores', ProfessorRouter);
app.use('/api/aulas', AulaRouter);
app.use('/api/professor-publico', ProfessorPublicoRouter);

let professorId: string;
let linkUnico: string;
let aulaId: string;

const agent = request.agent(app);

describe('Fluxo Público de Reserva de Aula', () => {
  beforeAll(() => {
    // Limpar os repositórios apenas uma vez antes de toda a suíte
    professorRepository.limpar();
    aulaRepository.limpar();
  });

  it('Deve cadastrar um professor', async () => {
    const res = await agent
      .post('/api/professores/cadastro')
      .send({
        nome: 'Prof. Teste',
        email: 'prof.teste@teste.com',
        senha: '123456',
        descricao: 'Teste de fluxo público',
        conteudosDominio: ['Matemática']
      });
    expect(res.status).toBe(201);
    expect(res.body.linkUnico).toBeDefined();
    linkUnico = res.body.linkUnico;
  });

  it('Deve buscar o professor cadastrado', async () => {
    const res = await agent
      .get(`/api/professores/${linkUnico}`);
    expect(res.status).toBe(200);
    expect(res.body.nome).toBe('Prof. Teste');
    professorId = res.body.id;
  });

  it('Deve cadastrar uma aula para o professor', async () => {
    // Login para obter sessão
    await agent
      .post('/api/professores/login')
      .send({ email: 'prof.teste@teste.com', senha: '123456' });
    // Criar aula
    const res = await agent
      .post('/api/aulas/criar')
      .send({
        professorId,
        titulo: 'Aula Pública',
        conteudo: 'Conteúdo de Teste',
        valor: 50,
        duracao: 60,
        dataHora: new Date(Date.now() + 3600000).toISOString(),
        maxAlunos: 2
      });
    console.log('Resposta criação de aula:', res.body);
    expect([200, 201]).toContain(res.status);
    expect(res.body.id || res.body.aula?.id).toBeDefined();
    aulaId = res.body.id || res.body.aula?.id;
  });

  it('Deve listar a aula na página pública', async () => {
    const res = await agent
      .get(`/api/professores/${linkUnico}/aulas`);
    console.log('Resposta listagem pública:', res.body);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].id).toBe(aulaId);
  });

  it('Deve reservar a aula como aluno público', async () => {
    const res = await agent
      .post(`/api/professores/${linkUnico}/reservar`)
      .send({ aulaId, alunoNome: 'Aluno Público', alunoTelefone: '99999999' });
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/sucesso/i);
  });

  it('Deve refletir a reserva na listagem de aulas', async () => {
    const res = await agent
      .get(`/api/professores/${linkUnico}/aulas`);
    expect(res.status).toBe(200);
    expect(res.body[0].reservas.length).toBe(1);
    expect(res.body[0].reservas[0].nome).toBe('Aluno Público');
  });
}); 