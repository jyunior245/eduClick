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
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const express_session_1 = __importDefault(require("express-session"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const professorRoutes_1 = __importDefault(require("./routes/professorRoutes"));
const professorPublicoRoutes_1 = __importDefault(require("./routes/professorPublicoRoutes"));
const aulaRoutes_1 = __importDefault(require("./routes/aulaRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const horarioIndisponivelRoutes_1 = __importDefault(require("./routes/horarioIndisponivelRoutes"));
const Professor_1 = require("./entities/Professor");
const Aula_1 = require("./entities/Aula");
const dataSource_1 = require("../infrastructure/database/dataSource");
const PgSession = require('connect-pg-simple')(express_session_1.default);
// Async handler para resolver problemas de tipo com funções async
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
// Certifique-se que NextFunction está importado
dataSource_1.AppDataSource.initialize().then(() => {
    // Todas as configurações Express e rotas
    const app = (0, express_1.default)();
    const port = 3000;
    app.use(express_1.default.json()); // Middleware para processar JSON
    // Se o frontend está rodando em 1234, mantenha o CORS para 1234, mas garanta que o frontend faça requisições para 3000
    app.use((0, cors_1.default)({
        origin: 'http://localhost:1234', // frontend
        credentials: true
    }));
    app.use(body_parser_1.default.json());
    app.use(body_parser_1.default.urlencoded({ extended: true }));
    app.use((0, express_session_1.default)({
        name: 'sid',
        secret: 'educlick-secret',
        resave: false,
        saveUninitialized: false,
        store: new PgSession({
            conString: 'postgres://postgres:12345@localhost/educlick',
            createTableIfMissing: true
        }),
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
    app.use('/static', express_1.default.static(path_1.default.join(__dirname, '../../static')));
    // Servir o index.html do frontend
    app.use(express_1.default.static(path_1.default.join(__dirname, '../client')));
    // Rotas da API
    app.use('/api/professores', professorRoutes_1.default);
    app.use('/api/professor-publico', professorPublicoRoutes_1.default);
    app.use('/api/aulas', aulaRoutes_1.default);
    app.use('/api/auth', authRoutes_1.default);
    app.use('/api/horario-indisponivel', horarioIndisponivelRoutes_1.default);
    // Endpoint de manutenção para corrigir professorIds das aulas antigas
    app.post('/api/admin/corrigir-professor-ids', asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        // Exemplo de correção usando TypeORM
        const professorRepository = dataSource_1.AppDataSource.getRepository(Professor_1.Professor);
        const aulaRepository = dataSource_1.AppDataSource.getRepository(Aula_1.Aula);
        const professores = yield professorRepository.find();
        const linkUnicoParaId = {};
        professores.forEach((p) => {
            if (p.linkUnico)
                linkUnicoParaId[p.linkUnico] = String(p.id);
        });
        const aulasAntes = yield aulaRepository.find({ relations: ['professor'] });
        // Aqui você pode implementar a lógica de correção de professorId conforme necessário
        // Exemplo: aulaRepository.update(...)
        const aulasDepois = yield aulaRepository.find({ relations: ['professor'] });
        const alteradas = aulasDepois.filter((a, i) => { var _a, _b, _c; return ((_a = a.professor) === null || _a === void 0 ? void 0 : _a.id) !== ((_c = (_b = aulasAntes[i]) === null || _b === void 0 ? void 0 : _b.professor) === null || _c === void 0 ? void 0 : _c.id); });
        res.json({
            totalAulas: aulasDepois.length,
            alteradas: alteradas.length,
            detalhes: alteradas.map((a) => { var _a; return ({ id: a.id, professorId: (_a = a.professor) === null || _a === void 0 ? void 0 : _a.id }); })
        });
    })));
    // Endpoint de diagnóstico para listar todas as aulas
    app.get('/api/admin/listar-aulas', asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const aulaRepository = dataSource_1.AppDataSource.getRepository(Aula_1.Aula);
        const aulas = yield aulaRepository.find({ relations: ['professor'] });
        // Log detalhado para depuração
        console.log('--- LISTAGEM DE TODAS AS AULAS ---');
        aulas.forEach((a) => {
            var _a;
            console.log({
                id: a.id,
                professorId: (_a = a.professor) === null || _a === void 0 ? void 0 : _a.id,
                titulo: a.titulo,
                reservas: a.reservas
            });
        });
        console.log('-----------------------------------');
        res.json(aulas.map((a) => {
            var _a;
            return ({
                id: a.id,
                professorId: (_a = a.professor) === null || _a === void 0 ? void 0 : _a.id,
                titulo: a.titulo,
                reservas: a.reservas
            });
        }));
    })));
    // Endpoint para sincronizar usuário do Firebase com o backend
    app.post('/api/admin/sincronizar-usuario', asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { uid, email, nome } = req.body;
        if (!uid || !email) {
            return res.status(400).json({ error: 'UID e email são obrigatórios' });
        }
        const usuarioRepository = dataSource_1.AppDataSource.getRepository(require('./entities/Usuario').Usuario);
        let usuario = yield usuarioRepository.findOne({ where: { uid } });
        if (!usuario) {
            usuario = usuarioRepository.create({ uid, nome: nome || 'Professor', email, senha: '', tipo: 'professor' });
            yield usuarioRepository.save(usuario);
        }
        const professorRepository = dataSource_1.AppDataSource.getRepository(Professor_1.Professor);
        let professor = yield professorRepository.findOne({ where: { uid } });
        if (professor) {
            // Atualiza vínculo se necessário
            if (!professor.usuario || professor.usuario.id !== usuario.id) {
                const usuarioInstancia = yield usuarioRepository.findOne({ where: { id: usuario.id } });
                if (usuarioInstancia) {
                    professor.usuario = usuarioInstancia;
                    yield professorRepository.save(professor);
                }
            }
            console.log(`Professor ${email} já existe no repositório`);
            return res.json({ message: 'Professor já existe', professor });
        }
        // Cria novo professor vinculado ao usuário
        professor = professorRepository.create({ uid, usuario, nome_personalizado: nome || 'Professor' });
        yield professorRepository.save(professor);
        console.log(`Professor ${email} sincronizado com sucesso`);
        res.json({ message: 'Professor sincronizado com sucesso', professor });
    })));
    // Endpoint para listar todos os professores
    app.get('/api/admin/listar-professores', asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const professorRepository = dataSource_1.AppDataSource.getRepository(Professor_1.Professor);
        const professores = yield professorRepository.find();
        console.log('--- LISTAGEM DE TODOS OS PROFESSORES ---');
        professores.forEach((p) => {
            console.log({
                id: p.id,
                nome: p.nome,
                email: p.email,
                linkUnico: p.linkUnico
            });
        });
        console.log('----------------------------------------');
        res.json(professores.map((p) => ({
            id: p.id,
            nome: p.nome,
            email: p.email,
            linkUnico: p.linkUnico
        })));
    })));
    // Rota de teste simples
    app.get('/api/test', (req, res) => {
        res.json({ message: 'Servidor funcionando!' });
    });
    // Rota para página pública do professor
    app.get('/professor/:id', (req, res) => {
        res.sendFile(path_1.default.join(__dirname, '../../client/index.html'));
    });
    // Rota catch-all para o frontend (deve ser a última)
    app.get('*', (req, res) => {
        res.sendFile(path_1.default.join(__dirname, '../../client/index.html'));
    });
    app.listen(port, () => {
        console.log(`Servidor rodando na porta ${port}`);
    });
}).catch((error) => {
    console.error('Erro ao inicializar o DataSource:', error);
});
// Remova qualquer uso de getRepository fora do bloco de inicialização
