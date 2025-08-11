import { getPerfilProfessor, editarPerfilProfessor } from './api';
import { mostrarToast } from '../components/Toast';

export interface PerfilFormData {
  nome: string;
  email: string;
  telefone?: string;
  especialidade?: string;
  bio?: string;
  linkUnico?: string;
  observacoes?: string;
  formacao?: string;
  experiencia?: string;
  fotoUrl?: string;
}

export class EditarPerfilService {
  static async carregarPerfil(): Promise<any> {
    try {
      const res = await getPerfilProfessor();
      if (res.ok) {
        return await res.json();
      } else {
        throw new Error('Erro ao carregar perfil');
      }
    } catch (error) {
      mostrarToast('Erro ao carregar dados do perfil.', 'danger');
      throw error;
    }
  }

  static validate(data: PerfilFormData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data.nome?.trim()) {
      errors.push('Nome é obrigatório');
    }
    
    if (data.linkUnico && !/^[a-zA-Z0-9-_]+$/.test(data.linkUnico)) {
      errors.push('Link único deve conter apenas letras, números, hífens e underscores');
    }
    
    return { isValid: errors.length === 0, errors };
  }

  static async salvarPerfil(data: PerfilFormData): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await editarPerfilProfessor(data);
      if (res.ok) {
        mostrarToast('Perfil atualizado com sucesso!', 'success');
        return { success: true };
      } else {
        const err = await res.json();
        return { success: false, error: err.error || 'Erro desconhecido' };
      }
    } catch (error) {
      return { success: false, error: 'Erro ao conectar com o servidor.' };
    }
  }
} 