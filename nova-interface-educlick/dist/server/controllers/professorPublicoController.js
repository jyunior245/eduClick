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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfessorPublicoController = void 0;
const singletons_1 = require("../../infrastructure/repositories/singletons");
const TypeORMProfessorRepository_1 = require("../../infrastructure/repositories/TypeORMProfessorRepository");
const dataSource_1 = require("../../infrastructure/database/dataSource");
const ProfessorService_1 = require("../../domain/services/ProfessorService");
const AulaService_1 = require("../../domain/services/AulaService");
// NÃO inicializar o DataSource aqui em chamadas repetidas.
let professorService;
let aulaService;
function ensureDataSourceInitialized(res) {
    if (!dataSource_1.AppDataSource.isInitialized) {
        console.error('[professorPublicoController] AppDataSource NÃO está inicializado.');
        res.status(500).json({ error: 'Banco de dados não inicializado.' });
        return false;
    }
    if (!professorService) {
        const typeormProfessorRepository = new TypeORMProfessorRepository_1.TypeORMProfessorRepository(dataSource_1.AppDataSource);
        professorService = new ProfessorService_1.ProfessorService(typeormProfessorRepository);
    }
    if (!aulaService) {
        aulaService = new AulaService_1.AulaService(singletons_1.aulaRepository);
    }
    return true;
}
class ProfessorPublicoController {
    static perfilPublico(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
            if (!ensureDataSourceInitialized(res))
                return;
            try {
                // ler o parâmetro correto (linkUnico)
                const { linkUnico } = req.params;
                if (!linkUnico)
                    return res.status(400).json({ error: 'Parâmetro linkUnico obrigatório.' });
                // buscar professor por linkUnico (método no service)
                const professor = yield professorService.buscarPorLinkUnico(String(linkUnico).trim());
                if (!professor)
                    return res.status(404).json({ error: 'Professor não encontrado' });
                // Buscar aulas disponíveis do professor (normalizando id)
                const aulas = yield aulaService.listarAulasDisponiveisPorProfessor(String(professor.id));
                return res.json({
                    professor: {
                        id: professor.id,
                        nome: (_b = (_a = professor.nome) !== null && _a !== void 0 ? _a : professor.nomePersonalizado) !== null && _b !== void 0 ? _b : '',
                        especialidade: (_c = professor.especialidade) !== null && _c !== void 0 ? _c : '',
                        bio: (_d = professor.bio) !== null && _d !== void 0 ? _d : '',
                        telefone: (_e = professor.telefone) !== null && _e !== void 0 ? _e : '',
                        formacao: (_f = professor.formacao) !== null && _f !== void 0 ? _f : '',
                        experiencia: (_g = professor.experiencia) !== null && _g !== void 0 ? _g : '',
                        observacoes: (_h = professor.observacoes) !== null && _h !== void 0 ? _h : '',
                        descricao: (_j = professor.descricao) !== null && _j !== void 0 ? _j : '',
                        conteudosDominio: (_k = professor.conteudosDominio) !== null && _k !== void 0 ? _k : [],
                        fotoPerfil: (_l = professor.fotoPerfil) !== null && _l !== void 0 ? _l : '',
                        linkUnico: (_m = professor.linkUnico) !== null && _m !== void 0 ? _m : ''
                    },
                    aulas
                });
            }
            catch (err) {
                console.error('[perfilPublico] Erro:', err);
                return res.status(500).json({ error: 'Erro interno do servidor.' });
            }
        });
    }
    static reservarAula(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (!ensureDataSourceInitialized(res))
                return;
            try {
                const { linkUnico } = req.params;
                const { aulaId, alunoNome, alunoTelefone, alunoEmail } = req.body;
                if (!linkUnico)
                    return res.status(400).json({ error: 'Parâmetro linkUnico obrigatório.' });
                // validações básicas do payload
                if (!aulaId)
                    return res.status(400).json({ error: 'aulaId obrigatório.' });
                if (!alunoNome || typeof alunoNome !== 'string' || alunoNome.trim() === '')
                    return res.status(400).json({ error: 'Nome do aluno obrigatório.' });
                if (!alunoTelefone || typeof alunoTelefone !== 'string' || alunoTelefone.trim() === '')
                    return res.status(400).json({ error: 'Telefone do aluno obrigatório.' });
                if (!alunoEmail || !/^\S+@\S+\.\S+$/.test(alunoEmail))
                    return res.status(400).json({ error: 'E-mail do aluno é obrigatório e deve ser válido.' });
                // Encontrar o professor pelo linkUnico
                const professor = yield professorService.buscarPorLinkUnico(String(linkUnico).trim());
                if (!professor) {
                    return res.status(404).json({ error: 'Professor não encontrado.' });
                }
                // Buscar aula por id (normalizando)
                const aula = yield aulaService.buscarAulaPorId(String(aulaId));
                if (!aula) {
                    return res.status(404).json({ error: 'Aula não encontrada.' });
                }
                // Conferir se a aula pertence ao professor (comparando strings para evitar problema de tipo)
                if (String(aula.professorId).trim() !== String(professor.id).trim()) {
                    return res.status(400).json({ error: 'Aula não pertence a este professor.' });
                }
                // Tentar reservar a aula via serviço
                const reservada = yield aulaService.reservarAula(String(aulaId), alunoNome, alunoTelefone, alunoEmail);
                if (reservada) {
                    return res.json({
                        message: 'Aula reservada com sucesso',
                        aula: {
                            id: aula.id,
                            titulo: aula.titulo,
                            dataHora: aula.dataHora,
                            valor: (_a = aula.valorFormatado) !== null && _a !== void 0 ? _a : aula.valor,
                            duracao: (_b = aula.duracaoFormatada) !== null && _b !== void 0 ? _b : aula.duracao
                        }
                    });
                }
                else {
                    return res.status(400).json({ error: 'Não foi possível reservar a aula' });
                }
            }
            catch (err) {
                console.error('[reservarAula] Erro:', err);
                return res.status(500).json({ error: 'Erro interno do servidor.' });
            }
        });
    }
    static listarAgendamentosAluno(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { linkUnico } = req.params;
                const { nome, telefone, email } = req.query;
                if (!linkUnico)
                    return res.status(400).json({ error: 'Parâmetro linkUnico obrigatório.' });
                if (!nome || !telefone || !email) {
                    return res.status(400).json({ error: 'Parâmetros obrigatórios: nome, telefone e email são necessários' });
                }
                // Buscar professor pelo linkUnico
                const professor = yield professorService.buscarPorLinkUnico(String(linkUnico).trim());
                if (!professor)
                    return res.status(404).json({ error: 'Professor não encontrado' });
                // Buscar aulas do professor via serviço (normaliza id)
                const aulas = yield aulaService.listarAulasPorProfessor(String(professor.id));
                // Filtrar reservas do aluno (normalizando valores)
                const normalizePhone = (t) => String(t || '').replace(/\D/g, '');
                const nomeNorm = String(nome).trim().toLowerCase();
                const telefoneNorm = normalizePhone(String(telefone));
                const emailNorm = String(email).trim().toLowerCase();
                const agendamentos = aulas.flatMap((aula) => {
                    return (aula.reservas || []).filter((reserva) => {
                        const matchTelefone = telefoneNorm ? normalizePhone(reserva.telefone) === telefoneNorm : true;
                        const matchNome = nomeNorm ? String(reserva.nome).trim().toLowerCase() === nomeNorm : true;
                        const matchEmail = emailNorm ? String(reserva.email).trim().toLowerCase() === emailNorm : true;
                        return matchTelefone && matchNome && matchEmail;
                    }).map((reserva) => ({
                        id: aula.id,
                        titulo: aula.titulo,
                        conteudo: aula.conteudo,
                        dataHora: aula.dataHora,
                        status: reserva.status || aula.status,
                        statusAula: aula.status,
                        professorNome: professor.nome,
                        professorEmail: '', // não expor
                        professorTelefone: professor.telefone,
                        nome: reserva.nome,
                        telefone: reserva.telefone,
                        email: reserva.email
                    }));
                });
                return res.json(agendamentos);
            }
            catch (err) {
                console.error('[listarAgendamentosAluno] Erro:', err);
                return res.status(500).json({ error: 'Erro interno do servidor.' });
            }
        });
    }
}
exports.ProfessorPublicoController = ProfessorPublicoController;
