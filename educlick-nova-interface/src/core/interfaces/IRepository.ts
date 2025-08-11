export interface IRepository<T> {
  salvar(entidade: T): Promise<void>;
  buscarPorId(id: number): Promise<T | null>;
  listarTodos(): Promise<T[]>;
  remover(id: number): Promise<void>;
}