// src/server/domain/services/ProfessorService.ts
import { Professor } from "../../core/entities/Professor";
import { IRepository } from "../../core/interfaces/IRepository";

export class ProfessorService {
  constructor(private professorRepository: IRepository<Professor>) {}

  async atualizarPerfil(id: string | number, dados: Partial<Professor>): Promise<Professor> {
    const professorId = Number(id);
    if (isNaN(professorId)) throw new Error("ID de professor inválido");

    const professor = await this.professorRepository.buscarPorId(professorId);
    if (!professor) throw new Error("Professor não encontrado");

    const camposPermitidos: (keyof Professor)[] = [
      'nomePersonalizado',
      'telefone',
      'formacao',
      'experiencia',
      'especialidade',
      'linkUnico',
      'fotoPerfil',
      'descricao',
      'bio',
      'observacoes'
    ];

    for (const campo of camposPermitidos) {
      if (dados[campo] !== undefined) {
        (professor as any)[campo] = dados[campo];
      }
    }

    await this.professorRepository.salvar(professor);
    return professor;
  }

  async listarTodos(): Promise<Professor[]> {
    return this.professorRepository.listarTodos();
  }

  async buscarPorId(id: string | number): Promise<Professor | null> {
    const professorId = Number(id);
    if (isNaN(professorId)) return null;
    return this.professorRepository.buscarPorId(professorId);
  }

  // Novo: busca por linkUnico (normaliza e permite fallback por id string)
  async buscarPorLinkUnico(linkOrId: string): Promise<Professor | null> {
    if (!linkOrId) return null;
    const busca = String(linkOrId).trim();

    // Tentar buscar por linkUnico diretamente (listaTodos + find)
    const todos = await this.professorRepository.listarTodos();
    const encontrado = todos.find(p => {
      const link = String((p as any).linkUnico ?? '').trim();
      if (link && link.toLowerCase() === busca.toLowerCase()) return true;
      // fallback: comparar com id
      return String(p.id) === busca;
    });
    return encontrado ?? null;
  }
}
