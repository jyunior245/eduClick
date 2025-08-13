import { Router } from 'express';
import {
  criarReserva,
  listarReservas,
  buscarReserva,
  cancelarReserva,
  removerReserva
} from '../controllers/reservaController';

const router = Router();

// handler simples para async functions
const asyncHandler = (fn: any) => (req: any, res: any, next: any) => Promise.resolve(fn(req, res, next)).catch(next);

router.post('/', asyncHandler(criarReserva));
router.get('/', asyncHandler(listarReservas));
router.get('/:id', asyncHandler(buscarReserva));
router.put('/:id', asyncHandler(cancelarReserva));
router.delete('/:id', asyncHandler(removerReserva));

export default router;