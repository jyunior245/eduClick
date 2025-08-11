// src/server/controllers/reservaController.ts
import { Request, Response } from 'express';
export const criarReserva = async (req: Request, res: Response) => {
  res.json({ message: 'Reserva criada!' });
};
export const listarReservas = async (req: Request, res: Response) => {
  res.json([]);
};
export const buscarReserva = async (req: Request, res: Response) => {
  res.json({});
};
import { AppDataSource } from '../../infrastructure/database/dataSource';
import { Reserva } from '../entities/Reserva';
import { Aula, StatusAula } from '../entities/Aula';
import { NotificationService } from '../services/notificationService';

export const cancelarReserva = async (req: Request, res: Response) => {
  try {
    const reservaId = parseInt(req.params.id, 10);
    console.log('[reservaController.cancelarReserva] chamada', { reservaId });
    if (isNaN(reservaId)) return res.status(400).json({ error: 'ID inválido.' });
    const reservaRepo = AppDataSource.getRepository(Reserva);
    const reserva = await reservaRepo.findOne({ where: { id: reservaId }, relations: ['aula', 'aula.professor', 'aula.professor.usuario', 'aluno', 'aluno.usuario'] });
    if (!reserva) return res.status(404).json({ error: 'Reserva não encontrada.' });
    if (reserva.status === 'cancelada') return res.json({ message: 'Reserva já estava cancelada.' });
    reserva.status = 'cancelada';
    reserva.data_cancelamento = new Date();
    await reservaRepo.save(reserva);
    // Liberar vaga na aula e ajustar status com base em reservas ativas
    if (reserva.aula) {
      const aulaRepo = AppDataSource.getRepository(Aula);
      // Garantir contagem por reservas ativas para consistência
      const aulaComReservas = await aulaRepo.findOne({ where: { id: reserva.aula.id }, relations: ['reservas'] });
      if (aulaComReservas) {
        const reservasAtivas = (aulaComReservas.reservas || []).filter(r => String((r as any)?.status || '').toLowerCase() === 'ativa');
        aulaComReservas.vagas_ocupadas = reservasAtivas.length;
        if (aulaComReservas.vagas_ocupadas < aulaComReservas.vagas_total && aulaComReservas.status === StatusAula.LOTADA) {
          aulaComReservas.status = StatusAula.DISPONIVEL;
        }
        await aulaRepo.save(aulaComReservas);
      }
    }
    // Notificar professor sobre cancelamento
    try {
      const profUid = (reserva.aula as any)?.professor?.usuario?.uid;
      if (profUid) {
        console.log('[reservaController.cancelarReserva] notificando professor', { profUid, aulaId: reserva.aula?.id });
        await NotificationService.sendToUsuarioUid(
          profUid,
          'Reserva cancelada',
          `${(reserva as any)?.aluno?.usuario?.nome || 'Um aluno'} cancelou a reserva da aula "${reserva.aula?.titulo}"`,
          { aulaId: String(reserva.aula?.id || '') }
        );
      } else {
        console.warn('[reservaController.cancelarReserva] professor sem uid para notificação.');
      }
    } catch (e) {
      console.error('[reservaController.cancelarReserva] erro ao notificar professor:', e);
    }
    res.json({ message: 'Reserva cancelada!' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao cancelar reserva.' });
  }
};
export const removerReserva = async (req: Request, res: Response) => {
  console.log('[DEBUG] Arquivo reservaController.ts em execução:', __filename);
  try {
    const reservaId = parseInt(req.params.id, 10);
    if (isNaN(reservaId)) return res.status(400).json({ error: 'ID inválido.' });
    const reservaRepo = AppDataSource.getRepository(Reserva);
    // Logar todos os IDs de reservas existentes
    const todas = await reservaRepo.find();
    console.log('[removerReserva] IDs de reservas no banco:', todas.map(r => r.id));
    const reserva = await reservaRepo.findOne({ where: { id: reservaId } });
    if (!reserva) {
      console.log(`[removerReserva] Reserva id ${reservaId} não encontrada.`);
      return res.status(404).json({ error: 'Reserva não encontrada.' });
    }
    await reservaRepo.remove(reserva);
    res.json({ message: 'Reserva removida!' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover reserva.' });
  }
};
