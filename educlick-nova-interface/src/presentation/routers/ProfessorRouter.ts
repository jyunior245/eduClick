import { Router } from "express";
import { ProfessorController } from "../controllers/ProfessorController";
import { verificarTokenFirebase } from '../../server/middleware/tokenFirebase';


const router = Router();

const asyncHandler = (fn: any) => (req: any, res: any, next: any) => Promise.resolve(fn(req, res, next)).catch(next);

// Rotas públicas
router.post("/cadastro", asyncHandler(ProfessorController.cadastrar));
router.post("/login", asyncHandler(ProfessorController.login));

// Rotas protegidas: precisam do token validado
router.get("/me", verificarTokenFirebase, asyncHandler(ProfessorController.perfil));
router.put("/me", verificarTokenFirebase, asyncHandler(ProfessorController.atualizarPerfil));
router.post("/gerar-link", verificarTokenFirebase, asyncHandler(ProfessorController.gerarLinkUnico));
router.get("/me/agendamentos", verificarTokenFirebase, asyncHandler(ProfessorController.listarAgendamentos));

// Rotas públicas
router.get('/:id', asyncHandler(ProfessorController.buscarPorIdPublico));
router.get('/:id/aulas', asyncHandler(ProfessorController.listarAulasPublicas));

export default router;
