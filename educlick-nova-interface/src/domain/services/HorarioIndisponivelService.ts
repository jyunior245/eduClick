import { HorarioIndisponivel } from "../../core/entities/HorarioIndisponivel";
import { IRepository } from "../../core/interfaces/IRepository";

export class HorarioIndisponivelService {
  constructor(private horarioRepository: IRepository<HorarioIndisponivel>) {}

  async criar(horario: HorarioIndisponivel): Promise<void> {
    await this.horarioRepository.salvar(horario);
  }

  async listarPorProfessor(professorId: string): Promise<HorarioIndisponivel[]> {
    const todos = await this.horarioRepository.listarTodos();
    return todos.filter(h => h.professorId === professorId);
  }

  async remover(id: string): Promise<void> {
  await this.horarioRepository.remover(Number(id));
  }
} 