import { Router } from "express";
import { HorarioIndisponivelController } from "../controllers/HorarioIndisponivelController";

const router = Router();

const asyncHandler = (fn: any) => (req: any, res: any, next: any) => Promise.resolve(fn(req, res, next)).catch(next);

// Rotas mais específicas primeiro
router.get("/professores/:professorId/horarios-indisponiveis", asyncHandler(HorarioIndisponivelController.listarPorProfessor));
router.delete("/me/horarios-indisponiveis/:id", asyncHandler(HorarioIndisponivelController.remover));

// Rotas do professor autenticado
router.get("/me/horarios-indisponiveis", asyncHandler(HorarioIndisponivelController.listarDoProfessorAutenticado));
router.post("/me/horarios-indisponiveis", asyncHandler(HorarioIndisponivelController.criar));

export default router; 