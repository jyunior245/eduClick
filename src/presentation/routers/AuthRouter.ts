import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

const router = Router();

// Login de professor
router.post('/login/professor', AuthController.loginProfessor);

// Login de aluno
router.post('/login/aluno', AuthController.loginAluno);

// Logout
router.post('/logout', AuthController.logout);

// Verificar sessão
router.get('/session', AuthController.checkSession);

export default router; 