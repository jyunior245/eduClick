// Controller básico para Horário Indisponível
import { Request, Response } from 'express';

export const listarHorariosIndisponiveis = (req: Request, res: Response) => {
  res.status(200).json({ message: 'Listagem de horários indisponíveis.' });
};
