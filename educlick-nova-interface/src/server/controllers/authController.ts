// src/server/controllers/authController.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../../infrastructure/database/dataSource';
import { Professor } from '../entities/Professor';
import { Usuario } from '../entities/Usuario';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, senha, uid } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha obrigatórios.' });
    }
    const usuarioRepo = AppDataSource.getRepository(Usuario);
    const usuario = await usuarioRepo.findOne({ where: { email, senha } });
    if (!usuario) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos.' });
    }
    let professor = null;
    if (usuario.tipo === 'professor') {
      const professorRepo = AppDataSource.getRepository(Professor);
      professor = await professorRepo.findOne({ where: { uid: usuario.uid } });
      if (!professor) {
        professor = await professorRepo.findOne({ where: { usuario: { id: usuario.id } } });
        if (professor && professor.uid !== usuario.uid) {
          professor.uid = usuario.uid;
          await professorRepo.save(professor);
        }
      }

      if (professor && typeof professor.id === 'number' && professor.id > 0) {
        req.session.professorId = String(professor.id);
        req.session.usuario = usuario;
        await new Promise<void>((resolve) => req.session.save(() => resolve()));
      } else {
        return res.status(404).json({ error: 'Professor não encontrado para este usuário.' });
      }
    } else {
      return res.status(404).json({ error: 'Usuário não é um professor.' });
    }

    return res.status(200).json({ message: 'Login realizado com sucesso.', usuario, professor });
  } catch (err) {
    console.error('[LOGIN] Erro:', err);
    return res.status(500).json({ error: 'Erro interno no login.' });
  }
};

// Novo: login com UID (fluxo Firebase)
export const loginWithUid = async (req: Request, res: Response) => {
  try {
    const { uid } = req.body;
    console.log('[LOGIN_WITH_UID] Body recebido:', req.body);
    if (!uid || typeof uid !== 'string') {
      console.warn('[LOGIN_WITH_UID] UID ausente ou inválido:', uid);
      return res.status(400).json({ error: 'UID é obrigatório.' });
    }

    const usuarioRepo = AppDataSource.getRepository(Usuario);
    const professorRepo = AppDataSource.getRepository(Professor);

    // Tenta achar usuário pelo uid
    const usuario = await usuarioRepo.findOne({ where: { uid } });
    console.log('[LOGIN_WITH_UID] Usuario encontrado:', usuario);
    if (!usuario) {
      console.warn('[LOGIN_WITH_UID] Usuário não encontrado para UID:', uid);
      return res.status(404).json({ error: 'Usuário não encontrado. Sincronize primeiro.' });
    }

    // Tenta achar professor pelo uid ou pelo usuário vinculado
    let professor = await professorRepo.findOne({ where: { uid } });
    console.log('[LOGIN_WITH_UID] Professor encontrado por UID:', professor);
    if (!professor) {
      professor = await professorRepo.findOne({ where: { usuario: { id: usuario.id } } });
      console.log('[LOGIN_WITH_UID] Professor encontrado por usuario.id:', professor);
      // Atualiza uid no professor se necessário
      if (professor && professor.uid !== usuario.uid) {
        professor.uid = usuario.uid;
        await professorRepo.save(professor);
        console.log('[LOGIN_WITH_UID] Professor.uid atualizado:', professor.uid);
      }
    }

    if (!professor) {
      console.warn('[LOGIN_WITH_UID] Professor não encontrado para UID:', uid);
      return res.status(404).json({ error: 'Professor não encontrado para este usuário.' });
    }

    // Seta a sessão
    req.session.professorId = String(professor.id);
    req.session.usuario = usuario;
    await new Promise<void>((resolve) => req.session.save(() => resolve()));
    console.log('[LOGIN_WITH_UID] Sessão criada para professorId:', professor.id);

    return res.json({ message: 'Login via Firebase realizado com sucesso.', professor });
  } catch (err) {
    console.error('[LOGIN_WITH_UID] Erro:', err);
    return res.status(500).json({ error: 'Erro interno ao criar sessão.' });
  }
};

// Sincronizar usuário (transformei em função async simples)
export const sincronizarUsuario = async (req: Request, res: Response) => {
  try {
    const { uid, email, nome } = req.body;
    if (!uid || !email) {
      return res.status(400).json({ error: 'UID e email são obrigatórios' });
    }
    const usuarioRepo = AppDataSource.getRepository(Usuario);
    let usuario = await usuarioRepo.findOne({ where: { uid } });
    if (!usuario) {
      usuario = usuarioRepo.create({ uid, nome: nome || 'Professor', email, senha: '', tipo: 'professor' });
      await usuarioRepo.save(usuario);
    }
    const professorRepo = AppDataSource.getRepository(Professor);
    let professor = await professorRepo.findOne({ where: { uid } });
    if (professor) {
      if (!professor.usuario || professor.usuario.id !== usuario.id) {
        professor.usuario = usuario;
        await professorRepo.save(professor);
      }
      return res.json({ message: 'Professor já existe', professor });
    }
    professor = professorRepo.create({ uid, usuario, nome_personalizado: nome || 'Professor' });
    await professorRepo.save(professor);
    return res.json({ message: 'Professor sincronizado com sucesso', professor });
  } catch (err) {
    console.error('[SINCRONIZAR USUARIO] Erro:', err);
    return res.status(500).json({ error: 'Erro interno ao sincronizar usuário.' });
  }
};
