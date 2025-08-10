import { DataSource, Repository } from 'typeorm';
import { Aula, StatusAula } from '../../server/entities/Aula';
import { Professor } from '../../server/entities/Professor';

export class TypeORMAulaRepository {
  private repository: Repository<Aula>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(Aula);
  }

  async listarDisponiveisPorProfessor(professorId: number): Promise<Aula[]> {
    return this.repository.find({
      where: {
        professor: { id: professorId },
        status: StatusAula.DISPONIVEL
      },
      relations: ['professor']
    });
  }

  // Outros métodos podem ser implementados conforme necessário
}
