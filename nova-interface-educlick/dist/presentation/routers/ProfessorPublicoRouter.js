"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ProfessorPublicoController_1 = require("../controllers/ProfessorPublicoController");
const router = (0, express_1.Router)();
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
// Rotas públicas para alunos acessarem
router.get('/:id', asyncHandler(ProfessorPublicoController_1.ProfessorPublicoController.perfilPublico));
router.post('/:id/reservar', asyncHandler(ProfessorPublicoController_1.ProfessorPublicoController.reservarAula));
router.get('/:id/agendamentos/aluno', asyncHandler(ProfessorPublicoController_1.ProfessorPublicoController.listarAgendamentosAluno));
exports.default = router;
