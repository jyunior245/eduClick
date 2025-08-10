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
exports.sincronizarUsuario = exports.loginWithUid = exports.login = void 0;
const dataSource_1 = require("../../infrastructure/database/dataSource");
const Professor_1 = require("../entities/Professor");
const Usuario_1 = require("../entities/Usuario");
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, senha, uid } = req.body;
        if (!email || !senha) {
            return res.status(400).json({ error: 'Email e senha obrigatórios.' });
        }
        const usuarioRepo = dataSource_1.AppDataSource.getRepository(Usuario_1.Usuario);
        const usuario = yield usuarioRepo.findOne({ where: { email, senha } });
        if (!usuario) {
            return res.status(401).json({ error: 'Usuário ou senha inválidos.' });
        }
        let professor = null;
        if (usuario.tipo === 'professor') {
            const professorRepo = dataSource_1.AppDataSource.getRepository(Professor_1.Professor);
            professor = yield professorRepo.findOne({ where: { uid: usuario.uid } });
            if (!professor) {
                professor = yield professorRepo.findOne({ where: { usuario: { id: usuario.id } } });
                if (professor && professor.uid !== usuario.uid) {
                    professor.uid = usuario.uid;
                    yield professorRepo.save(professor);
                }
            }
            if (professor && typeof professor.id === 'number' && professor.id > 0) {
                req.session.professorId = String(professor.id);
                req.session.usuario = usuario;
                yield new Promise((resolve) => req.session.save(() => resolve()));
            }
            else {
                return res.status(404).json({ error: 'Professor não encontrado para este usuário.' });
            }
        }
        else {
            return res.status(404).json({ error: 'Usuário não é um professor.' });
        }
        return res.status(200).json({ message: 'Login realizado com sucesso.', usuario, professor });
    }
    catch (err) {
        console.error('[LOGIN] Erro:', err);
        return res.status(500).json({ error: 'Erro interno no login.' });
    }
});
exports.login = login;
// Novo: login com UID (fluxo Firebase)
const loginWithUid = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { uid } = req.body;
        if (!uid || typeof uid !== 'string') {
            return res.status(400).json({ error: 'UID é obrigatório.' });
        }
        const usuarioRepo = dataSource_1.AppDataSource.getRepository(Usuario_1.Usuario);
        const professorRepo = dataSource_1.AppDataSource.getRepository(Professor_1.Professor);
        // Tenta achar usuário pelo uid
        const usuario = yield usuarioRepo.findOne({ where: { uid } });
        if (!usuario) {
            return res.status(404).json({ error: 'Usuário não encontrado. Sincronize primeiro.' });
        }
        // Tenta achar professor pelo uid ou pelo usuário vinculado
        let professor = yield professorRepo.findOne({ where: { uid } });
        if (!professor) {
            professor = yield professorRepo.findOne({ where: { usuario: { id: usuario.id } } });
            // Atualiza uid no professor se necessário
            if (professor && professor.uid !== usuario.uid) {
                professor.uid = usuario.uid;
                yield professorRepo.save(professor);
            }
        }
        if (!professor) {
            return res.status(404).json({ error: 'Professor não encontrado para este usuário.' });
        }
        // Seta a sessão
        req.session.professorId = String(professor.id);
        req.session.usuario = usuario;
        yield new Promise((resolve) => req.session.save(() => resolve()));
        return res.json({ message: 'Login via Firebase realizado com sucesso.', professor });
    }
    catch (err) {
        console.error('[LOGIN_WITH_UID] Erro:', err);
        return res.status(500).json({ error: 'Erro interno ao criar sessão.' });
    }
});
exports.loginWithUid = loginWithUid;
// Sincronizar usuário (transformei em função async simples)
const sincronizarUsuario = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { uid, email, nome } = req.body;
        if (!uid || !email) {
            return res.status(400).json({ error: 'UID e email são obrigatórios' });
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
            if (!professor.usuario || professor.usuario.id !== usuario.id) {
                professor.usuario = usuario;
                yield professorRepo.save(professor);
            }
            return res.json({ message: 'Professor já existe', professor });
        }
        professor = professorRepo.create({ uid, usuario, nome_personalizado: nome || 'Professor' });
        yield professorRepo.save(professor);
        return res.json({ message: 'Professor sincronizado com sucesso', professor });
    }
    catch (err) {
        console.error('[SINCRONIZAR USUARIO] Erro:', err);
        return res.status(500).json({ error: 'Erro interno ao sincronizar usuário.' });
    }
});
exports.sincronizarUsuario = sincronizarUsuario;
