import { Router } from 'express';
import { AulaController } from '../controllers/AulaController';
import { verificarTokenFirebase } from '../../server/middleware/tokenFirebase';

const router = Router();

const asyncHandler = (fn: any) => (req: any, res: any, next: any) => Promise.resolve(fn(req, res, next)).catch(next);

// Cancelamento de reserva do aluno (deve vir antes das rotas genéricas)
router.post('/:aulaId/cancelar-reserva', asyncHandler(AulaController.cancelarReserva));

// Rotas básicas (protegidas)
router.post('/criar', verificarTokenFirebase, asyncHandler(AulaController.criar));
router.get('/minhas-aulas', verificarTokenFirebase, asyncHandler(AulaController.listarDoProfessor));

// Rotas com parâmetros - mais simples
router.get('/disponiveis/:professorId', asyncHandler(AulaController.listarDisponiveisPorProfessor));
router.post('/reservar/:aulaId', asyncHandler(AulaController.reservar));

// Rotas protegidas
router.delete('/cancelar/:aulaId', verificarTokenFirebase, asyncHandler(AulaController.cancelar));

// Novas rotas para funcionalidades avançadas (protegidas)
router.get('/:aulaId', verificarTokenFirebase, asyncHandler(AulaController.buscarPorId));
router.put('/:aulaId', verificarTokenFirebase, asyncHandler(AulaController.atualizar));
router.delete('/:aulaId', verificarTokenFirebase, asyncHandler(AulaController.excluir));
router.put('/agendamentos/:id/status', asyncHandler(AulaController.atualizarStatusAgendamento));
router.put('/:aulaId/reagendar', verificarTokenFirebase, asyncHandler(AulaController.reagendar));

export default router; 