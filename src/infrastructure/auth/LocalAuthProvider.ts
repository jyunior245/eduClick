import { IAuthProvider } from "../../core/interfaces/IAuthProvider";
import { Usuario } from "../../core/entities/Usuario";
import { auth } from "../../client/firebase"; // IMPORT CORRETO
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  updateProfile,
  fetchSignInMethodsForEmail
} from "firebase/auth";

export class FirebaseAuthProvider implements IAuthProvider {
  async registrar(data: { nome: string; email: string; senha: string }): Promise<Usuario> {
    try {
      const cred = await createUserWithEmailAndPassword(auth, data.email, data.senha);
      
      // Atualizar o displayName do usuário
      if (cred.user) {
        // Note: updateProfile pode falhar se o usuário não estiver logado
        // Vamos tentar, mas não vamos falhar se não conseguir
        try {
          await updateProfile(cred.user, {
            displayName: data.nome
          });
        } catch (profileError) {
          console.warn('Não foi possível atualizar o displayName:', profileError);
        }
      }
      
      return new Usuario(cred.user);
    } catch (error: any) {
      console.error('Erro no registro Firebase:', error);
      
      // Mapear erros do Firebase para mensagens mais amigáveis
      let errorMessage = 'Erro ao criar conta';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este email já está sendo usado por outra conta';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'A senha deve ter pelo menos 6 caracteres';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Cadastro com email/senha não está habilitado';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Erro de conexão. Verifique sua internet';
      }
      
      throw new Error(errorMessage);
    }
  }

  async login(email: string, senha: string): Promise<Usuario | null> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      // Armazena o token localmente (opcional aqui)
      const token = await user.getIdToken();
      localStorage.setItem('token', token);

      return new Usuario(user);
    } catch (error: any) {
      console.error('Erro no login Firebase:', error);
      
      // Mapear erros do Firebase para mensagens mais amigáveis
      let errorMessage = 'Erro ao fazer login';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Usuário não encontrado';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Senha incorreta';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Email ou senha incorretos';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'Conta desabilitada';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Muitas tentativas. Tente novamente mais tarde';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Erro de conexão. Verifique sua internet';
      }
      
      throw new Error(errorMessage);
    }
  }

  async logout(): Promise<void> {
    await signOut(auth);
  }

  async verificarSeUsuarioExiste(email: string): Promise<boolean> {
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      console.log(`Métodos de login para ${email}:`, methods);
      return methods.length > 0;
    } catch (error: any) {
      console.error('Erro ao verificar se usuário existe:', error);
      
      // Se o erro for específico sobre email não encontrado, retorna false
      if (error.code === 'auth/user-not-found') {
        return false;
      }
      
      // Para outros erros, assume que o usuário pode existir
      return true;
    }
  }
}
