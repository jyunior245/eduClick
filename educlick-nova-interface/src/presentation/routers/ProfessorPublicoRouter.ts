import { Router } from 'express';
import { ProfessorPublicoController } from '../controllers/ProfessorPublicoController';

const router = Router();

const asyncHandler = (fn: any) => (req: any, res: any, next: any) => Promise.resolve(fn(req, res, next)).catch(next);

// Rotas públicas para alunos acessarem
router.get('/:id', asyncHandler(ProfessorPublicoController.perfilPublico));
router.post('/:id/reservar', asyncHandler(ProfessorPublicoController.reservarAula));
router.get('/:id/agendamentos/aluno', asyncHandler(ProfessorPublicoController.listarAgendamentosAluno));

export default router; 