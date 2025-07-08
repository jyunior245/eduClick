import { IRepository } from "../../core/interfaces/IRepository";
import { HorarioIndisponivel } from "../../core/entities/HorarioIndisponivel";

export class InMemoryHorarioIndisponivelRepository implements IRepository<HorarioIndisponivel> {
  private horarios: HorarioIndisponivel[] = [];

  async salvar(horario: HorarioIndisponivel): Promise<void> {
    const idx = this.horarios.findIndex(h => h.id === horario.id);
    if (idx >= 0) this.horarios[idx] = horario;
    else this.horarios.push(horario);
  }

  async buscarPorId(id: string): Promise<HorarioIndisponivel | null> {
    return this.horarios.find(h => h.id === id) || null;
  }

  async listarTodos(): Promise<HorarioIndisponivel[]> {
    return [...this.horarios];
  }

  async remover(id: string): Promise<void> {
    this.horarios = this.horarios.filter(h => h.id !== id);
  }
} 