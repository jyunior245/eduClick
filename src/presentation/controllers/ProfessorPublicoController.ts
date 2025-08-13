import { Request, Response } from 'express';
import { aulaRepository } from '../../infrastructure/repositories/singletons';
import { TypeORMProfessorRepository } from '../../infrastructure/repositories/TypeORMProfessorRepository';
import { AppDataSource } from '../../infrastructure/database/dataSource';
// Inicializa o DataSource se ainda não estiver inicializado
if (!AppDataSource.isInitialized) {
  AppDataSource.initialize().catch(err => {
    console.error('Erro ao inicializar o DataSource:', err);
  });
}
import { ProfessorService } from '../../domain/services/ProfessorService';
import { AulaService } from '../../domain/services/AulaService';
import { Professor as ProfessorEntity } from '../../server/entities/Professor';
import { Aula as AulaEntity } from '../../server/entities/Aula';
import { Reserva as ReservaEntity } from '../../server/entities/Reserva';

const typeormProfessorRepository = new TypeORMProfessorRepository(AppDataSource);
const professorService = new ProfessorService(typeormProfessorRepository);
const aulaService = new AulaService(aulaRepository);

export class ProfessorPublicoController {
  static async perfilPublico(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const professores = await professorService.listarTodos();
      const professor = professores.find(p => p.linkUnico === id);
      
      if (!professor) {
        return res.status(404).json({ error: "Professor não encontrado" });
      }
      
      // Buscar aulas disponíveis do professor
  const aulas = await aulaService.listarAulasDisponiveisPorProfessor(String(professor.id));
      
      res.json({
        professor: {
          id: professor.id,
          nome: professor.nome,
          especialidade: professor.especialidade,
          bio: professor.bio,
          telefone: professor.telefone,
          formacao: professor.formacao,
          experiencia: professor.experiencia,
          observacoes: professor.observacoes,
          descricao: professor.descricao,
          conteudosDominio: professor.conteudosDominio,
          fotoPerfil: professor.fotoPerfil
        },
        aulas: aulas
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async reservarAula(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { aulaId, alunoNome, alunoTelefone, alunoEmail } = req.body;
      // Validação de e-mail
      if (!alunoEmail || !/^\S+@\S+\.\S+$/.test(alunoEmail)) {
        return res.status(400).json({ error: 'E-mail do aluno é obrigatório e deve ser válido.' });
      }
      
      // Verificar se o professor existe
      const professores = await professorService.listarTodos();
      const professor = professores.find(p => p.linkUnico === id);
      console.log('[reservarAula] id param:', id);
      console.log('[reservarAula] professor encontrado:', professor);
      if (professor) {
        console.log('[reservarAula] professor.id:', professor.id, 'typeof:', typeof professor.id);
        console.log('[reservarAula] professor.linkUnico:', professor.linkUnico, 'typeof:', typeof professor.linkUnico);
      }
      
      if (!professor) {
        throw new Error(`[reservarAula] Professor não encontrado. id param: ${id}, professores: ${JSON.stringify(professores)}`);
      }
      
      // Verificar se a aula pertence ao professor
      const aula = await aulaService.buscarAulaPorId(aulaId);
      console.log('[reservarAula] aulaId:', aulaId);
      console.log('[reservarAula] aula encontrada:', aula);
      if (aula) {
        console.log('[reservarAula] aula.professorId:', aula.professorId, 'typeof:', typeof aula.professorId);
        console.log('[reservarAula] aula.professorId === professor.id:', aula && professor ? String(aula.professorId) === String(professor.id) : 'n/a');
      }
      if (!aula) {
        throw new Error(`[reservarAula] Aula não encontrada. aulaId: ${aulaId}`);
      }
      if (String(aula.professorId).trim() !== String(professor.id).trim()) {
        throw new Error(`[reservarAula] Divergência de IDs. aula.professorId: ${aula.professorId} (${typeof aula.professorId}), professor.id: ${professor.id} (${typeof professor.id})`);
      }
      
      // Tentar reservar a aula
      const reservada = await aulaService.reservarAula(aulaId, alunoNome, alunoTelefone, alunoEmail);
      
      if (reservada) {
        res.json({ 
          message: "Aula reservada com sucesso",
          aula: {
            id: aula.id,
            titulo: aula.titulo,
            dataHora: aula.dataHora,
            valor: aula.valorFormatado,
            duracao: aula.duracaoFormatada
          }
        });
      } else {
        res.status(400).json({ error: "Não foi possível reservar a aula" });
      }
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async listarAgendamentosAluno(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { nome, telefone, email } = req.query;
      
      console.log('[listarAgendamentosAluno] Parâmetros recebidos:', { id, nome, telefone, email });
      
      // Validação dos parâmetros obrigatórios
      if (!nome || !telefone || !email) {
        return res.status(400).json({ 
          error: "Parâmetros obrigatórios: nome, telefone e email são necessários" 
        });
      }
      
      // 1) Buscar professor via TypeORM por linkUnico ou id
      const professorRepo = AppDataSource.getRepository(ProfessorEntity);
      const professor = await professorRepo.findOne({ where: [
        { linkUnico: String(id) },
        { id: Number(String(id)) || 0 }
      ]});
      console.log('[listarAgendamentosAluno][DB] Professor:', professor ? { id: professor.id, nome: professor.nome } : 'não encontrado');
      if (!professor) {
        return res.status(404).json({ error: 'Professor não encontrado' });
      }

      // 2) Consultar reservas ativas do aluno para aulas desse professor
      const reservaRepo = AppDataSource.getRepository(ReservaEntity);
      const nomeLc = String(nome).trim().toLowerCase();
      const emailLc = String(email).trim().toLowerCase();
      const telDigits = String(telefone).replace(/\D/g, '');

      const reservas = await reservaRepo.createQueryBuilder('r')
        .innerJoinAndSelect('r.aula', 'a')
        .innerJoin('a.professor', 'p')
        .where('p.id = :pid', { pid: professor.id })
        .andWhere('LOWER(r.nome) = :nomeLc', { nomeLc })
        .andWhere("LOWER(r.email) = :emailLc", { emailLc })
        // normaliza telefone: remove não-dígitos dos dois lados
        .andWhere("regexp_replace(r.telefone, '\\D', '', 'g') = :telDigits", { telDigits })
        .andWhere("LOWER(r.status) = 'ativa'")
        .getMany();

      // 3) Mapear resultado no mesmo formato esperado pelo front
      const agendamentos = reservas.map((r: any) => {
        const a: AulaEntity = (r as any).aula;
        return {
          id: a.id,
          titulo: a.titulo,
          conteudo: a.conteudo,
          dataHora: (a as any).data_hora,
          status: r.status || (a as any).status,
          statusAula: (a as any).status,
          professorNome: professor.nome,
          professorEmail: '', // não há email em ProfessorEntity
          professorTelefone: professor.telefone,
          nome: r.nome,
          telefone: r.telefone,
          email: r.email,
        };
      });

      // 4) Fallback de compatibilidade: se nada no banco, tenta ainda o serviço em memória (ambiente de dev)
      if (agendamentos.length === 0) {
        console.log('[listarAgendamentosAluno] Fallback para serviço em memória');
        const aulasMem = await aulaService.listarAulasPorProfessor(String(professor.id));
        const normalizePhone = (t: string) => t.replace(/\D/g, '');
        const fallback = aulasMem.flatMap((aula: any) =>
          (aula.reservas || []).filter((reserva: any) =>
            reserva &&
            String(reserva.nome).trim().toLowerCase() === nomeLc &&
            String(reserva.email).trim().toLowerCase() === emailLc &&
            normalizePhone(String(reserva.telefone)) === telDigits
          ).map((reserva: any) => ({
            id: aula.id,
            titulo: aula.titulo,
            conteudo: aula.conteudo,
            dataHora: aula.dataHora,
            status: reserva.status || aula.status,
            statusAula: aula.status,
            professorNome: professor.nome,
            professorEmail: '',
            professorTelefone: professor.telefone,
            nome: reserva.nome,
            telefone: reserva.telefone,
            email: reserva.email,
          }))
        );
        console.log('[listarAgendamentosAluno] Fallback retornou', fallback.length, 'registros');
        return res.json(fallback);
      }

      console.log('[listarAgendamentosAluno][DB] Retornando', agendamentos.length, 'agendamentos');
      return res.json(agendamentos);
    } catch (err: any) {
      console.error('[listarAgendamentosAluno] Erro:', err);
      res.status(500).json({ error: `Erro interno do servidor: ${err.message}` });
    }
  }
}