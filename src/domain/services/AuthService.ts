import { Professor } from "../../core/entities/Professor";
import { Aluno } from "../../core/entities/Aluno";
import { Usuario } from "../../core/entities/Usuario";
import { IRepository } from "../../core/interfaces/IRepository";

export class AuthService {
  constructor(
    private professorRepository: IRepository<Professor>,
    private alunoRepository: IRepository<Aluno>
  ) {}

  async registrar(usuario: Usuario): Promise<void> {
    if (usuario instanceof Professor) {
      const existente = await this.professorRepository.buscarPorId(usuario.id);
      if (existente) {
        throw new Error("Professor já cadastrado");
      }
      await this.professorRepository.salvar(usuario);
    } else if (usuario instanceof Aluno) {
      const existente = await this.alunoRepository.buscarPorId(usuario.id);
      if (existente) {
        throw new Error("Aluno já cadastrado");
      }
      await this.alunoRepository.salvar(usuario);
    }
  }

  async login(email: string, senha: string): Promise<Usuario> {
    // Tentar login como professor
    const professores = await this.professorRepository.listarTodos();
    const professor = professores.find(p => p.email === email && p.senha === senha);
    if (professor) {
      return professor;
    }

    // Tentar login como aluno
    const alunos = await this.alunoRepository.listarTodos();
    const aluno = alunos.find(a => a.email === email && a.senha === senha);
    if (aluno) {
      return aluno;
    }

    throw new Error("Credenciais inválidas");
  }

  async logout(): Promise<void> {
    // Implementação fictícia
    return;
  }
}