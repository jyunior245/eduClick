// src/server/controllers/alunoController.ts
import { Request, Response } from 'express';
export const criarAluno = async (req: Request, res: Response) => {
  res.json({ message: 'Aluno criado!' });
};
export const listarAlunos = async (req: Request, res: Response) => {
  res.json([]);
};
export const buscarAluno = async (req: Request, res: Response) => {
  res.json({});
};
export const atualizarAluno = async (req: Request, res: Response) => {
  res.json({ message: 'Aluno atualizado!' });
};
export const removerAluno = async (req: Request, res: Response) => {
  res.json({ message: 'Aluno removido!' });
};
export const listarReservasDoAluno = async (req: Request, res: Response) => {
  res.json([]);
};
