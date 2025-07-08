import { Usuario } from "./Usuario";

export class Aluno extends Usuario {
  constructor(
    public readonly id: string,
    public nome: string,
    public email: string,
    public senha: string,
    public telefone: string,
    public fotoPerfil?: string
  ) {
    super(id, nome, email, senha);
  }
} 