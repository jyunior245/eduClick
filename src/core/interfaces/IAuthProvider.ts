export interface IAuthProvider {
  login(email: string, senha: string): Promise<any>;
  registrar(usuario: any): Promise<void>;
  // Adicione outros métodos conforme necessário
} 