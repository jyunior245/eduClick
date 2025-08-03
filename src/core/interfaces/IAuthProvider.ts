import { Usuario } from "core/entities/Usuario";

export interface IAuthProvider {
  registrar(data: { nome: string; email: string; senha: string }): Promise<Usuario>;
  login(email: string, senha: string): Promise<Usuario | null>;
  logout(): Promise<void>;
  // Adicione outros métodos conforme necessário
} 
