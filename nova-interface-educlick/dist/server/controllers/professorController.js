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
exports.listarAulasDoProfessor = exports.removerProfessor = exports.atualizarProfessor = exports.buscarProfessor = exports.listarProfessores = exports.criarProfessor = void 0;
const dataSource_1 = require("../../infrastructure/database/dataSource");
const Professor_1 = require("../entities/Professor");
const Usuario_1 = require("../entities/Usuario");
const criarProfessor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid, nome, email } = req.body;
    if (!uid || !email) {
        return res.status(400).json({ error: 'UID e email são obrigatórios.' });
    }
    const usuarioRepo = dataSource_1.AppDataSource.getRepository(Usuario_1.Usuario);
    let usuario = yield usuarioRepo.findOne({ where: { uid } });
    if (!usuario) {
        usuario = usuarioRepo.create({ uid, nome: nome || 'Professor', email, senha: '', tipo: 'professor' });
        yield usuarioRepo.save(usuario);
    }
    const professorRepo = dataSource_1.AppDataSource.getRepository(Professor_1.Professor);
    let professor = yield professorRepo.findOne({ where: { uid } });
    if (professor) {
        // Atualiza vínculo se necessário
        if (!professor.usuario || professor.usuario.id !== usuario.id) {
            professor.usuario = usuario;
            yield professorRepo.save(professor);
        }
        return res.json({ message: 'Professor já existe', professor });
    }
    // Cria novo professor vinculado ao usuário
    professor = professorRepo.create({ uid, usuario, nome_personalizado: nome || 'Professor' });
    yield professorRepo.save(professor);
    res.json({ message: 'Professor criado com sucesso', professor });
});
exports.criarProfessor = criarProfessor;
const listarProfessores = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json([]);
});
exports.listarProfessores = listarProfessores;
const buscarProfessor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({});
});
exports.buscarProfessor = buscarProfessor;
const atualizarProfessor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const professorId = (_a = req.session) === null || _a === void 0 ? void 0 : _a.professorId;
        if (!professorId)
            return res.status(401).json({ error: 'Sessão inválida.' });
        const professorRepo = dataSource_1.AppDataSource.getRepository(Professor_1.Professor);
        const professor = yield professorRepo.findOne({ where: { id: Number(professorId) }, relations: ['usuario'] });
        if (!professor)
            return res.status(404).json({ error: 'Professor não encontrado.' });
        // Atualiza os campos do perfil
        const { nome, email, telefone, especialidade, formacao, experiencia, linkUnico } = req.body;
        if (nome)
            professor.nome = nome;
        if (telefone)
            professor.telefone = telefone;
        if (especialidade)
            professor.especialidade = especialidade;
        if (formacao)
            professor.formacao = formacao;
        if (experiencia)
            professor.experiencia = experiencia;
        if (linkUnico)
            professor.linkUnico = linkUnico;
        // Garante que o linkUnico sempre seja evidenciado
        if (!professor.linkUnico || professor.linkUnico.trim() === '') {
            professor.linkUnico = `prof-${professor.id}`;
        }
        // Atualiza dados do usuário vinculado
        if (email)
            professor.usuario.email = email;
        yield professorRepo.save(professor);
        res.json({ message: 'Perfil atualizado!', professor });
    }
    catch (err) {
        console.error('[ATUALIZAR PERFIL] Erro:', err);
        res.status(500).json({ error: 'Erro ao atualizar perfil.' });
    }
});
exports.atualizarProfessor = atualizarProfessor;
const removerProfessor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({ message: 'Professor removido!' });
});
exports.removerProfessor = removerProfessor;
const listarAulasDoProfessor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json([]);
});
exports.listarAulasDoProfessor = listarAulasDoProfessor;
