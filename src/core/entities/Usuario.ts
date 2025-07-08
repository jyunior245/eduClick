export class Usuario {
  constructor(
    public id: string,
    public nome: string,
    public email: string,
    public senha: string,
    public tipo: string = "usuario"
  ) {}

  getValor(): string {
    return this.email;
  }

  autenticar(senha: string): boolean {
    return this.senha === senha;
  }
} 