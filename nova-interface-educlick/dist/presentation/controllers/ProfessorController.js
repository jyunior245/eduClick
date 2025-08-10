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
exports.ProfessorController = void 0;
const singletons_1 = require("../../infrastructure/repositories/singletons");
const AuthService_1 = require("../../domain/services/AuthService");
const ProfessorService_1 = require("../../domain/services/ProfessorService");
const Professor_1 = require("../../core/entities/Professor");
const authService = new AuthService_1.AuthService(singletons_1.professorRepository, singletons_1.alunoRepository);
const professorService = new ProfessorService_1.ProfessorService(singletons_1.professorRepository);
class ProfessorController {
    static cadastrar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nome, email, senha, descricao, conteudosDominio } = req.body;
                yield authService.registrarProfessor({
                    nome,
                    email,
                    senha,
                    descricao,
                    conteudosDominio,
                });
                res.status(201).json({
                    message: "Professor cadastrado com sucesso"
                });
            }
            catch (err) {
                res.status(400).json({ error: err.message });
            }
        });
    }
    static login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, senha } = req.body;
                const professor = yield authService.login(email, senha);
                // Para compatibilidade com sessões, mas o token Firebase será usado para autenticação
                req.session.professorId = String(professor.id);
                res.json({
                    id: professor.id,
                    nome: professor.nome,
                    email: '',
                    linkUnico: professor.linkUnico
                });
            }
            catch (err) {
                res.status(401).json({ error: err.message });
            }
        });
    }
    static perfil(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            try {
                const professorId = (_a = req.usuario) === null || _a === void 0 ? void 0 : _a.uid;
                if (!professorId)
                    return res.status(401).json({ error: "Não autenticado" });
                let professor = yield professorService.buscarPorId(professorId);
                // Se o professor não existe, criar um novo com os dados do Firebase
                if (!professor) {
                    const firebaseUser = {
                        uid: professorId,
                        displayName: ((_b = req.usuario) === null || _b === void 0 ? void 0 : _b.name) || ((_c = req.usuario) === null || _c === void 0 ? void 0 : _c.displayName) || 'Professor',
                        email: ((_d = req.usuario) === null || _d === void 0 ? void 0 : _d.email) || ''
                    };
                    professor = new Professor_1.Professor();
                    professor.nomePersonalizado = ((_e = req.usuario) === null || _e === void 0 ? void 0 : _e.name) || ((_f = req.usuario) === null || _f === void 0 ? void 0 : _f.displayName) || 'Professor';
                    yield singletons_1.professorRepository.salvar(professor);
                }
                console.log('Professor retornado para o frontend:', {
                    id: professor.id,
                    nome: professor.nome,
                    nomePersonalizado: professor.nomePersonalizado,
                    telefone: professor.telefone,
                    especialidade: professor.especialidade,
                    formacao: professor.formacao,
                    experiencia: professor.experiencia,
                    linkUnico: professor.linkUnico
                });
                res.json(Object.assign(Object.assign({}, professor), { linkPublico: professor.linkUnico ? `/professor/${professor.linkUnico}` : '' }));
            }
            catch (err) {
                res.status(400).json({ error: err.message });
            }
        });
    }
    static atualizarPerfil(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const professorId = (_a = req.usuario) === null || _a === void 0 ? void 0 : _a.uid;
                if (!professorId)
                    return res.status(401).json({ error: "Não autenticado" });
                console.log('Dados recebidos:', req.body);
                const { nome, telefone, formacao, experiencia, especialidade, linkUnico } = req.body;
                // Buscar o professor atual
                const professor = yield professorService.buscarPorId(professorId);
                if (!professor)
                    return res.status(404).json({ error: "Professor não encontrado" });
                // Atualizar apenas os campos permitidos
                const dadosAtualizados = {};
                if (nome !== undefined)
                    dadosAtualizados.nomePersonalizado = nome;
                if (telefone !== undefined)
                    dadosAtualizados.telefone = telefone;
                if (formacao !== undefined)
                    dadosAtualizados.formacao = formacao;
                if (experiencia !== undefined)
                    dadosAtualizados.experiencia = experiencia;
                if (especialidade !== undefined)
                    dadosAtualizados.especialidade = especialidade;
                if (linkUnico !== undefined)
                    dadosAtualizados.linkUnico = linkUnico;
                console.log('Dados a serem atualizados:', dadosAtualizados);
                const professorAtualizado = yield professorService.atualizarPerfil(professorId, dadosAtualizados);
                res.json(Object.assign(Object.assign({}, professorAtualizado), { linkPublico: professorAtualizado.linkUnico ? `/professor/${professorAtualizado.linkUnico}` : '' }));
            }
            catch (err) {
                console.error('Erro ao atualizar perfil:', err);
                res.status(400).json({ error: err.message });
            }
        });
    }
    static gerarLinkUnico(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const professorId = (_a = req.usuario) === null || _a === void 0 ? void 0 : _a.uid;
                if (!professorId)
                    return res.status(401).json({ error: "Não autenticado" });
                const professor = yield professorService.buscarPorId(professorId);
                if (!professor)
                    return res.status(404).json({ error: "Professor não encontrado" });
                // Gera linkUnico manualmente
                professor.linkUnico = `prof-${professor.id}`;
                yield singletons_1.professorRepository.salvar(professor);
                res.json({
                    linkUnico: professor.linkUnico,
                    linkPublico: `/professor/${professor.linkUnico}`
                });
            }
            catch (err) {
                res.status(400).json({ error: err.message });
            }
        });
    }
    static listarAgendamentos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const professorId = (_a = req.usuario) === null || _a === void 0 ? void 0 : _a.uid;
                if (!professorId)
                    return res.status(401).json({ error: "Não autenticado" });
                const aulas = yield singletons_1.aulaRepository.buscarPorProfessor(professorId);
                const agendamentos = aulas.flatMap((aula) => (aula.reservas || []).map((reserva) => ({
                    id: aula.id,
                    nome: reserva.nome,
                    telefone: reserva.telefone,
                    dataHora: aula.dataHora,
                    status: aula.status
                })));
                res.json(agendamentos);
            }
            catch (err) {
                res.status(400).json({ error: err.message });
            }
        });
    }
    static listarAulasPublicas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const professores = yield professorService.listarTodos();
                let professor = professores.find(p => p.linkUnico === id || String(p.id) === id);
                if (!professor) {
                    return res.status(404).json({ error: "Professor não encontrado" });
                }
                const aulas = yield singletons_1.aulaRepository.buscarPorProfessor(String(professor.id));
                const aulasDisponiveis = aulas.filter((a) => a.status === 'disponivel');
                res.json(aulasDisponiveis);
            }
            catch (err) {
                res.status(400).json({ error: err.message });
            }
        });
    }
    static buscarPorIdPublico(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const professores = yield professorService.listarTodos();
                let professor = professores.find(p => p.linkUnico === id || String(p.id) === id);
                if (!professor) {
                    return res.status(404).json({ error: "Professor não encontrado" });
                }
                res.json({
                    id: professor.id,
                    nome: professor.nome,
                    email: '',
                    descricao: professor.descricao,
                    conteudosDominio: professor.conteudosDominio,
                    fotoPerfil: professor.fotoPerfil,
                    linkUnico: professor.linkUnico,
                    formacao: professor.formacao || '',
                    experiencia: professor.experiencia || '',
                    telefone: professor.telefone || ''
                });
            }
            catch (err) {
                res.status(400).json({ error: err.message });
            }
        });
    }
}
exports.ProfessorController = ProfessorController;
