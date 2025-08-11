import { Request, Response } from 'express';
import { AppDataSource } from '../../infrastructure/database/dataSource';
import { Usuario } from '../entities/Usuario'; // Certifique-se que está correto

export const listarUsuarios = async (req: Request, res: Response) => {
  res.json([]);
};
export const buscarUsuario = async (req: Request, res: Response) => {
  res.json({});
};
export const atualizarUsuario = async (req: Request, res: Response) => {
  res.json({ message: 'Usuário atualizado!' });
};
export const removerUsuario = async (req: Request, res: Response) => {
  res.json({ message: 'Usuário removido!' });
};

export const criarUsuario = async (req: Request, res: Response) => {
  const { uid, nome, email, senha, tipo } = req.body;
  if (!uid || !nome || !email || !senha || !tipo) {
    return res.status(400).json({ error: 'Dados obrigatórios faltando.' });
  }
  const repo = AppDataSource.getRepository(Usuario);
  const existe = await repo.findOne({ where: { email } });
  if (existe) return res.status(409).json({ error: 'Email já cadastrado.' });
  const usuario = repo.create({ uid, nome, email, senha, tipo });
  await repo.save(usuario);
  res.status(201).json(usuario);
};