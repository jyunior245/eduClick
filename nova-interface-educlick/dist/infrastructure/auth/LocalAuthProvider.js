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
exports.FirebaseAuthProvider = void 0;
const Usuario_1 = require("../../core/entities/Usuario");
const firebase_1 = require("../../client/firebase"); // IMPORT CORRETO
const auth_1 = require("firebase/auth");
class FirebaseAuthProvider {
    registrar(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const cred = yield (0, auth_1.createUserWithEmailAndPassword)(firebase_1.auth, data.email, data.senha);
                // Atualizar o displayName do usuário
                if (cred.user) {
                    // Note: updateProfile pode falhar se o usuário não estiver logado
                    // Vamos tentar, mas não vamos falhar se não conseguir
                    try {
                        yield (0, auth_1.updateProfile)(cred.user, {
                            displayName: data.nome
                        });
                    }
                    catch (profileError) {
                        console.warn('Não foi possível atualizar o displayName:', profileError);
                    }
                }
                return new Usuario_1.Usuario(cred.user);
            }
            catch (error) {
                console.error('Erro no registro Firebase:', error);
                // Mapear erros do Firebase para mensagens mais amigáveis
                let errorMessage = 'Erro ao criar conta';
                if (error.code === 'auth/email-already-in-use') {
                    errorMessage = 'Este email já está sendo usado por outra conta';
                }
                else if (error.code === 'auth/weak-password') {
                    errorMessage = 'A senha deve ter pelo menos 6 caracteres';
                }
                else if (error.code === 'auth/invalid-email') {
                    errorMessage = 'Email inválido';
                }
                else if (error.code === 'auth/operation-not-allowed') {
                    errorMessage = 'Cadastro com email/senha não está habilitado';
                }
                else if (error.code === 'auth/network-request-failed') {
                    errorMessage = 'Erro de conexão. Verifique sua internet';
                }
                throw new Error(errorMessage);
            }
        });
    }
    login(email, senha) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userCredential = yield (0, auth_1.signInWithEmailAndPassword)(firebase_1.auth, email, senha);
                const user = userCredential.user;
                // Armazena o token localmente (opcional aqui)
                const token = yield user.getIdToken();
                localStorage.setItem('token', token);
                return new Usuario_1.Usuario(user);
            }
            catch (error) {
                console.error('Erro no login Firebase:', error);
                // Mapear erros do Firebase para mensagens mais amigáveis
                let errorMessage = 'Erro ao fazer login';
                if (error.code === 'auth/user-not-found') {
                    errorMessage = 'Usuário não encontrado';
                }
                else if (error.code === 'auth/wrong-password') {
                    errorMessage = 'Senha incorreta';
                }
                else if (error.code === 'auth/invalid-credential') {
                    errorMessage = 'Email ou senha incorretos';
                }
                else if (error.code === 'auth/invalid-email') {
                    errorMessage = 'Email inválido';
                }
                else if (error.code === 'auth/user-disabled') {
                    errorMessage = 'Conta desabilitada';
                }
                else if (error.code === 'auth/too-many-requests') {
                    errorMessage = 'Muitas tentativas. Tente novamente mais tarde';
                }
                else if (error.code === 'auth/network-request-failed') {
                    errorMessage = 'Erro de conexão. Verifique sua internet';
                }
                throw new Error(errorMessage);
            }
        });
    }
    logout() {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, auth_1.signOut)(firebase_1.auth);
        });
    }
    verificarSeUsuarioExiste(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const methods = yield (0, auth_1.fetchSignInMethodsForEmail)(firebase_1.auth, email);
                console.log(`Métodos de login para ${email}:`, methods);
                return methods.length > 0;
            }
            catch (error) {
                console.error('Erro ao verificar se usuário existe:', error);
                // Se o erro for específico sobre email não encontrado, retorna false
                if (error.code === 'auth/user-not-found') {
                    return false;
                }
                // Para outros erros, assume que o usuário pode existir
                return true;
            }
        });
    }
}
exports.FirebaseAuthProvider = FirebaseAuthProvider;
