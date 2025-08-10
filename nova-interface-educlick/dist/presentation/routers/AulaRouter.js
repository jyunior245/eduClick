"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AulaController_1 = require("../controllers/AulaController");
const tokenFirebase_1 = require("../../server/middleware/tokenFirebase");
const router = (0, express_1.Router)();
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
// Cancelamento de reserva do aluno (deve vir antes das rotas genéricas)
router.post('/:aulaId/cancelar-reserva', asyncHandler(AulaController_1.AulaController.cancelarReserva));
// Rotas básicas (protegidas)
router.post('/criar', tokenFirebase_1.verificarTokenFirebase, asyncHandler(AulaController_1.AulaController.criar));
router.get('/minhas-aulas', tokenFirebase_1.verificarTokenFirebase, asyncHandler(AulaController_1.AulaController.listarDoProfessor));
// Rotas com parâmetros - mais simples
router.get('/disponiveis/:professorId', asyncHandler(AulaController_1.AulaController.listarDisponiveisPorProfessor));
router.post('/reservar/:aulaId', asyncHandler(AulaController_1.AulaController.reservar));
// Rotas protegidas
router.delete('/cancelar/:aulaId', tokenFirebase_1.verificarTokenFirebase, asyncHandler(AulaController_1.AulaController.cancelar));
// Novas rotas para funcionalidades avançadas (protegidas)
router.get('/:aulaId', tokenFirebase_1.verificarTokenFirebase, asyncHandler(AulaController_1.AulaController.buscarPorId));
router.put('/:aulaId', tokenFirebase_1.verificarTokenFirebase, asyncHandler(AulaController_1.AulaController.atualizar));
router.delete('/:aulaId', tokenFirebase_1.verificarTokenFirebase, asyncHandler(AulaController_1.AulaController.excluir));
router.put('/agendamentos/:id/status', asyncHandler(AulaController_1.AulaController.atualizarStatusAgendamento));
router.put('/:aulaId/reagendar', tokenFirebase_1.verificarTokenFirebase, asyncHandler(AulaController_1.AulaController.reagendar));
exports.default = router;
