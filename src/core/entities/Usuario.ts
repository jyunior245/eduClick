export class Usuario {
  constructor(private firebaseUser: any) {} // firebase.User do Firebase

  get id(): string {
    return this.firebaseUser.uid;
  }

  get nome(): string {
    return this.firebaseUser.displayName || 'Usuário';
  }

  get email(): string {
    return this.firebaseUser.email;
  }

  async getIdToken(): Promise<string> {
    return await this.firebaseUser.getIdToken();
  }

  getValor(): string {
    return this.email;
  }

  autenticar(_senha: string): boolean {
    // Firebase cuida da autenticação
    return true;
  }
}
