import { Router, Request, Response, NextFunction } from 'express';
import { PagamentoController } from '../controllers/pagamentoController';

const router = Router();

const asyncHandler = (fn: any) => (req: Request, res: Response, next: NextFunction) => Promise.resolve(fn(req, res, next)).catch(next);

router.post('/criar-intencao', asyncHandler(PagamentoController.criarIntencao));
router.post('/stripe/onboarding-link', asyncHandler(PagamentoController.criarOnboardingLink));

export default router;
