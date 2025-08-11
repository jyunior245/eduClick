import { Router } from 'express';
import {
  criarUsuario,
  listarUsuarios,
  buscarUsuario,
  atualizarUsuario,
  removerUsuario
} from '../controllers/usuarioController';

const router = Router();

const asyncHandler = (fn: any) => (req: any, res: any, next: any) => Promise.resolve(fn(req, res, next)).catch(next);

router.post('/', asyncHandler(criarUsuario));
router.get('/', asyncHandler(listarUsuarios));
router.get('/:id', asyncHandler(buscarUsuario));
router.put('/:id', asyncHandler(atualizarUsuario));
router.delete('/:id', asyncHandler(removerUsuario));

export default router;