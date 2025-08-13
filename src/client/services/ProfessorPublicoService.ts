import { getProfessorPublico, getAulasPublicas, reservarAulaPublica, getPerfilEAulasPublicas } from './api';
import { mostrarToast } from '../components/Toast';

export class ProfessorPublicoService {
  static async carregarProfessor(linkUnico: string): Promise<any> {
    const res = await getProfessorPublico(linkUnico);
    if (!res.ok) throw new Error('Erro ao carregar dados do professor');
    return await res.json();
  }

  static async carregarAulas(linkUnico: string): Promise<any[]> {
    const res = await getAulasPublicas(linkUnico);
    if (!res.ok) throw new Error('Erro ao carregar aulas');
    return await res.json();
  }

  static async reservarAula(
    linkUnico: string,
    aulaId: string,
    nome: string,
    telefone: string,
    email: string,
    alunoFcmToken?: string | null
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Payload correto para o backend (inclui token opcional do aluno)
      const payload: any = { aulaId, alunoNome: nome, alunoTelefone: telefone, alunoEmail: email };
      if (alunoFcmToken) payload.alunoFcmToken = alunoFcmToken;
      const res = await reservarAulaPublica(linkUnico, aulaId, payload);
      if (res.ok) {
        mostrarToast('Reserva realizada com sucesso!', 'success');
        return { success: true };
      } else {
        const err = await res.json();
        return { success: false, error: err.error || 'Erro desconhecido' };
      }
    } catch (error) {
      return { success: false, error: 'Erro ao conectar com o servidor.' };
    }
  }

  static async carregarPerfilEAulas(linkUnico: string): Promise<any> {
    const res = await getPerfilEAulasPublicas(linkUnico);
    if (!res.ok) throw new Error('Erro ao carregar dados do professor');
    return await res.json();
  }
} 