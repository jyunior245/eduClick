import { getMinhasAulas, getPerfilProfessor, criarAula, editarAula, excluirAula } from './api';
import { mostrarToast } from '../components/Toast';
import { AulaCardData } from '../components/ui/AulaCard';

export interface DashboardData {
  usuario: any;
  aulas: AulaCardData[];
}

export interface AulaFormData {
  titulo: string;
  conteudo: string;
  valor: number;
  duracao: number;
  maxAlunos: number;
  dataHora: string;
  status: string;
  observacoes?: string;
}

export class DashboardService {
  static async loadDashboardData(): Promise<DashboardData> {
    try {
      const [aulasRes, perfilRes] = await Promise.all([
        getMinhasAulas(),
        getPerfilProfessor()
      ]);

      const aulas = aulasRes.ok ? await aulasRes.json() : [];
      const usuario = perfilRes.ok ? await perfilRes.json() : {};

      return { usuario, aulas };
    } catch (error) {
      mostrarToast('Erro ao carregar dados do dashboard.', 'danger');
      return { usuario: {}, aulas: [] };
    }
  }

  static async criarAula(aulaData: AulaFormData): Promise<boolean> {
    try {
      const payload = {
        ...aulaData,
        valor: parseFloat(aulaData.valor.toString()),
        duracao: parseInt(aulaData.duracao.toString(), 10),
        maxAlunos: parseInt(aulaData.maxAlunos.toString(), 10)
      };

      const res = await criarAula(payload);
      
      if (res.ok) {
        mostrarToast('Aula criada com sucesso!', 'success');
        return true;
      } else {
        const err = await res.json();
        mostrarToast('Erro ao criar aula: ' + (err.error || 'Erro desconhecido'), 'danger');
        return false;
      }
    } catch (error) {
      mostrarToast('Erro ao conectar com o servidor.', 'danger');
      return false;
    }
  }

  static async editarAula(aulaId: string, aulaData: AulaFormData): Promise<boolean> {
    try {
      const payload = {
        ...aulaData,
        valor: parseFloat(aulaData.valor.toString()),
        duracao: parseInt(aulaData.duracao.toString(), 10),
        maxAlunos: parseInt(aulaData.maxAlunos.toString(), 10)
      };

      const res = await editarAula(aulaId, payload);
      
      if (res.ok) {
        mostrarToast('Aula editada com sucesso!', 'success');
        return true;
      } else {
        const err = await res.json();
        mostrarToast('Erro ao editar aula: ' + (err.error || 'Erro desconhecido'), 'danger');
        return false;
      }
    } catch (error) {
      mostrarToast('Erro ao conectar com o servidor.', 'danger');
      return false;
    }
  }

  static async excluirAula(aulaId: string): Promise<boolean> {
    try {
      const res = await excluirAula(aulaId);
      
      if (res.ok) {
        mostrarToast('Aula excluída com sucesso!', 'success');
        return true;
      } else {
        mostrarToast('Erro ao excluir aula.', 'danger');
        return false;
      }
    } catch (error) {
      mostrarToast('Erro ao conectar com o servidor.', 'danger');
      return false;
    }
  }

  static async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      return false;
    }
  }

  static validateAulaData(aulaData: AulaFormData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!aulaData.titulo?.trim()) {
      errors.push('Título é obrigatório');
    }

    if (!aulaData.conteudo?.trim()) {
      errors.push('Conteúdo é obrigatório');
    }

    if (!aulaData.valor || aulaData.valor <= 0) {
      errors.push('Valor deve ser maior que zero');
    }

    if (!aulaData.duracao || aulaData.duracao <= 0) {
      errors.push('Duração deve ser maior que zero');
    }

    if (!aulaData.maxAlunos || aulaData.maxAlunos <= 0) {
      errors.push('Número de vagas deve ser maior que zero');
    }

    if (!aulaData.dataHora) {
      errors.push('Data e hora são obrigatórios');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
} 