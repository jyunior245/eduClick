// src/server/controllers/professorPublicoController.ts
import { Request, Response } from 'express';
import { TypeORMAulaRepository } from '../../infrastructure/repositories/TypeORMAulaRepository';
import { TypeORMAulaService } from '../../infrastructure/repositories/TypeORMAulaService';
import { TypeORMProfessorRepository } from '../../infrastructure/repositories/TypeORMProfessorRepository';
import { AppDataSource } from '../../infrastructure/database/dataSource';
import { ProfessorService } from '../../domain/services/ProfessorService';
import { AulaService } from '../../domain/services/AulaService';
import { NotificationService } from '../services/notificationService';
import { Professor } from '../entities/Professor';
import { Reserva } from '../entities/Reserva';
import { Aula } from '../entities/Aula';

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

      // Buscar professor por linkUnico OU por id numérico
      const profRepo = AppDataSource.getRepository(Professor);
      const professor = await profRepo.findOne({ where: [
        { linkUnico: String(linkUnico).trim() },
        { id: Number(String(linkUnico)) || 0 }
      ] });
      if (!professor) return res.status(404).json({ error: 'Professor não encontrado' });

      // Buscar aulas disponíveis do professor (normalizando id)
      const aulas = await aulaService!.listarAulasDisponiveisPorProfessor(String(professor.id));

      // Adaptar retorno das aulas para o frontend
      const aulasFormatadas = aulas.map(aula => {
        const vagas_total = typeof aula.vagas_total === 'number' ? aula.vagas_total : Number(aula.vagas_total) || 0;
        const vagas_ocupadas_raw = typeof aula.vagas_ocupadas === 'number' ? aula.vagas_ocupadas : Number(aula.vagas_ocupadas) || 0;
        // Se vierem reservas carregadas, recalcular pelas ATIVAS para evitar usar dado stale
        const reservas: any[] = (aula as any)?.reservas || [];
        const ocupadasPorAtivas = reservas.filter(r => String((r as any)?.status || '').toLowerCase() === 'ativa').length;
        const vagas_ocupadas = reservas.length > 0 ? ocupadasPorAtivas : vagas_ocupadas_raw;
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
      // Garantir email do professor: recarregar com relação usuario
      let professorComUsuario: Professor | null = null;
      try {
        const profRepo2 = AppDataSource.getRepository(Professor);
        professorComUsuario = await profRepo2.findOne({ where: { id: professor.id }, relations: ['usuario'] });
      } catch {}

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
        (professorPublico as any).email = (professorComUsuario as any)?.usuario?.email || (professor as any).usuario?.email || (professor as any).email || '';
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
      const aulaIdFromBody = (req.body || {}).aulaId;
      const aulaIdFromQuery = (req.query || {}).aulaId as any;
      const aulaId = String(aulaIdFromBody ?? aulaIdFromQuery ?? '').trim();
      const { alunoNome, alunoTelefone, alunoEmail, alunoFcmToken } = req.body || {};
      const fail400 = (msg: string) => {
        console.warn('[reservarAula][400]', msg, { linkUnico, aulaId, alunoNome, alunoTelefone, alunoEmail });
        return res.status(400).json({ error: msg });
      };
      console.log('[reservarAula] endpoint hit', { linkUnico, aulaId, alunoNome, alunoTelefone, alunoEmail, hasFcm: Boolean(alunoFcmToken) });

      if (!linkUnico) return fail400('Parâmetro linkUnico obrigatório.');

      // validações básicas do payload
      if (!aulaId) return fail400('aulaId obrigatório.');
      if (!alunoNome || typeof alunoNome !== 'string' || alunoNome.trim() === '') return fail400('Nome do aluno obrigatório.');
      if (!alunoTelefone || typeof alunoTelefone !== 'string' || alunoTelefone.trim() === '') return fail400('Telefone do aluno obrigatório.');
      if (!alunoEmail || !/^\S+@\S+\.\S+$/.test(alunoEmail)) return fail400('E-mail do aluno é obrigatório e deve ser válido.');

      // Encontrar o professor por linkUnico OU por id numérico
      const profRepo = AppDataSource.getRepository(Professor);
      const professor = await profRepo.findOne({ where: [
        { linkUnico: String(linkUnico).trim() },
        { id: Number(String(linkUnico)) || 0 }
      ] });
      if (!professor) {
        console.warn('[reservarAula][404] Professor não encontrado', { linkUnico });
        return res.status(404).json({ error: 'Professor não encontrado.' });
      }
      console.log('[reservarAula] professor encontrado', { professorId: professor.id });

      // Buscar aula por id (normalizando)
      const aula = await aulaService!.buscarAulaPorId(String(aulaId));
      if (!aula) {
        console.warn('[reservarAula][404] Aula não encontrada', { aulaId });
        return res.status(404).json({ error: 'Aula não encontrada.' });
      }
      console.log('[reservarAula] aula encontrada', { aulaId: aula.id, aulaProfessorId: (aula as any)?.professor?.id });

      // Conferir se a aula pertence ao professor
      if (!aula.professor || aula.professor.id !== professor.id) {
        return fail400('Aula não pertence a este professor.');
      }

      // Tentar reservar a aula via serviço (com pré-ajuste de status, se necessário)
      try {
        const { Aula, StatusAula } = require('../entities/Aula');
        const aulaRepo = AppDataSource.getRepository(Aula);
        const aulaForAdjust = await aulaRepo.findOne({ where: { id: Number(aulaId) }, relations: ['reservas', 'professor'] });
        if (aulaForAdjust && aulaForAdjust.professor && aulaForAdjust.professor.id === professor.id) {
          const reservasAtivas = (aulaForAdjust.reservas || []).filter((r: any) => String(r?.status || '').toLowerCase() === 'ativa');
          const ocupadas = reservasAtivas.length;
          const statusStr = String(aulaForAdjust.status || '').toLowerCase();
          if (ocupadas < aulaForAdjust.vagas_total && !['disponivel','reagendada'].includes(statusStr)) {
            console.warn('[reservarAula][pre-ajuste] Ajustando status para disponivel. Aula:', aulaForAdjust.id, 'statusAtual:', aulaForAdjust.status, 'ocupadas/total:', ocupadas, '/', aulaForAdjust.vagas_total);
            aulaForAdjust.status = StatusAula.DISPONIVEL;
            await aulaRepo.save(aulaForAdjust);
          }
        }
      } catch (e) {
        console.warn('[reservarAula] Falha no pré-ajuste de status:', e);
      }

      // Tentar reservar a aula via serviço
      const reservada = await aulaService!.reservarAula(String(aulaId), alunoNome, alunoTelefone, alunoEmail, alunoFcmToken);
      console.log('[reservarAula] resultado da reserva', { reservada });

      if (reservada) {
        console.log('[reservarAula] reserva efetuada com sucesso');
        // Notificações:
        try {
          // Notificar professor: garantir que a relação usuario esteja carregada
          console.log('[reservarAula] carregando Professor.usuario para notificação', { professorId: professor.id });
          const profRepo = AppDataSource.getRepository(Professor);
          const professorComUsuario = await profRepo.findOne({ where: { id: professor.id }, relations: ['usuario'] });
          const profUid = (professorComUsuario as any)?.usuario?.uid;
          if (!profUid) {
            console.warn('[reservarAula] Professor sem usuario.uid carregado. professorId:', professor.id);
          }
          if (profUid) {
            console.log('[reservarAula] enviando notificação ao professor', { profUid, aulaId: aula.id });
            await NotificationService.sendToUsuarioUid(
              profUid,
              'Nova reserva',
              `${alunoNome} reservou "${aula.titulo}" em ${aula.data_hora}`,
              { type: 'AULAS_UPDATED', aulaId: String(aula.id) }
            );
            console.log('[reservarAula] notificação enviada (chamada realizada)');
          }

          // Notificar aluno (dispositivo) caso tenha fornecido token no fluxo público
          try {
            if (alunoFcmToken && typeof alunoFcmToken === 'string' && alunoFcmToken.trim()) {
              await NotificationService.sendToFcmToken(
                alunoFcmToken,
                'Reserva confirmada',
                `Sua reserva em "${aula.titulo}" foi confirmada para ${aula.data_hora}`,
                { type: 'RESERVA_CONFIRMADA', aulaId: String(aula.id) }
              );
              console.log('[reservarAula] notificação enviada ao aluno via fcmToken do dispositivo');
            } else {
              console.log('[reservarAula] alunoFcmToken ausente; aluno não receberá push imediato');
            }
          } catch (e) {
            console.warn('[reservarAula] falha ao notificar aluno por token do dispositivo:', e);
          }
        } catch (e) {
          console.error('[reservarAula] erro ao notificar professor:', e);
        }
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
        console.warn('[reservarAula] reserva não efetuada pelo serviço; diagnosticando motivo...');
        try {
          // Recarrega aula com reservas para diagnósticos
          const aulaRepo = AppDataSource.getRepository(require('../entities/Aula').Aula);
          const aulaDiag = await aulaRepo.findOne({ where: { id: Number(aulaId) }, relations: ['professor', 'reservas'] });
          if (!aulaDiag) {
            return fail400('Aula indisponível ou não encontrada.');
          }
          // Verifica se pertence ao professor
          if (!aulaDiag.professor || aulaDiag.professor.id !== professor.id) {
            return fail400('Aula não pertence a este professor.');
          }
          // Verifica status e vagas ativas
          const reservasAtivas = (aulaDiag.reservas || []).filter((r: any) => String(r?.status || '').toLowerCase() === 'ativa');
          const ocupadas = reservasAtivas.length;
          const total = aulaDiag.vagas_total;
          const statusStr = String(aulaDiag.status || '').toLowerCase();
          if (!['disponivel', 'reagendada'].includes(statusStr)) {
            return fail400(`Aula não está reservável (status atual: ${aulaDiag.status}).`);
          }
          if (ocupadas >= total) {
            return fail400('Aula lotada no momento.');
          }
        } catch (e) {
          console.warn('[reservarAula] diagnóstico falhou:', e);
        }
        return fail400('Não foi possível reservar a aula.');
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

      // Buscar professor por linkUnico OU por id numérico
      const profRepo = AppDataSource.getRepository(Professor);
      const professor = await profRepo.findOne({ where: [
        { linkUnico: String(linkUnico).trim() },
        { id: Number(String(linkUnico)) || 0 }
      ] });
      if (!professor) return res.status(404).json({ error: 'Professor não encontrado' });

      // Consultar reservas no banco cruzando com Aula->Professor
      const reservaRepo = AppDataSource.getRepository(Reserva);
      const nomeLc = String(nome).trim().toLowerCase();
      const emailLc = String(email).trim().toLowerCase();
      const telDigits = String(telefone).replace(/\D/g, '');

      const reservas = await reservaRepo.createQueryBuilder('r')
        .innerJoinAndSelect('r.aula', 'a')
        .innerJoin('a.professor', 'p')
        .where('p.id = :pid', { pid: professor.id })
        .andWhere('LOWER(r.nome) = :nomeLc', { nomeLc })
        .andWhere('LOWER(r.email) = :emailLc', { emailLc })
        .andWhere("regexp_replace(r.telefone, '\\D', '', 'g') = :telDigits", { telDigits })
        .andWhere("LOWER(r.status) = 'ativa'")
        .getMany();

      const agendamentos = reservas.map((r: any) => {
        const a: Aula = (r as any).aula;
        return {
          id: a.id,
          reservaId: r.id,
          titulo: a.titulo,
          conteudo: a.conteudo,
          dataHora: (a as any).data_hora || '',
          status: r.status || (a as any).status,
          statusAula: (a as any).status,
          professorNome: (professor as any).nome,
          professorEmail: '',
          professorTelefone: (professor as any).telefone,
          nome: r.nome,
          telefone: r.telefone,
          email: r.email,
        };
      });

      return res.json(agendamentos);
    } catch (err: any) {
      console.error('[listarAgendamentosAluno] Erro:', err);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }
}
