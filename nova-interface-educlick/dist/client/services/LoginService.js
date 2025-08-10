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
exports.LoginService = void 0;
// src/client/services/LoginService.ts
const Toast_1 = require("../components/Toast");
let _authProvider;
class LoginService {
    static setAuthProvider(provider) {
        _authProvider = provider;
    }
    static login(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            try {
                const { email, senha } = data;
                if (!_authProvider) {
                    throw new Error('Auth provider não foi configurado.');
                }
                // Fazer login no Firebase (vai lançar erro se credenciais inválidas)
                const usuario = yield _authProvider.login(email, senha);
                if (!usuario) {
                    (0, Toast_1.mostrarToast)('Email ou senha inválidos', 'danger');
                    return { success: false, error: 'Email ou senha inválidos' };
                }
                // pegar token (opcional — útil para validação no servidor)
                let token = '';
                try {
                    token = yield usuario.getIdToken();
                    localStorage.setItem('token', token);
                }
                catch (err) {
                    console.warn('Não foi possível obter idToken do Firebase:', err);
                }
                const uid = (_a = usuario.uid) !== null && _a !== void 0 ? _a : usuario.id; // prefer uid
                const nome = (_c = (_b = usuario.displayName) !== null && _b !== void 0 ? _b : usuario.nome) !== null && _c !== void 0 ? _c : '';
                const userEmail = (_d = usuario.email) !== null && _d !== void 0 ? _d : email;
                // 1) Sincronizar usuário no backend (mantemos essa chamada)
                try {
                    const syncResponse = yield fetch('http://localhost:3000/api/admin/sincronizar-usuario', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            // opcional: 'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            uid,
                            email: userEmail,
                            nome
                        })
                    });
                    if (!syncResponse.ok) {
                        console.warn('Erro ao sincronizar usuário com o backend (não fatal).');
                    }
                    else {
                        console.log('Usuário sincronizado com o backend');
                    }
                }
                catch (syncError) {
                    console.warn('Erro ao sincronizar com o backend:', syncError);
                }
                // 2) Criar sessão no backend via novo endpoint específico para Firebase
                try {
                    const backendLogin = yield fetch('http://localhost:3000/api/auth/firebase-login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ uid })
                    });
                    if (!backendLogin.ok) {
                        // tenta ler mensagem de erro do backend
                        let msg = 'Falha ao criar sessão no backend.';
                        try {
                            const errJson = yield backendLogin.json();
                            msg = errJson.error || msg;
                        }
                        catch (e) { /* ignore */ }
                        (0, Toast_1.mostrarToast)(msg, 'danger');
                        return { success: false, error: msg };
                    }
                    const json = yield backendLogin.json();
                    // Esperamos que o backend retorne o professor (ou objeto de usuário)
                    const professorFromBackend = (_f = (_e = json.professor) !== null && _e !== void 0 ? _e : json.data) !== null && _f !== void 0 ? _f : json;
                    (0, Toast_1.mostrarToast)('Login realizado com sucesso!', 'success');
                    return { success: true, data: professorFromBackend };
                }
                catch (backendError) {
                    console.warn('Erro ao criar sessão no backend:', backendError);
                    (0, Toast_1.mostrarToast)('Erro ao criar sessão no backend.', 'danger');
                    return { success: false, error: 'Erro ao criar sessão no backend.' };
                }
            }
            catch (error) {
                console.error('Erro no login:', error);
                // Mensagens amigáveis
                const message = (error && error.message) ? error.message : 'Erro ao fazer login. Tente novamente.';
                (0, Toast_1.mostrarToast)(message, 'danger');
                return { success: false, error: message };
            }
        });
    }
}
exports.LoginService = LoginService;
