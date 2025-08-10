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
exports.Aluno = void 0;
const Usuario_1 = require("./Usuario");
class Aluno extends Usuario_1.Usuario {
    constructor(id, nome, email, senha, telefone, fotoPerfil) {
        // Criar objeto firebaseUser simulado para passar para o super()
        const firebaseUserFake = {
            uid: id,
            displayName: nome,
            email: email,
            getIdToken: () => __awaiter(this, void 0, void 0, function* () { return ''; }) // ou implementar se precisar do token
        };
        super(firebaseUserFake);
        this.senha = senha;
        this.telefone = telefone;
        this.fotoPerfil = fotoPerfil;
    }
}
exports.Aluno = Aluno;
