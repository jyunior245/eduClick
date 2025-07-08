import { Aluno } from "../../core/entities/Aluno";
import { IRepository } from "../../core/interfaces/IRepository";

export class InMemoryAlunoRepository implements IRepository<Aluno> {
  private alunos: Aluno[] = [];

  async salvar(aluno: Aluno): Promise<void> {
    const index = this.alunos.findIndex(a => a.id === aluno.id);
    if (index >= 0) {
      this.alunos[index] = aluno;
    } else {
      this.alunos.push(aluno);
    }
  }

  async buscarPorId(id: string): Promise<Aluno | null> {
    return this.alunos.find(a => a.id === id) || null;
  }

  async listarTodos(): Promise<Aluno[]> {
    return [...this.alunos];
  }

  async remover(id: string): Promise<void> {
    this.alunos = this.alunos.filter(a => a.id !== id);
  }
} 