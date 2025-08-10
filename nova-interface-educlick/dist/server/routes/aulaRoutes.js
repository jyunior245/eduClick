"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/server/routes/aulaRoutes.ts
const express_1 = require("express");
const aulaController_1 = require("../controllers/aulaController");
const router = (0, express_1.Router)();
// handler simples para async functions
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
// IMPORTANT: rotas estáticas devem vir ANTES das rotas com parâmetro '/:id'
// Colocamos '/minhas-aulas' antes de '/:id' para evitar captura indevida do parâmetro
router.post('/', asyncHandler(aulaController_1.criarAula));
router.post('/criar', asyncHandler(aulaController_1.criarAula));
// rota fixa - deve vir antes de '/:id'
router.get('/minhas-aulas', asyncHandler(aulaController_1.listarMinhasAulas));
// listagem geral
router.get('/', asyncHandler(aulaController_1.listarAulas));
// rota com parâmetro (por último entre rotas com prefixo semelhante)
router.get('/:id', asyncHandler(aulaController_1.buscarAula));
router.put('/:id', asyncHandler(aulaController_1.atualizarAula));
router.delete('/:id', asyncHandler(aulaController_1.removerAula));
exports.default = router;
