import { mostrarToast } from '../components/Toast';
import { cadastroProfessor, handleApiResponse } from './api';
import { CadastroFormData, Professor, ApiResponse } from '../types';
import { Validators } from '../utils/validators';

export class CadastroService {
  static validate(data: CadastroFormData): { isValid: boolean; errors: string[] } {
    return Validators.validateCadastro(data);
  }

  static async cadastrar(data: CadastroFormData): Promise<ApiResponse<Professor>> {
    try {
      const { nome, email, senha } = data;
      const res = await cadastroProfessor({ nome, email, senha });
      const result = await handleApiResponse<Professor>(res);
      
      if (result.success) {
        mostrarToast('Cadastro realizado com sucesso!', 'success');
      }
      
      return result;
    } catch (error) {
      return { success: false, error: 'Erro ao conectar com o servidor.' };
    }
  }
} 