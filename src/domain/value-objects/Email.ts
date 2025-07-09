export class Email {
  private readonly valor: string;

  constructor(email: string) {
    if (!this.validarEmail(email)) {
      throw new Error("Email inválido");
    }
    this.valor = email;
  }

  private validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  public getValor(): string {
    return this.valor;
  }

  public equals(outroEmail: Email): boolean {
    return this.valor === outroEmail.valor;
  }
}