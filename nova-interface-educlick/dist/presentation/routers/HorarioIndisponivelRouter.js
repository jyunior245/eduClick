"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const HorarioIndisponivelController_1 = require("../controllers/HorarioIndisponivelController");
const tokenFirebase_1 = require("../../server/middleware/tokenFirebase");
const router = (0, express_1.Router)();
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
// Rotas mais específicas primeiro
router.get("/professores/:professorId/horarios-indisponiveis", asyncHandler(HorarioIndisponivelController_1.HorarioIndisponivelController.listarPorProfessor));
// Rotas protegidas do professor autenticado
router.delete("/me/horarios-indisponiveis/:id", tokenFirebase_1.verificarTokenFirebase, asyncHandler(HorarioIndisponivelController_1.HorarioIndisponivelController.remover));
router.get("/me/horarios-indisponiveis", tokenFirebase_1.verificarTokenFirebase, asyncHandler(HorarioIndisponivelController_1.HorarioIndisponivelController.listarDoProfessorAutenticado));
router.post("/me/horarios-indisponiveis", tokenFirebase_1.verificarTokenFirebase, asyncHandler(HorarioIndisponivelController_1.HorarioIndisponivelController.criar));
exports.default = router;
