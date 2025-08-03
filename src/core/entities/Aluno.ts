import { Usuario } from "./Usuario";

export class Aluno extends Usuario {
  public senha: string;
  public telefone: string;
  public fotoPerfil?: string;

  constructor(
    id: string,
    nome: string,
    email: string,
    senha: string,
    telefone: string,
    fotoPerfil?: string
  ) {
    // Criar objeto firebaseUser simulado para passar para o super()
    const firebaseUserFake = {
      uid: id,
      displayName: nome,
      email: email,
      getIdToken: async () => '' // ou implementar se precisar do token
    };

    super(firebaseUserFake);

    this.senha = senha;
    this.telefone = telefone;
    this.fotoPerfil = fotoPerfil;
  }
}
