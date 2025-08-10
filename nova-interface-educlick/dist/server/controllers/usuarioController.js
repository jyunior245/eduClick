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
exports.criarUsuario = exports.removerUsuario = exports.atualizarUsuario = exports.buscarUsuario = exports.listarUsuarios = void 0;
const dataSource_1 = require("../../infrastructure/database/dataSource");
const Usuario_1 = require("../entities/Usuario"); // Certifique-se que está correto
const listarUsuarios = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json([]);
});
exports.listarUsuarios = listarUsuarios;
const buscarUsuario = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({});
});
exports.buscarUsuario = buscarUsuario;
const atualizarUsuario = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({ message: 'Usuário atualizado!' });
});
exports.atualizarUsuario = atualizarUsuario;
const removerUsuario = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({ message: 'Usuário removido!' });
});
exports.removerUsuario = removerUsuario;
const criarUsuario = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid, nome, email, senha, tipo } = req.body;
    if (!uid || !nome || !email || !senha || !tipo) {
        return res.status(400).json({ error: 'Dados obrigatórios faltando.' });
    }
    const repo = dataSource_1.AppDataSource.getRepository(Usuario_1.Usuario);
    const existe = yield repo.findOne({ where: { email } });
    if (existe)
        return res.status(409).json({ error: 'Email já cadastrado.' });
    const usuario = repo.create({ uid, nome, email, senha, tipo });
    yield repo.save(usuario);
    res.status(201).json(usuario);
});
exports.criarUsuario = criarUsuario;
