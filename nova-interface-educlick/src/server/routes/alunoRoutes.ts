import { Router } from 'express';
import {
  criarAluno,
  listarAlunos,
  buscarAluno,
  atualizarAluno,
  removerAluno,
  listarReservasDoAluno
} from '../controllers/alunoController';

const router = Router();

router.post('/', criarAluno);
router.get('/', listarAlunos);
router.get('/:id', buscarAluno);
router.put('/:id', atualizarAluno);
router.delete('/:id', removerAluno);
router.get('/:id/reservas', listarReservasDoAluno);

export default router;