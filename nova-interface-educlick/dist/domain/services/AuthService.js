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
exports.AuthService = void 0;
const Professor_1 = require("../../core/entities/Professor");
const LocalAuthProvider_1 = require("../../infrastructure/auth/LocalAuthProvider");
class AuthService {
    logout() {
        throw new Error("Method not implemented.");
    }
    constructor(professorRepository, alunoRepository) {
        this.professorRepository = professorRepository;
        this.alunoRepository = alunoRepository;
        this.firebaseAuthProvider = new LocalAuthProvider_1.FirebaseAuthProvider();
    }
    registrarProfessor(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const usuarioFirebase = yield this.firebaseAuthProvider.registrar({
                nome: data.nome,
                email: data.email,
                senha: data.senha,
            });
            const professor = new Professor_1.Professor();
            professor.descricao = data.descricao;
            professor.conteudosDominio = data.conteudosDominio || [];
            const existente = yield this.professorRepository.buscarPorId(professor.id);
            if (existente) {
                throw new Error("Professor já cadastrado");
            }
            yield this.professorRepository.salvar(professor);
        });
    }
    login(email, senha) {
        return __awaiter(this, void 0, void 0, function* () {
            const usuarioFirebase = yield this.firebaseAuthProvider.login(email, senha);
            if (!usuarioFirebase)
                throw new Error("Credenciais inválidas");
            const professor = yield this.professorRepository.buscarPorId(Number(usuarioFirebase.id));
            if (!professor)
                throw new Error("Professor não encontrado");
            return professor;
        });
    }
}
exports.AuthService = AuthService;
