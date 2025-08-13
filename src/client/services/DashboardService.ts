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

      const aulasRaw = aulasRes.ok ? await aulasRes.json() : [];
      // Mapear campos do backend para o formato esperado pelo card
      const aulas = aulasRaw.map((aula: any) => {
        const reservas = Array.isArray(aula.reservas) ? aula.reservas : [];
        const reservasAtivas = reservas.filter((r: any) => String(r?.status || '').toLowerCase() === 'ativa');
        return {
          id: aula.id ?? '',
          titulo: aula.titulo ?? '',
          conteudo: aula.conteudo ?? '',
          valor: aula.valor != null ? Number(aula.valor) : 0,
          duracao: aula.duracao != null ? Number(aula.duracao) : 0,
          dataHora: aula.data_hora ?? aula.dataHora ?? '',
          maxAlunos: aula.vagas_total != null ? Number(aula.vagas_total) : (aula.maxAlunos != null ? Number(aula.maxAlunos) : 0),
          status: aula.status ?? '',
          observacoes: aula.observacoes ?? '',
          reservas,
          reservasAtivasCount: reservasAtivas.length,
        } as any;
      });
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
        valor: parseFloat(aulaData.valor?.toString() ?? '0'),
        duracao: parseInt(aulaData.duracao?.toString() ?? '0', 10),
        vagas_total: Math.max(1, parseInt(aulaData.maxAlunos?.toString() ?? '1', 10)),
        data_hora: aulaData.dataHora
      };

      const res = await criarAula(payload);
      
      if (res.ok) {
        mostrarToast('Aula criada com sucesso!', 'success');
        // Notificar outras partes da UI para atualizar sem reload
        try { window.dispatchEvent(new CustomEvent('aulas-updated')); } catch {}
        try { const bc = new (window as any).BroadcastChannel('aulas'); bc.postMessage({ type: 'AULAS_UPDATED' }); if (typeof bc.close === 'function') bc.close(); } catch {}
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
        titulo: aulaData.titulo,
        conteudo: aulaData.conteudo,
        valor: parseFloat(aulaData.valor.toString()),
        duracao: parseInt(aulaData.duracao.toString(), 10),
        vagas_total: parseInt(aulaData.maxAlunos.toString(), 10),
        data_hora: aulaData.dataHora,
        status: aulaData.status,
        observacoes: aulaData.observacoes || ''
      };

      // @ts-ignore: o backend espera esses campos
      const res = await editarAula(aulaId, payload);
      
      if (res.ok) {
        mostrarToast('Aula editada com sucesso!', 'success');
        // Notificar atualização
        try { window.dispatchEvent(new CustomEvent('aulas-updated')); } catch {}
        try { const bc = new (window as any).BroadcastChannel('aulas'); bc.postMessage({ type: 'AULAS_UPDATED' }); if (typeof bc.close === 'function') bc.close(); } catch {}
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
        // Notificar atualização
        try { window.dispatchEvent(new CustomEvent('aulas-updated')); } catch {}
        try { const bc = new (window as any).BroadcastChannel('aulas'); bc.postMessage({ type: 'AULAS_UPDATED' }); if (typeof bc.close === 'function') bc.close(); } catch {}
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

    const validStatuses = ['disponivel', 'lotada', 'cancelada', 'reagendada'];
    if (aulaData.status && !validStatuses.includes(aulaData.status)) {
      errors.push('Status inválido');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}