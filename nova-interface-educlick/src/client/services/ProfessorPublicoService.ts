// src/client/services/ProfessorPublicoService.ts
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

  static async reservarAula(linkUnico: string, aulaId: string, nome: string, telefone: string, email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const payload = { aulaId, alunoNome: nome, alunoTelefone: telefone, alunoEmail: email };
      const res = await reservarAulaPublica(linkUnico, aulaId, payload);
      if (res.ok) {
        return { success: true };
      } else {
        const err = await res.json().catch(() => ({ error: 'Erro desconhecido' }));
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
