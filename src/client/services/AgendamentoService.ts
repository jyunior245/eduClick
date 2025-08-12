import { agendarComProfessor, getInfoProfessor } from './api';
import { mostrarToast } from '../components/Toast';

export interface AgendamentoFormData {
  nome: string;
  telefone: string;
  dataHora: string;
}

export class AgendamentoService {
  static async carregarProfessor(professorId: string): Promise<any> {
    try {
      const res = await getInfoProfessor(professorId);
      if (res.ok) {
        return await res.json();
      } else {
        throw new Error('Erro ao carregar dados do professor');
      }
    } catch (error) {
      mostrarToast('Erro ao carregar dados do professor.', 'danger');
      throw error;
    }
  }

  static validate(data: AgendamentoFormData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!data.nome?.trim()) errors.push('Nome é obrigatório');
    if (!data.telefone?.trim()) errors.push('Telefone é obrigatório');
    if (!data.dataHora?.trim()) errors.push('Data e hora são obrigatórios');
    return { isValid: errors.length === 0, errors };
  }

  static async agendar(professorId: string, data: AgendamentoFormData): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await agendarComProfessor(professorId, data);
      if (res.ok) {
        mostrarToast('Agendamento realizado com sucesso!', 'success');
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
