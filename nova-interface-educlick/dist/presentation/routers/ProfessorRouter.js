"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ProfessorController_1 = require("../controllers/ProfessorController");
const tokenFirebase_1 = require("../../server/middleware/tokenFirebase");
const router = (0, express_1.Router)();
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
// Rotas públicas
router.post("/cadastro", asyncHandler(ProfessorController_1.ProfessorController.cadastrar));
router.post("/login", asyncHandler(ProfessorController_1.ProfessorController.login));
// Rotas protegidas: precisam do token validado
router.get("/me", tokenFirebase_1.verificarTokenFirebase, asyncHandler(ProfessorController_1.ProfessorController.perfil));
router.put("/me", tokenFirebase_1.verificarTokenFirebase, asyncHandler(ProfessorController_1.ProfessorController.atualizarPerfil));
router.post("/gerar-link", tokenFirebase_1.verificarTokenFirebase, asyncHandler(ProfessorController_1.ProfessorController.gerarLinkUnico));
router.get("/me/agendamentos", tokenFirebase_1.verificarTokenFirebase, asyncHandler(ProfessorController_1.ProfessorController.listarAgendamentos));
// Rotas públicas
router.get('/:id', asyncHandler(ProfessorController_1.ProfessorController.buscarPorIdPublico));
router.get('/:id/aulas', asyncHandler(ProfessorController_1.ProfessorController.listarAulasPublicas));
exports.default = router;
