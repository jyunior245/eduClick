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
exports.Usuario = void 0;
class Usuario {
    constructor(firebaseUser) {
        this.firebaseUser = firebaseUser;
    } // firebase.User do Firebase
    get id() {
        return this.firebaseUser.uid;
    }
    get nome() {
        return this.firebaseUser.displayName || 'Usuário';
    }
    get email() {
        return this.firebaseUser.email;
    }
    getIdToken() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.firebaseUser.getIdToken();
        });
    }
    getValor() {
        return this.email;
    }
    autenticar(_senha) {
        // Firebase cuida da autenticação
        return true;
    }
}
exports.Usuario = Usuario;
