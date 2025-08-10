"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const ProfessorRouter_1 = __importDefault(require("../../presentation/routers/ProfessorRouter"));
const AulaRouter_1 = __importDefault(require("../../presentation/routers/AulaRouter"));
const ProfessorPublicoRouter_1 = __importDefault(require("../../presentation/routers/ProfessorPublicoRouter"));
const body_parser_1 = __importDefault(require("body-parser"));
// Importar os singletons reais
const singletons_1 = require("../../infrastructure/repositories/singletons");
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
app.use((0, express_session_1.default)({ secret: 'test', resave: false, saveUninitialized: true }));
app.use('/api/professores', ProfessorRouter_1.default);
app.use('/api/aulas', AulaRouter_1.default);
app.use('/api/professor-publico', ProfessorPublicoRouter_1.default);
let professorId;
let linkUnico;
let aulaId;
const agent = supertest_1.default.agent(app);
describe('Fluxo Público de Reserva de Aula', () => {
    beforeAll(() => {
        // Limpar os repositórios apenas uma vez antes de toda a suíte
        singletons_1.professorRepository.limpar();
        singletons_1.aulaRepository.limpar();
    });
    it('Deve cadastrar um professor', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield agent
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
    }));
    it('Deve buscar o professor cadastrado', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield agent
            .get(`/api/professores/${linkUnico}`);
        expect(res.status).toBe(200);
        expect(res.body.nome).toBe('Prof. Teste');
        professorId = res.body.id;
    }));
    it('Deve cadastrar uma aula para o professor', () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        // Login para obter sessão
        yield agent
            .post('/api/professores/login')
            .send({ email: 'prof.teste@teste.com', senha: '123456' });
        // Criar aula
        const res = yield agent
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
        expect(res.body.id || ((_a = res.body.aula) === null || _a === void 0 ? void 0 : _a.id)).toBeDefined();
        aulaId = res.body.id || ((_b = res.body.aula) === null || _b === void 0 ? void 0 : _b.id);
    }));
    it('Deve listar a aula na página pública', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield agent
            .get(`/api/professores/${linkUnico}/aulas`);
        console.log('Resposta listagem pública:', res.body);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0].id).toBe(aulaId);
    }));
    it('Deve reservar a aula como aluno público', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield agent
            .post(`/api/professores/${linkUnico}/reservar`)
            .send({ aulaId, alunoNome: 'Aluno Público', alunoTelefone: '99999999' });
        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/sucesso/i);
    }));
    it('Deve refletir a reserva na listagem de aulas', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield agent
            .get(`/api/professores/${linkUnico}/aulas`);
        expect(res.status).toBe(200);
        expect(res.body[0].reservas.length).toBe(1);
        expect(res.body[0].reservas[0].nome).toBe('Aluno Público');
    }));
});
