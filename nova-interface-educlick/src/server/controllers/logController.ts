// src/server/controllers/logController.ts
import { Request, Response } from 'express';
export const criarLog = async (req: Request, res: Response) => {
  res.json({ message: 'Log criado!' });
};
export const listarLogs = async (req: Request, res: Response) => {
  res.json([]);
};
export const buscarLog = async (req: Request, res: Response) => {
  res.json({});
};
