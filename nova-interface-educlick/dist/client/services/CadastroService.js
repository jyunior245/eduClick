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
exports.CadastroService = void 0;
const Toast_1 = require("../components/Toast");
const validators_1 = require("../utils/validators");
let _authProvider;
class CadastroService {
    static setAuthProvider(provider) {
        _authProvider = provider;
    }
    static validate(data) {
        return validators_1.Validators.validateCadastro(data);
    }
    static cadastrar(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!_authProvider) {
                    throw new Error('Auth provider não foi configurado.');
                }
                // Primeiro, criar usuário no Firebase
                const usuario = yield _authProvider.registrar({
                    nome: data.nome,
                    email: data.email,
                    senha: data.senha
                });
                // Depois, notificar o backend para criar o professor no repositório
                try {
                    const response = yield fetch('http://localhost:3000/api/professores/cadastro', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            nome: data.nome,
                            email: data.email,
                            senha: data.senha,
                            descricao: data.descricao,
                            conteudosDominio: data.conteudosDominio || []
                        })
                    });
                    if (!response.ok) {
                        const errorData = yield response.json();
                        console.warn('Erro no backend, mas usuário criado no Firebase:', errorData);
                        // Não vamos falhar se o backend não responder, pois o usuário já foi criado no Firebase
                    }
                }
                catch (backendError) {
                    console.warn('Erro ao conectar com o backend:', backendError);
                    // Não vamos falhar se o backend não estiver disponível
                }
                (0, Toast_1.mostrarToast)('Cadastro realizado com sucesso!', 'success');
                return {
                    success: true,
                    data: {
                        id: usuario.id,
                        nome: usuario.nome,
                        email: usuario.email
                    }
                };
            }
            catch (error) {
                console.error('Erro no cadastro:', error);
                // Verificar se é um erro específico do Firebase
                if (error.message.includes('email já está sendo usado') || error.message.includes('email já está cadastrado')) {
                    (0, Toast_1.mostrarToast)('Este email já está cadastrado. Tente fazer login.', 'warning');
                    // Redirecionar para login após 2 segundos
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 2000);
                }
                else if (error.message.includes('senha deve ter pelo menos 6 caracteres')) {
                    (0, Toast_1.mostrarToast)('A senha deve ter pelo menos 6 caracteres.', 'danger');
                }
                else if (error.message.includes('Email inválido')) {
                    (0, Toast_1.mostrarToast)('Por favor, insira um email válido.', 'danger');
                }
                else if (error.message.includes('Cadastro com email/senha não está habilitado')) {
                    (0, Toast_1.mostrarToast)('Erro na configuração do sistema. Entre em contato com o suporte.', 'danger');
                }
                else {
                    (0, Toast_1.mostrarToast)(error.message || 'Erro ao cadastrar. Tente novamente.', 'danger');
                }
                return { success: false, error: error.message || 'Erro desconhecido' };
            }
        });
    }
}
exports.CadastroService = CadastroService;
