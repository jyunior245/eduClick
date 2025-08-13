
import { Router } from 'express';
import { ProfessorPublicoController } from '../controllers/professorPublicoController';

const router = Router();


const asyncHandler = (fn: any) => (req: any, res: any, next: any) => Promise.resolve(fn(req, res, next)).catch(next);



router.get('/:linkUnico', asyncHandler(ProfessorPublicoController.perfilPublico));
router.post('/:linkUnico/reservar', asyncHandler(ProfessorPublicoController.reservarAula));
router.get('/:linkUnico/agendamentos', asyncHandler(ProfessorPublicoController.listarAgendamentosAluno));

export default router;
