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
exports.AuthController = void 0;
const AuthService_1 = require("../../domain/services/AuthService");
const Professor_1 = require("../../core/entities/Professor");
const Aluno_1 = require("../../core/entities/Aluno");
const singletons_1 = require("../../infrastructure/repositories/singletons");
const LocalAuthProvider_1 = require("../../infrastructure/auth/LocalAuthProvider");
const authService = new AuthService_1.AuthService(singletons_1.professorRepository, singletons_1.alunoRepository);
const authProvider = new LocalAuthProvider_1.FirebaseAuthProvider();
class AuthController {
    static registrar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nome, email, senha, tipo, telefone, descricao, conteudosDominio } = req.body;
                if (tipo === "PROFESSOR") {
                    // Cria usuário no Firebase
                    const usuarioFirebase = yield authProvider.registrar({ nome, email, senha });
                    // Cria objeto Professor e atribui campos manualmente
                    const professor = new Professor_1.Professor();
                    professor.nome = nome;
                    professor.descricao = descricao;
                    professor.conteudosDominio = conteudosDominio || [];
                    // Salvar professor no repositório (via seu service)
                    yield authService.registrarProfessor({
                        nome,
                        email,
                        senha,
                        descricao,
                        conteudosDominio
                    });
                    res.status(201).json({ message: "Professor registrado com sucesso", id: professor.id });
                }
                else {
                    // Similar para Aluno...
                }
            }
            catch (error) {
                res.status(400).json({ error: error.message });
            }
        });
    }
    static login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, senha } = req.body;
                const usuario = yield authService.login(email, senha);
                // Definir tipo baseado na instância
                const tipo = usuario instanceof Professor_1.Professor ? 'PROFESSOR' : 'ALUNO';
                req.session.usuario = {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: email,
                    tipo: tipo
                };
                // Compatibilidade: se for professor, setar também req.session.professorId
                if (tipo === 'PROFESSOR') {
                    req.session.professorId = String(usuario.id);
                }
                console.log('Sessão após login:', req.session.usuario);
                res.status(200).json(req.session.usuario);
            }
            catch (error) {
                res.status(401).json({ error: error.message });
            }
        });
    }
    static logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield authService.logout();
                req.session.destroy(() => { });
                res.status(200).json({ message: "Logout realizado com sucesso" });
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    }
    static loginProfessor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, senha } = req.body;
                const usuario = yield authService.login(email, senha);
                if (!(usuario instanceof Professor_1.Professor)) {
                    throw new Error("Credenciais inválidas para professor");
                }
                req.session.usuario = {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: email,
                    tipo: 'PROFESSOR'
                };
                res.status(200).json(req.session.usuario);
            }
            catch (error) {
                res.status(401).json({ error: error.message });
            }
        });
    }
    static loginAluno(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, senha } = req.body;
                const usuario = yield authService.login(email, senha);
                if (!(usuario instanceof Aluno_1.Aluno)) {
                    throw new Error("Credenciais inválidas para aluno");
                }
                req.session.usuario = {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: email,
                    tipo: 'ALUNO'
                };
                res.status(200).json(req.session.usuario);
            }
            catch (error) {
                res.status(401).json({ error: error.message });
            }
        });
    }
    static checkSession(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const usuario = req.session.usuario;
                if (usuario) {
                    res.status(200).json(usuario);
                }
                else {
                    res.status(401).json({ error: "Usuário não autenticado" });
                }
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    }
}
exports.AuthController = AuthController;
