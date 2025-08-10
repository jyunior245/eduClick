import { mostrarToast } from '../components/Toast';
import { CadastroFormData, Professor, ApiResponse } from '../types';
import { Validators } from '../utils/validators';

import { FirebaseAuthProvider } from '../../infrastructure/auth/LocalAuthProvider';
import { Usuario } from '../../core/entities/Usuario';

let _authProvider: FirebaseAuthProvider;

export class CadastroService {
  static setAuthProvider(provider: FirebaseAuthProvider) {
    _authProvider = provider;
  }

  static validate(data: CadastroFormData): { isValid: boolean; errors: string[] } {
    return Validators.validateCadastro(data);
  }

  static async cadastrar(data: CadastroFormData): Promise<ApiResponse<Professor>> {
  try {
    if (!_authProvider) {
      throw new Error('Auth provider não foi configurado.');
    }

    // Primeiro, criar usuário no Firebase
    const usuario = await _authProvider.registrar({
      nome: data.nome,
      email: data.email,
      senha: data.senha
    });

    // Depois, notificar o backend para criar o professor no repositório
    try {
      const response = await fetch('http://localhost:3000/api/professores/cadastro', {
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
        const errorData = await response.json();
        console.warn('Erro no backend, mas usuário criado no Firebase:', errorData);
        // Não vamos falhar se o backend não responder, pois o usuário já foi criado no Firebase
      }
    } catch (backendError) {
      console.warn('Erro ao conectar com o backend:', backendError);
      // Não vamos falhar se o backend não estiver disponível
    }

    mostrarToast('Cadastro realizado com sucesso!', 'success');

    return {
      success: true,
      data: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
      }
    };
  } catch (error: any) {
    console.error('Erro no cadastro:', error);
    
    // Verificar se é um erro específico do Firebase
    if (error.message.includes('email já está sendo usado') || error.message.includes('email já está cadastrado')) {
      mostrarToast('Este email já está cadastrado. Tente fazer login.', 'warning');
      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } else if (error.message.includes('senha deve ter pelo menos 6 caracteres')) {
      mostrarToast('A senha deve ter pelo menos 6 caracteres.', 'danger');
    } else if (error.message.includes('Email inválido')) {
      mostrarToast('Por favor, insira um email válido.', 'danger');
    } else if (error.message.includes('Cadastro com email/senha não está habilitado')) {
      mostrarToast('Erro na configuração do sistema. Entre em contato com o suporte.', 'danger');
    } else {
      mostrarToast(error.message || 'Erro ao cadastrar. Tente novamente.', 'danger');
    }
    
    return { success: false, error: error.message || 'Erro desconhecido' };
  }
}}
