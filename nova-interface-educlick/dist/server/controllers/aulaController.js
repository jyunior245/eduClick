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
exports.listarMinhasAulas = exports.removerAula = exports.atualizarAula = exports.buscarAula = exports.listarAulas = exports.criarAula = void 0;
const dataSource_1 = require("../../infrastructure/database/dataSource");
const Aula_1 = require("../entities/Aula");
const Professor_1 = require("../entities/Professor");
const criarAula = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        console.log('[CRIAR AULA] Sessão:', JSON.stringify(req.session));
        const professorIdRaw = (_a = req.session) === null || _a === void 0 ? void 0 : _a.professorId;
        if (!professorIdRaw) {
            return res.status(401).json({ error: 'Professor não autenticado. Sessão inválida.' });
        }
        const professorId = typeof professorIdRaw === 'string' ? parseInt(professorIdRaw, 10) : Number(professorIdRaw);
        if (Number.isNaN(professorId) || !Number.isInteger(professorId) || professorId <= 0) {
            return res.status(400).json({ error: 'ID do professor inválido na sessão.' });
        }
        const vagas_total = typeof req.body.vagas_total === 'string'
            ? parseInt(req.body.vagas_total, 10)
            : Number(req.body.vagas_total);
        const { titulo, data_hora, conteudo, valor, duracao } = req.body;
        if (!titulo)
            return res.status(400).json({ error: 'titulo obrigatório.' });
        if (Number.isNaN(vagas_total) || !Number.isInteger(vagas_total) || vagas_total <= 0) {
            return res.status(400).json({ error: 'vagas_total obrigatório e deve ser inteiro positivo.' });
        }
        if (!data_hora)
            return res.status(400).json({ error: 'data_hora obrigatório.' });
        const dataHoraValida = !isNaN(Date.parse(data_hora));
        if (!dataHoraValida)
            return res.status(400).json({ error: 'data_hora inválido.' });
        const professorRepo = dataSource_1.AppDataSource.getRepository(Professor_1.Professor);
        const professor = yield professorRepo.findOne({ where: { id: professorId } });
        if (!professor)
            return res.status(404).json({ error: 'Professor não encontrado.' });
        const aulaRepo = dataSource_1.AppDataSource.getRepository(Aula_1.Aula);
        const aula = aulaRepo.create({
            professor,
            titulo,
            vagas_total,
            data_hora,
            conteudo,
            valor,
            duracao
        });
        yield aulaRepo.save(aula);
        res.status(201).json(aula);
    }
    catch (err) {
        console.error('[CRIAR AULA] Erro:', err);
        res.status(500).json({ error: 'Erro ao criar aula.' });
    }
});
exports.criarAula = criarAula;
const listarAulas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const aulaRepo = dataSource_1.AppDataSource.getRepository(Aula_1.Aula);
        const aulas = yield aulaRepo.find({ relations: ['professor'] });
        res.json(aulas);
    }
    catch (err) {
        console.error('[LISTAR AULAS] Erro:', err);
        res.status(500).json({ error: 'Erro ao listar aulas.' });
    }
});
exports.listarAulas = listarAulas;
const buscarAula = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rawId = req.params.id;
        const id = parseInt(rawId, 10);
        if (Number.isNaN(id) || !Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ error: `ID da aula inválido: ${String(rawId)}` });
        }
        const aulaRepo = dataSource_1.AppDataSource.getRepository(Aula_1.Aula);
        const aula = yield aulaRepo.findOne({ where: { id }, relations: ['professor'] });
        if (!aula)
            return res.status(404).json({ error: 'Aula não encontrada.' });
        res.json(aula);
    }
    catch (err) {
        console.error('[BUSCAR AULA] Erro:', err);
        res.status(500).json({ error: 'Erro ao buscar aula.' });
    }
});
exports.buscarAula = buscarAula;
const atualizarAula = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rawId = req.params.id;
        const id = parseInt(rawId, 10);
        if (Number.isNaN(id) || !Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ error: `ID da aula inválido: ${String(rawId)}` });
        }
        const aulaRepo = dataSource_1.AppDataSource.getRepository(Aula_1.Aula);
        const aula = yield aulaRepo.findOne({ where: { id } });
        if (!aula)
            return res.status(404).json({ error: 'Aula não encontrada.' });
        // Evitar sobrescrever campos sensíveis inadvertidamente
        Object.assign(aula, req.body);
        yield aulaRepo.save(aula);
        res.json({ message: 'Aula atualizada!', aula });
    }
    catch (err) {
        console.error('[ATUALIZAR AULA] Erro:', err);
        res.status(500).json({ error: 'Erro ao atualizar aula.' });
    }
});
exports.atualizarAula = atualizarAula;
const removerAula = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rawId = req.params.id;
        const id = parseInt(rawId, 10);
        if (Number.isNaN(id) || !Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ error: `ID da aula inválido: ${String(rawId)}` });
        }
        const aulaRepo = dataSource_1.AppDataSource.getRepository(Aula_1.Aula);
        const aula = yield aulaRepo.findOne({ where: { id } });
        if (!aula)
            return res.status(404).json({ error: 'Aula não encontrada.' });
        yield aulaRepo.remove(aula);
        res.json({ message: 'Aula removida!' });
    }
    catch (err) {
        console.error('[REMOVER AULA] Erro:', err);
        res.status(500).json({ error: 'Erro ao remover aula.' });
    }
});
exports.removerAula = removerAula;
const listarMinhasAulas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        console.log('[MINHAS AULAS] Sessão recebida:', JSON.stringify(req.session));
        const professorIdRaw = (_a = req.session) === null || _a === void 0 ? void 0 : _a.professorId;
        console.log('[MINHAS AULAS] professorIdRaw:', professorIdRaw);
        if (!professorIdRaw) {
            return res.status(401).json({ error: 'Professor não autenticado. Sessão inválida. Nenhum professorId na sessão.' });
        }
        const professorId = typeof professorIdRaw === 'string' ? parseInt(professorIdRaw, 10) : Number(professorIdRaw);
        if (Number.isNaN(professorId) || !Number.isInteger(professorId) || professorId <= 0) {
            return res.status(400).json({ error: `ID do professor inválido: ${String(professorIdRaw)}` });
        }
        const aulaRepo = dataSource_1.AppDataSource.getRepository(Aula_1.Aula);
        // Consulta segura: professor id validado antes de usar no where
        const aulas = yield aulaRepo.find({ where: { professor: { id: professorId } }, relations: ['professor'] });
        res.json(aulas);
    }
    catch (err) {
        console.error('[MINHAS AULAS] Erro:', err);
        res.status(500).json({ error: 'Erro ao listar minhas aulas.' });
    }
});
exports.listarMinhasAulas = listarMinhasAulas;
