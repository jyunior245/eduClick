// src/client/services/LoginService.ts
import { mostrarToast } from '../components/Toast';
import { LoginFormData, Professor, ApiResponse } from '../types';
import { FirebaseAuthProvider } from '../../infrastructure/auth/LocalAuthProvider';
import { setupPushAfterLogin } from './notifications';

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

      // Fazer login no Firebase (vai lançar erro se credenciais inválidas)
      const usuario = await _authProvider.login(email, senha);
      if (!usuario) {
        mostrarToast('Email ou senha inválidos', 'danger');
        return { success: false, error: 'Email ou senha inválidos' };
      }

      // pegar token (opcional — útil para validação no servidor)
      let token = '';
      try {
        token = await usuario.getIdToken();
        localStorage.setItem('token', token);
      } catch (err) {
        console.warn('Não foi possível obter idToken do Firebase:', err);
      }

      const uid = (usuario as any).uid ?? (usuario as any).id; // prefer uid
      const nome = (usuario as any).displayName ?? (usuario as any).nome ?? '';
      const userEmail = (usuario as any).email ?? email;

      // 1) Sincronizar usuário no backend (mantemos essa chamada)
      try {
        const syncResponse = await fetch('http://localhost:3000/api/auth/sincronizar-usuario', {
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
        } else {
          console.log('Usuário sincronizado com o backend');
        }
      } catch (syncError) {
        console.warn('Erro ao sincronizar com o backend:', syncError);
      }

      // 2) Criar sessão no backend via novo endpoint específico para Firebase
      try {
        const backendLogin = await fetch('http://localhost:3000/api/auth/firebase-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ uid })
        });

        if (!backendLogin.ok) {
          // tenta ler mensagem de erro do backend
          let msg = 'Falha ao criar sessão no backend.';
          try {
            const errJson = await backendLogin.json();
            msg = errJson.error || msg;
          } catch (e) { /* ignore */ }

          mostrarToast(msg, 'danger');
          return { success: false, error: msg };
        }

        const json = await backendLogin.json();
        // Esperamos que o backend retorne o professor (ou objeto de usuário)
        const professorFromBackend: Professor = json.professor ?? json.data ?? json;
        mostrarToast('Login realizado com sucesso!', 'success');
        // Registrar token FCM após login
        try {
          await setupPushAfterLogin(token);
        } catch (e) {
          console.warn('Falha ao configurar push após login:', e);
        }
        return { success: true, data: professorFromBackend };
      } catch (backendError) {
        console.warn('Erro ao criar sessão no backend:', backendError);
        mostrarToast('Erro ao criar sessão no backend.', 'danger');
        return { success: false, error: 'Erro ao criar sessão no backend.' };
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
      // Mensagens amigáveis
      const message = (error && error.message) ? error.message : 'Erro ao fazer login. Tente novamente.';
      mostrarToast(message, 'danger');
      return { success: false, error: message };
    }
  }
}
