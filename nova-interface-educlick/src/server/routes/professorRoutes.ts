/// <reference types="express-session" />

import { Router, Request, Response } from 'express';
import {
  criarProfessor,
  listarProfessores,
  buscarProfessor,
  atualizarProfessor,
  removerProfessor,
  listarAulasDoProfessor
} from '../controllers/professorController';
import { AppDataSource } from '../../infrastructure/database/dataSource';
import { Professor } from '../entities/Professor';

const router = Router();
const asyncHandler = (fn: any) => (req: any, res: any, next: any) => Promise.resolve(fn(req, res, next)).catch(next);

// CRUD básico
router.post('/', asyncHandler(criarProfessor));
router.get('/', asyncHandler(listarProfessores));

// rotas fixas relacionadas ao "me" e sub-rotas devem VIR ANTES de '/:id'
router.get('/me', asyncHandler(async (req: Request, res: Response) => {
  console.log('[/api/professores/me] Sessão:', JSON.stringify(req.session));
  const professorIdRaw = req.session?.professorId;
  console.log('[/api/professores/me] professorIdRaw:', professorIdRaw);

  if (!professorIdRaw) {
    return res.status(401).json({ error: 'Professor não autenticado. Sessão inválida.' });
  }

  // aceitar string ou number vindo da sessão
  const professorId = typeof professorIdRaw === 'string' ? parseInt(professorIdRaw, 10) : Number(professorIdRaw);
  if (Number.isNaN(professorId) || !Number.isInteger(professorId) || professorId <= 0) {
    return res.status(400).json({ error: `ID do professor inválido na sessão: ${String(professorIdRaw)}` });
  }

  const professor = await AppDataSource.getRepository(Professor).findOne({ where: { id: professorId } });
  if (!professor) return res.status(404).json({ error: 'Professor não encontrado.' });
  res.json(professor);
}));

// rota para listar aulas de um professor por link ou id — colocar antes de '/:id'
router.get('/:id/aulas', asyncHandler(listarAulasDoProfessor));

// agora as rotas paramétricas (':id')
router.get('/:id', asyncHandler(buscarProfessor));
router.put('/:id', asyncHandler(atualizarProfessor));
router.delete('/:id', asyncHandler(removerProfessor));

export default router;
