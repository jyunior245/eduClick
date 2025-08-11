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
import { Aula } from '../entities/Aula';

export const cancelarReserva = async (req: Request, res: Response) => {
  try {
    const reservaId = parseInt(req.params.id, 10);
    if (isNaN(reservaId)) return res.status(400).json({ error: 'ID inválido.' });
    const reservaRepo = AppDataSource.getRepository(Reserva);
    const reserva = await reservaRepo.findOne({ where: { id: reservaId }, relations: ['aula'] });
    if (!reserva) return res.status(404).json({ error: 'Reserva não encontrada.' });
    if (reserva.status === 'cancelada') return res.json({ message: 'Reserva já estava cancelada.' });
    reserva.status = 'cancelada';
    reserva.data_cancelamento = new Date();
    await reservaRepo.save(reserva);
    // Liberar vaga na aula
    if (reserva.aula && reserva.aula.vagas_ocupadas > 0) {
      const aulaRepo = AppDataSource.getRepository(Aula);
      reserva.aula.vagas_ocupadas -= 1;
      await aulaRepo.save(reserva.aula);
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
