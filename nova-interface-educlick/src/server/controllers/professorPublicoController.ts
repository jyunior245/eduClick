// src/server/controllers/professorPublicoController.ts
import { Request, Response } from 'express';
import { TypeORMAulaRepository } from '../../infrastructure/repositories/TypeORMAulaRepository';
import { TypeORMAulaService } from '../../infrastructure/repositories/TypeORMAulaService';
import { TypeORMProfessorRepository } from '../../infrastructure/repositories/TypeORMProfessorRepository';
import { AppDataSource } from '../../infrastructure/database/dataSource';
import { ProfessorService } from '../../domain/services/ProfessorService';
import { AulaService } from '../../domain/services/AulaService';

// NÃO inicializar o DataSource aqui em chamadas repetidas.

let professorService: ProfessorService | undefined;
let aulaService: TypeORMAulaService | undefined;
let typeormAulaRepository: TypeORMAulaRepository | undefined;

function ensureDataSourceInitialized(res: Response): boolean {
  if (!AppDataSource.isInitialized) {
    console.error('[professorPublicoController] AppDataSource NÃO está inicializado.');
    res.status(500).json({ error: 'Banco de dados não inicializado.' });
    return false;
  }
  if (!professorService) {
    const typeormProfessorRepository = new TypeORMProfessorRepository(AppDataSource);
    professorService = new ProfessorService(typeormProfessorRepository);
  }
  if (!aulaService) {
    if (!typeormAulaRepository) {
      typeormAulaRepository = new TypeORMAulaRepository(AppDataSource);
    }
    aulaService = new TypeORMAulaService(typeormAulaRepository);
  }
  return true;
}

export class ProfessorPublicoController {
  static async perfilPublico(req: Request, res: Response) {
    if (!ensureDataSourceInitialized(res)) return;
    try {
      const { linkUnico } = req.params;
      if (!linkUnico) return res.status(400).json({ error: 'Parâmetro linkUnico obrigatório.' });

      // buscar professor por linkUnico (método no service)
      const professor = await professorService!.buscarPorLinkUnico(String(linkUnico).trim());
      if (!professor) return res.status(404).json({ error: 'Professor não encontrado' });

      // Buscar aulas disponíveis do professor (normalizando id)
      const aulas = await aulaService!.listarAulasDisponiveisPorProfessor(String(professor.id));

      // Adaptar retorno das aulas para o frontend
      const aulasFormatadas = aulas.map(aula => {
        const vagas_total = typeof aula.vagas_total === 'number' ? aula.vagas_total : Number(aula.vagas_total) || 0;
        const vagas_ocupadas = typeof aula.vagas_ocupadas === 'number' ? aula.vagas_ocupadas : Number(aula.vagas_ocupadas) || 0;
        return {
          id: aula.id,
          titulo: aula.titulo,
          conteudo: aula.conteudo,
          dataHora: aula.data_hora || '',
          valor: typeof aula.valor === 'number' ? aula.valor : Number(aula.valor) || 0,
          duracao: typeof aula.duracao === 'number' ? aula.duracao : Number(aula.duracao) || 0,
          vagas_total,
          vagas_ocupadas,
          vagas_restantes: Math.max(0, vagas_total - vagas_ocupadas),
          status: aula.status,
        };
      });
      // Monta objeto de professor com campos públicos esperados pelo frontend
      const professorPublico: any = {
        id: professor.id,
        nome: professor.nome,
        descricao: (professor as any).descricao,
        linkUnico: (professor as any).linkUnico,
        telefone: (professor as any).telefone,
        especialidade: (professor as any).especialidade,
        formacao: (professor as any).formacao,
        experiencia: (professor as any).experiencia,
      };
      // Email costuma estar vinculado ao usuário relacionado
      try {
        (professorPublico as any).email = (professor as any).usuario?.email || (professor as any).email || '';
      } catch {
        (professorPublico as any).email = '';
      }

      return res.json({
        professor: professorPublico,
        aulas: aulasFormatadas,
      });
    } catch (err: any) {
      console.error('[perfilPublico] Erro:', err);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  static async reservarAula(req: Request, res: Response) {
    if (!ensureDataSourceInitialized(res)) return;
    try {
      const { linkUnico } = req.params;
      const { aulaId, alunoNome, alunoTelefone, alunoEmail } = req.body;

      if (!linkUnico) return res.status(400).json({ error: 'Parâmetro linkUnico obrigatório.' });

      // validações básicas do payload
      if (!aulaId) return res.status(400).json({ error: 'aulaId obrigatório.' });
      if (!alunoNome || typeof alunoNome !== 'string' || alunoNome.trim() === '') return res.status(400).json({ error: 'Nome do aluno obrigatório.' });
      if (!alunoTelefone || typeof alunoTelefone !== 'string' || alunoTelefone.trim() === '') return res.status(400).json({ error: 'Telefone do aluno obrigatório.' });
      if (!alunoEmail || !/^\S+@\S+\.\S+$/.test(alunoEmail)) return res.status(400).json({ error: 'E-mail do aluno é obrigatório e deve ser válido.' });

      // Encontrar o professor pelo linkUnico
      const professor = await professorService!.buscarPorLinkUnico(String(linkUnico).trim());
      if (!professor) {
        return res.status(404).json({ error: 'Professor não encontrado.' });
      }

      // Buscar aula por id (normalizando)
      const aula = await aulaService!.buscarAulaPorId(String(aulaId));
      if (!aula) {
        return res.status(404).json({ error: 'Aula não encontrada.' });
      }

      // Conferir se a aula pertence ao professor
      if (!aula.professor || aula.professor.id !== professor.id) {
        return res.status(400).json({ error: 'Aula não pertence a este professor.' });
      }

      // Tentar reservar a aula via serviço
      const reservada = await aulaService!.reservarAula(String(aulaId), alunoNome, alunoTelefone, alunoEmail);

      if (reservada) {
        return res.json({
          message: 'Aula reservada com sucesso',
          aula: {
            id: aula.id,
            titulo: aula.titulo,
            dataHora: aula.data_hora ?? '',
            valor: aula.valor ?? 0,
            duracao: aula.duracao ?? 0
          }
        });
      } else {
        return res.status(400).json({ error: 'Não foi possível reservar a aula' });
      }
    } catch (err: any) {
      console.error('[reservarAula] Erro:', err);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  static async listarAgendamentosAluno(req: Request, res: Response) {
    try {
      const { linkUnico } = req.params;
      const { nome, telefone, email } = req.query;

      if (!linkUnico) return res.status(400).json({ error: 'Parâmetro linkUnico obrigatório.' });
      if (!nome || !telefone || !email) {
        return res.status(400).json({ error: 'Parâmetros obrigatórios: nome, telefone e email são necessários' });
      }

      // Buscar professor pelo linkUnico
      const professor = await professorService!.buscarPorLinkUnico(String(linkUnico).trim());
      if (!professor) return res.status(404).json({ error: 'Professor não encontrado' });

      // Buscar aulas do professor via serviço (normaliza id)
      const aulas = await aulaService!.listarAulasPorProfessor(String(professor.id));

      // Filtrar reservas do aluno (normalizando valores)
      const normalizePhone = (t: string) => String(t || '').replace(/\D/g, '');
      const nomeNorm = String(nome).trim().toLowerCase();
      const telefoneNorm = normalizePhone(String(telefone));
      const emailNorm = String(email).trim().toLowerCase();

      const agendamentos = aulas.flatMap((aula: any) => {
        return (aula.reservas || []).filter((reserva: any) => {
          // Always extract from reserva.aluno.usuario if available
          let reservaNome = '';
          let reservaEmail = '';
          let reservaTelefone = reserva.telefone || '';
          if (reserva.aluno && reserva.aluno.usuario) {
            reservaNome = reserva.aluno.usuario.nome || '';
            reservaEmail = reserva.aluno.usuario.email || '';
          }
          // Fallbacks if not present
          if (!reservaNome && reserva.nome) reservaNome = reserva.nome;
          if (!reservaEmail && reserva.email) reservaEmail = reserva.email;

          const matchTelefone = telefoneNorm ? normalizePhone(reservaTelefone) === telefoneNorm : true;
          const matchNome = nomeNorm ? String(reservaNome).trim().toLowerCase() === nomeNorm : true;
          const matchEmail = emailNorm ? String(reservaEmail).trim().toLowerCase() === emailNorm : true;
          const notCanceled = String(reserva.status || '').toLowerCase() !== 'cancelada';
          return matchTelefone && matchNome && matchEmail && notCanceled;
        }).map((reserva: any) => {
          // Preencher nome/email/telefone corretamente
          let nome = '';
          let email = '';
          let telefone = reserva.telefone || '';
          if (reserva.aluno && reserva.aluno.usuario) {
            nome = reserva.aluno.usuario.nome || '';
            email = reserva.aluno.usuario.email || '';
          } else {
            nome = reserva.nome || '';
            email = reserva.email || '';
          }
          return {
            id: aula.id,
            reservaId: reserva.id,
            titulo: aula.titulo,
            conteudo: aula.conteudo,
            dataHora: aula.data_hora || '',
            status: reserva.status || aula.status,
            statusAula: aula.status,
            professorNome: professor.nome,
            professorEmail: '', // não expor
            professorTelefone: professor.telefone,
            nome,
            telefone,
            email
          };
        });
      });

      return res.json(agendamentos);
    } catch (err: any) {
      console.error('[listarAgendamentosAluno] Erro:', err);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }
}
