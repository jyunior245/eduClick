import { Router } from 'express';
import { AulaController } from '../controllers/AulaController';

const router = Router();

const asyncHandler = (fn: any) => (req: any, res: any, next: any) => Promise.resolve(fn(req, res, next)).catch(next);

// Rotas básicas
router.post('/criar', asyncHandler(AulaController.criar));
router.get('/minhas-aulas', asyncHandler(AulaController.listarDoProfessor));

// Rotas com parâmetros - mais simples
router.get('/disponiveis/:professorId', asyncHandler(AulaController.listarDisponiveisPorProfessor));
router.post('/reservar/:aulaId', asyncHandler(AulaController.reservar));
router.delete('/cancelar/:aulaId', asyncHandler(AulaController.cancelar));

// Novas rotas para funcionalidades avançadas
router.get('/:aulaId', asyncHandler(AulaController.buscarPorId));
router.put('/:aulaId', asyncHandler(AulaController.atualizar));
router.delete('/:aulaId', asyncHandler(AulaController.excluir));
router.post('/:aulaId/cancelar-reserva', asyncHandler(AulaController.cancelarReserva));
router.put('/agendamentos/:id/status', asyncHandler(AulaController.atualizarStatusAgendamento));

export default router; 