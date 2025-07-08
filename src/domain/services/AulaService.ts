import { Aula } from "../../core/entities/Aula";
import { IRepository } from "../../core/interfaces/IRepository";

export class AulaService {
  constructor(private aulaRepository: IRepository<Aula>) {}

  async criarAula(aula: Aula): Promise<void> {
    await this.aulaRepository.salvar(aula);
  }

  async listarAulasPorProfessor(professorId: string): Promise<Aula[]> {
    const todas = await this.aulaRepository.listarTodos();
    return todas.filter(a => a.professorId === professorId);
  }

  async listarAulasDisponiveisPorProfessor(professorId: string): Promise<Aula[]> {
    const aulas = await this.listarAulasPorProfessor(professorId);
    return aulas.filter(a => a.estaDisponivel);
  }

  async buscarAulaPorId(aulaId: string): Promise<Aula | null> {
    return await this.aulaRepository.buscarPorId(aulaId);
  }

  async reservarAula(aulaId: string, nome: string, telefone: string): Promise<boolean> {
    const aula = await this.buscarAulaPorId(aulaId);
    if (!aula) throw new Error("Aula não encontrada");
    const reservada = aula.reservarPublico(nome, telefone);
    if (reservada) {
      await this.aulaRepository.salvar(aula);
    }
    return reservada;
  }

  async cancelarReserva(aulaId: string, nome: string, telefone: string): Promise<boolean> {
    const aula = await this.buscarAulaPorId(aulaId);
    if (!aula) throw new Error("Aula não encontrada");
    const cancelada = aula.cancelarReservaPublico(nome, telefone);
    if (cancelada) {
      await this.aulaRepository.salvar(aula);
    }
    return cancelada;
  }

  async cancelarAula(aulaId: string): Promise<void> {
    const aula = await this.buscarAulaPorId(aulaId);
    if (!aula) throw new Error("Aula não encontrada");
    
    aula.status = 'cancelada';
    await this.aulaRepository.salvar(aula);
  }

  async atualizarAula(aula: Aula): Promise<void> {
    await this.aulaRepository.salvar(aula);
  }

  async excluirAula(aulaId: string): Promise<void> {
    await this.aulaRepository.remover(aulaId);
  }
} 