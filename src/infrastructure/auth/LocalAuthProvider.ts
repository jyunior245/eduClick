import { IAuthProvider } from "../../core/interfaces/IAuthProvider";
import { Usuario } from "../../core/entities/Usuario";
import { IRepository } from "../../core/interfaces/IRepository";

export class LocalAuthProvider implements IAuthProvider {
  constructor(private usuarioRepository: IRepository<Usuario>) {}

  async login(email: string, senha: string): Promise<Usuario | null> {
    return this.autenticar(email, senha);
  }

  private async autenticar(email: string, senha: string): Promise<Usuario | null> {
    const usuarios = await this.usuarioRepository.listarTodos();
    const usuario = usuarios.find(u => u.getValor() === email);
    if (usuario && usuario.autenticar(senha)) {
      return usuario;
    }
    return null;
  }

  async registrar(usuario: Usuario): Promise<void> {
    await this.usuarioRepository.salvar(usuario);
  }

  async logout(): Promise<void> {
    // Para autenticação local, não há necessidade de fazer logout no servidor
    // O logout é gerenciado pela sessão do Express
  }
}