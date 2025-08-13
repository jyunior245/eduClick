import { Professor } from "../../core/entities/Professor";
import { Aluno } from "../../core/entities/Aluno";
import { Usuario } from "../../core/entities/Usuario";
import { IRepository } from "../../core/interfaces/IRepository";
import { FirebaseAuthProvider } from "../../infrastructure/auth/LocalAuthProvider";

export class AuthService {
  logout() {
    throw new Error("Method not implemented.");
  }
  private firebaseAuthProvider = new FirebaseAuthProvider();

  constructor(
    private professorRepository: IRepository<Professor>,
    private alunoRepository: IRepository<Aluno>
  ) {}

  async registrarProfessor(data: {
    nome: string;
    email: string;
    senha: string;
    descricao?: string;
    conteudosDominio?: string[];
  }): Promise<void> {
    const usuarioFirebase = await this.firebaseAuthProvider.registrar({
      nome: data.nome,
      email: data.email,
      senha: data.senha,
    });

  const professor = new Professor();
  professor.descricao = data.descricao;
  professor.conteudosDominio = data.conteudosDominio || [];

    const existente = await this.professorRepository.buscarPorId(professor.id);
    if (existente) {
      throw new Error("Professor já cadastrado");
    }

    await this.professorRepository.salvar(professor);
  }

  async login(email: string, senha: string): Promise<Professor> {
    const usuarioFirebase = await this.firebaseAuthProvider.login(email, senha);
    if (!usuarioFirebase) throw new Error("Credenciais inválidas");

  const professor = await this.professorRepository.buscarPorId(Number(usuarioFirebase.id));
    if (!professor) throw new Error("Professor não encontrado");

    return professor;
  }
}
