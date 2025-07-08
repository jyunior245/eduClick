import { Router } from "express";
import { ProfessorController } from "../controllers/ProfessorController";

const router = Router();

const asyncHandler = (fn: any) => (req: any, res: any, next: any) => Promise.resolve(fn(req, res, next)).catch(next);

router.post("/cadastro", asyncHandler(ProfessorController.cadastrar));
router.post("/login", asyncHandler(ProfessorController.login));
router.get("/me", asyncHandler(ProfessorController.perfil));
router.put("/me", asyncHandler(ProfessorController.atualizarPerfil));
router.post("/gerar-link", asyncHandler(ProfessorController.gerarLinkUnico));
router.get("/me/agendamentos", asyncHandler(ProfessorController.listarAgendamentos));
router.get('/:id', asyncHandler(ProfessorController.buscarPorIdPublico));
router.get('/:id/aulas', asyncHandler(ProfessorController.listarAulasPublicas));

export default router; 