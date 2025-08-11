import { DataSource, Repository } from 'typeorm';
import { Professor } from '../../server/entities/Professor';
import { IRepository } from '../../core/interfaces/IRepository';

export class TypeORMProfessorRepository implements IRepository<Professor> {
  private repository: Repository<Professor>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(Professor);
  }

  async salvar(professor: Professor): Promise<void> {
    await this.repository.save(professor);
  }

  async buscarPorId(id: number): Promise<Professor | null> {
    return await this.repository.findOne({ where: { id } }) || null;
  }

  async listarTodos(): Promise<Professor[]> {
    return await this.repository.find();
  }

  async remover(id: number): Promise<void> {
  await this.repository.delete(Number(id));
  }
}
