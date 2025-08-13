import { Router } from "express";
import { HorarioIndisponivelController } from "../controllers/HorarioIndisponivelController";
import { verificarTokenFirebase } from "../../server/middleware/tokenFirebase";

const router = Router();

const asyncHandler = (fn: any) => (req: any, res: any, next: any) => Promise.resolve(fn(req, res, next)).catch(next);

// Rotas mais específicas primeiro
router.get("/professores/:professorId/horarios-indisponiveis", asyncHandler(HorarioIndisponivelController.listarPorProfessor));

// Rotas protegidas do professor autenticado
router.delete("/me/horarios-indisponiveis/:id", verificarTokenFirebase, asyncHandler(HorarioIndisponivelController.remover));
router.get("/me/horarios-indisponiveis", verificarTokenFirebase, asyncHandler(HorarioIndisponivelController.listarDoProfessorAutenticado));
router.post("/me/horarios-indisponiveis", verificarTokenFirebase, asyncHandler(HorarioIndisponivelController.criar));

export default router; 