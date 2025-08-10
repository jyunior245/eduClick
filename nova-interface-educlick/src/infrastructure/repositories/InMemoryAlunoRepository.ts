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

  async buscarPorId(id: number): Promise<Aluno | null> {
  return this.alunos.find(a => String(a.id) === String(id)) || null;
  }

  async listarTodos(): Promise<Aluno[]> {
    return [...this.alunos];
  }

  async remover(id: number): Promise<void> {
  this.alunos = this.alunos.filter(a => String(a.id) !== String(id));
  }
} 