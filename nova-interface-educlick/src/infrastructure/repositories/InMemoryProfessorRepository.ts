import { IRepository } from "../../core/interfaces/IRepository";
import { Professor } from "../../core/entities/Professor";

export class InMemoryProfessorRepository implements IRepository<Professor> {
  private professores: Professor[] = [];

  async salvar(professor: Professor): Promise<void> {
    const idx = this.professores.findIndex(p => p.id === professor.id);
    if (idx >= 0) this.professores[idx] = professor;
    else this.professores.push(professor);
  }

  async buscarPorId(id: number): Promise<Professor | null> {
    return this.professores.find(p => p.id === id) || null;
  }

  async listarTodos(): Promise<Professor[]> {
    return [...this.professores];
  }

  async remover(id: number): Promise<void> {
    this.professores = this.professores.filter(p => p.id !== id);
  }

  limpar(): void {
    this.professores = [];
  }
} 