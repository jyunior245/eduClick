import { loginProfessor, handleApiResponse } from './api';
import { mostrarToast } from '../components/Toast';
import { LoginFormData, Professor, ApiResponse } from '../types';
import { Validators } from '../utils/validators';

export class LoginService {
  static validate(data: LoginFormData): { isValid: boolean; errors: string[] } {
    return Validators.validateLogin(data);
  }

  static async login(data: LoginFormData): Promise<ApiResponse<Professor>> {
    try {
      const res = await loginProfessor(data.email, data.senha);
      const result = await handleApiResponse<Professor>(res);
      
      if (result.success) {
        mostrarToast('Login realizado com sucesso!', 'success');
      }
      
      return result;
    } catch (error) {
      return { success: false, error: 'Erro ao conectar com o servidor.' };
    }
  }
} 