"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference types="express-session" />
const express_1 = require("express");
const professorController_1 = require("../controllers/professorController");
const router = (0, express_1.Router)();
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
// CRUD básico
router.post('/', asyncHandler(professorController_1.criarProfessor));
router.get('/', asyncHandler(professorController_1.listarProfessores));
// rotas fixas relacionadas ao "me" e sub-rotas devem VIR ANTES de '/:id'
router.get('/me', asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log('[/api/professores/me] Sessão:', JSON.stringify(req.session));
    const professorIdRaw = (_a = req.session) === null || _a === void 0 ? void 0 : _a.professorId;
    console.log('[/api/professores/me] professorIdRaw:', professorIdRaw);
    if (!professorIdRaw) {
        return res.status(401).json({ error: 'Professor não autenticado. Sessão inválida.' });
    }
    // aceitar string ou number vindo da sessão
    const professorId = typeof professorIdRaw === 'string' ? parseInt(professorIdRaw, 10) : Number(professorIdRaw);
    if (Number.isNaN(professorId) || !Number.isInteger(professorId) || professorId <= 0) {
        return res.status(400).json({ error: `ID do professor inválido na sessão: ${String(professorIdRaw)}` });
    }
    const { AppDataSource } = require('../database');
    const { Professor } = require('../entities/Professor');
    const professor = yield AppDataSource.getRepository(Professor).findOne({ where: { id: professorId } });
    if (!professor)
        return res.status(404).json({ error: 'Professor não encontrado.' });
    res.json(professor);
})));
// rota para listar aulas de um professor por link ou id — colocar antes de '/:id'
router.get('/:id/aulas', asyncHandler(professorController_1.listarAulasDoProfessor));
// agora as rotas paramétricas (':id')
router.get('/:id', asyncHandler(professorController_1.buscarProfessor));
router.put('/:id', asyncHandler(professorController_1.atualizarProfessor));
router.delete('/:id', asyncHandler(professorController_1.removerProfessor));
exports.default = router;
