import { Router } from 'express';
import {
  criarLog,
  listarLogs,
  buscarLog
} from '../controllers/logController';

const router = Router();

router.post('/', criarLog);
router.get('/', listarLogs);
router.get('/:id', buscarLog);

export default router;