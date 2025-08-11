

import { TypeORMAulaRepository } from './TypeORMAulaRepository';
import { Aula, StatusAula } from '../../server/entities/Aula';
import { AppDataSource } from '../database/dataSource';
import { Usuario } from '../../server/entities/Usuario';
import { Aluno } from '../../server/entities/Aluno';
import { Reserva } from '../../server/entities/Reserva';

export class TypeORMAulaService {
  constructor(private typeormAulaRepository: TypeORMAulaRepository) {}

  async listarAulasDisponiveisPorProfessor(professorId: string): Promise<Aula[]> {
    const aulas = await this.typeormAulaRepository.listarDisponiveisPorProfessor(Number(professorId));
    // Garantir que só retornamos aulas com vagas restantes
    return aulas.filter(a => {
      const total = typeof a.vagas_total === 'number' ? a.vagas_total : Number(a.vagas_total) || 0;
      const ocup = typeof a.vagas_ocupadas === 'number' ? a.vagas_ocupadas : Number(a.vagas_ocupadas) || 0;
      return total > ocup;
    });
  }

  async listarAulasPorProfessor(professorId: string): Promise<Aula[]> {
    // Busca todas as aulas do professor
    return this.typeormAulaRepository['repository'].find({
      where: { professor: { id: Number(professorId) } },
      relations: ['professor', 'reservas', 'reservas.aluno', 'reservas.aluno.usuario']
    });
  }

  async buscarAulaPorId(aulaId: string): Promise<Aula | null> {
    return this.typeormAulaRepository['repository'].findOne({
      where: { id: Number(aulaId) },
      relations: ['professor']
    });
  }

  async reservarAula(aulaId: string, nome: string, telefone: string, email: string): Promise<boolean> {
    // Busca a aula
    const aula = await this.buscarAulaPorId(aulaId);
    if (!aula) {
      console.warn('[reservarAula] Aula não encontrada:', aulaId);
      return false;
    }
    // Permitir reserva se a aula estiver DISPONIVEL ou REAGENDADA
    if (![StatusAula.DISPONIVEL, StatusAula.REAGENDADA].includes(aula.status as any)) {
      console.warn('[reservarAula] Aula não está em um status reservável:', aula.id, 'Status:', aula.status);
      return false;
    }
    if (aula.vagas_ocupadas >= aula.vagas_total) {
      console.warn('[reservarAula] Aula lotada:', aula.id, 'Vagas ocupadas:', aula.vagas_ocupadas, 'Vagas total:', aula.vagas_total);
      return false;
    }

    // 1. Buscar ou criar Usuario (tipo aluno)
    const usuarioRepo = AppDataSource.getRepository(Usuario);
    let usuario = await usuarioRepo.findOne({ where: { email: email.toLowerCase() } });
    if (!usuario) {
      usuario = usuarioRepo.create({
        uid: `aluno_${Date.now()}_${Math.floor(Math.random()*10000)}`,
        nome,
        email: email.toLowerCase(),
        senha: '',
        tipo: 'aluno',
      });
      await usuarioRepo.save(usuario);
    }

    // 2. Buscar ou criar Aluno
    const alunoRepo = AppDataSource.getRepository(Aluno);
    let aluno = await alunoRepo.findOne({ where: { usuario: { id: usuario.id } }, relations: ['usuario'] });
    if (!aluno) {
      aluno = alunoRepo.create({ usuario });
      await alunoRepo.save(aluno);
    }

    // 3. Criar Reserva
    const reservaRepo = AppDataSource.getRepository(Reserva);
    const reserva = reservaRepo.create({
      aula,
      aluno,
      status: 'ativa',
      data_reserva: new Date(),
      telefone,
    });
    await reservaRepo.save(reserva);

    // 4. Atualizar vagas ocupadas
    aula.vagas_ocupadas += 1;
    await this.typeormAulaRepository['repository'].save(aula);
    console.log('[reservarAula] Reserva persistida para aula:', aula.id, 'Aluno:', aluno.id, 'Reserva:', reserva.id);
    return true;
  }
}
