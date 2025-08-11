// src/server/routes/aulaRoutes.ts
import { Router } from 'express';
import {
  criarAula,
  listarAulas,
  buscarAula,
  atualizarAula,
  removerAula,
  listarMinhasAulas,
  cancelarReserva,
  reagendarAulaServidor
} from '../controllers/aulaController';

const router = Router();

// handler simples para async functions
const asyncHandler = (fn: any) => (req: any, res: any, next: any) => Promise.resolve(fn(req, res, next)).catch(next);

// IMPORTANT: rotas estáticas devem vir ANTES das rotas com parâmetro '/:id'
// Colocamos '/minhas-aulas' antes de '/:id' para evitar captura indevida do parâmetro
router.post('/', asyncHandler(criarAula));
router.post('/criar', asyncHandler(criarAula));

// rota fixa - deve vir antes de '/:id'
router.get('/minhas-aulas', asyncHandler(listarMinhasAulas));

// listagem geral
router.get('/', asyncHandler(listarAulas));

// Cancelamento de reserva (deve vir antes das rotas genéricas com /:id)
router.post('/:id/cancelar-reserva', asyncHandler(cancelarReserva));

// Reagendar aula (marcar status e opcionalmente atualizar data/hora)
router.put('/:id/reagendar', asyncHandler(reagendarAulaServidor));

// rota com parâmetro (por último entre rotas com prefixo semelhante)
router.get('/:id', asyncHandler(buscarAula));
router.put('/:id', asyncHandler(atualizarAula));
router.delete('/:id', asyncHandler(removerAula));

export default router;
