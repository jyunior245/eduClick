import { Aula } from "../../core/entities/Aula";
import { IRepository } from "../../core/interfaces/IRepository";

export class InMemoryAulaRepository implements IRepository<Aula> {
  private aulas: Aula[] = [];

  async salvar(aula: Aula): Promise<void> {
    const index = this.aulas.findIndex(a => a.id === aula.id);
    if (index >= 0) {
      this.aulas[index] = aula;
    } else {
      this.aulas.push(aula);
    }
  }

  async buscarPorId(id: string): Promise<Aula | null> {
    return this.aulas.find(a => a.id === id) || null;
  }

  async listarTodos(): Promise<Aula[]> {
    return [...this.aulas];
  }

  async remover(id: string): Promise<void> {
    this.aulas = this.aulas.filter(a => a.id !== id);
  }

  limpar(): void {
    this.aulas = [];
  }

  async buscarPorProfessor(professorId: string): Promise<Aula[]> {
    return this.aulas.filter(a => a.professorId === professorId);
  }
} 