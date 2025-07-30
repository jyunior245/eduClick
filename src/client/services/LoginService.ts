import { mostrarToast } from '../components/Toast';
import { LoginFormData, Professor, ApiResponse } from '../types';
import { FirebaseAuthProvider } from '../../infrastructure/auth/LocalAuthProvider';

let _authProvider: FirebaseAuthProvider;

export class LoginService {
  static setAuthProvider(provider: FirebaseAuthProvider) {
    _authProvider = provider;
  }

  static async login(data: LoginFormData): Promise<ApiResponse<Professor>> {
    try {
      const { email, senha } = data;

      if (!_authProvider) {
        throw new Error('Auth provider não foi configurado.');
      }

      // Tentar verificar se o usuário existe, mas não falhar se der erro
      let usuarioExiste = false;
      try {
        usuarioExiste = await _authProvider.verificarSeUsuarioExiste(email);
        console.log(`Usuário ${email} existe:`, usuarioExiste);
      } catch (verificacaoError) {
        console.warn('Erro ao verificar se usuário existe, tentando login diretamente:', verificacaoError);
      }

      // Se a verificação falhou, tentar login diretamente
      if (!usuarioExiste) {
        console.log('Usuário não encontrado na verificação, mas tentando login...');
      }

      // Fazer login no Firebase
      const usuario = await _authProvider.login(email, senha);

      if (usuario) {
        const token = await usuario.getIdToken(); // mantém o token do Firebase
        localStorage.setItem('token', token);    // guarda no localStorage

        // Sincronizar usuário com o backend
        try {
          const syncResponse = await fetch('http://localhost:3000/api/admin/sincronizar-usuario', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              uid: usuario.id,
              email: usuario.email,
              nome: usuario.nome
            })
          });
          
          if (syncResponse.ok) {
            console.log('Usuário sincronizado com o backend');
          } else {
            console.warn('Erro ao sincronizar usuário com o backend');
          }
        } catch (syncError) {
          console.warn('Erro ao sincronizar com o backend:', syncError);
          // Não vamos falhar se o backend não estiver disponível
        }

        mostrarToast('Login realizado com sucesso!', 'success');

        const professor: Professor = {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
        };

        return { success: true, data: professor };
      } else {
        mostrarToast('Email ou senha inválidos', 'danger');
        return { success: false, error: 'Email ou senha inválidos' };
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
      
      // Verificar se é um erro específico do Firebase
      if (error.message.includes('Email ou senha incorretos')) {
        mostrarToast('Email ou senha incorretos. Verifique suas credenciais.', 'danger');
      } else if (error.message.includes('Usuário não encontrado')) {
        mostrarToast('Usuário não encontrado. Verifique se você já se cadastrou.', 'warning');
      } else if (error.message.includes('Senha incorreta')) {
        mostrarToast('Senha incorreta. Tente novamente.', 'danger');
      } else if (error.message.includes('Erro de conexão')) {
        mostrarToast('Erro de conexão. Verifique sua internet.', 'danger');
      } else {
        mostrarToast(error.message || 'Erro ao fazer login. Tente novamente.', 'danger');
      }
      
      return { success: false, error: error.message || 'Erro desconhecido' };
    }
  }
}
