import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController';
import { verificarTokenFirebase } from '../middleware/tokenFirebase';

const router = Router();

// Registra/atualiza o token FCM do usuário logado (via Firebase Auth)
router.post(
  '/register-token',
  verificarTokenFirebase,
  async (req, res, next) => {
    try {
      await NotificationController.registerToken(req as any, res);
    } catch (e) {
      next(e);
    }
  }
);

// Envia uma notificação de teste para o usuário autenticado
router.post(
  '/test',
  verificarTokenFirebase,
  async (req, res, next) => {
    try {
      await NotificationController.sendTest(req as any, res);
    } catch (e) {
      next(e);
    }
  }
);

export default router;
