import { InMemoryProfessorRepository } from "./InMemoryProfessorRepository";
import { InMemoryHorarioIndisponivelRepository } from "./InMemoryHorarioIndisponivelRepository";
import { InMemoryAulaRepository } from "./InMemoryAulaRepository";
import { InMemoryAlunoRepository } from "./InMemoryAlunoRepository";
import { Usuario } from "../../core/entities/Usuario";

export const professorRepository = new InMemoryProfessorRepository();
export const horarioIndisponivelRepository = new InMemoryHorarioIndisponivelRepository();
export const aulaRepository = new InMemoryAulaRepository();
export const alunoRepository = new InMemoryAlunoRepository();

// Stub para compatibilidade
export const usuarioRepository = {
  async buscarPorId(id: string): Promise<Usuario | null> {
    return null;
  }
}; 