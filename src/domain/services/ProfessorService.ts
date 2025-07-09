import { Professor } from "../../core/entities/Professor";
import { IRepository } from "../../core/interfaces/IRepository";

export class ProfessorService {
  constructor(private professorRepository: IRepository<Professor>) {}

  async atualizarPerfil(id: string, dados: Partial<Omit<Professor, 'id'>>): Promise<Professor> {
    const professor = await this.professorRepository.buscarPorId(id);
    if (!professor) throw new Error("Professor não encontrado");
    Object.entries(dados).forEach(([key, value]) => {
      if (value !== undefined) {
        (professor as any)[key] = value;
      }
    });
    await this.professorRepository.salvar(professor);
    return professor;
  }

  async listarTodos(): Promise<Professor[]> {
    return this.professorRepository.listarTodos();
  }

  async buscarPorId(id: string): Promise<Professor | null> {
    return this.professorRepository.buscarPorId(id);
  }
} 