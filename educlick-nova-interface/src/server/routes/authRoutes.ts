// src/server/routes/authRoutes.ts
import { Router } from 'express';
import { login, loginWithUid, sincronizarUsuario } from '../controllers/authController';

const router = Router();


const asyncHandler = (fn: any) => (req: any, res: any, next: any) => Promise.resolve(fn(req, res, next)).catch(next);

router.post('/login', asyncHandler(login));
router.post('/firebase-login', asyncHandler(loginWithUid));
router.post('/sincronizar-usuario', asyncHandler(sincronizarUsuario));

export default router;
