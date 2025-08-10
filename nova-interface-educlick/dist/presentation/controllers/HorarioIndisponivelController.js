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
exports.HorarioIndisponivelController = void 0;
const singletons_1 = require("../../infrastructure/repositories/singletons");
const HorarioIndisponivelService_1 = require("../../domain/services/HorarioIndisponivelService");
const HorarioIndisponivel_1 = require("../../core/entities/HorarioIndisponivel");
const uuid_1 = require("uuid");
const horarioService = new HorarioIndisponivelService_1.HorarioIndisponivelService(singletons_1.horarioIndisponivelRepository);
class HorarioIndisponivelController {
    static criar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const professorId = (_a = req.usuario) === null || _a === void 0 ? void 0 : _a.uid;
                if (!professorId)
                    return res.status(401).json({ error: "Não autenticado" });
                const { dataInicio, dataFim, motivo } = req.body;
                const horario = new HorarioIndisponivel_1.HorarioIndisponivel((0, uuid_1.v4)(), professorId, new Date(dataInicio), new Date(dataFim), motivo);
                yield horarioService.criar(horario);
                res.status(201).json({ message: "Horário indisponível cadastrado" });
            }
            catch (err) {
                res.status(400).json({ error: err.message });
            }
        });
    }
    static listarPorProfessor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { professorId } = req.params;
                const horarios = yield horarioService.listarPorProfessor(professorId);
                res.json(horarios);
            }
            catch (err) {
                res.status(400).json({ error: err.message });
            }
        });
    }
    static remover(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const professorId = (_a = req.usuario) === null || _a === void 0 ? void 0 : _a.uid;
                if (!professorId)
                    return res.status(401).json({ error: "Não autenticado" });
                const { id } = req.params;
                yield horarioService.remover(id);
                res.json({ message: "Horário removido" });
            }
            catch (err) {
                res.status(400).json({ error: err.message });
            }
        });
    }
    static listarDoProfessorAutenticado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const professorId = (_a = req.usuario) === null || _a === void 0 ? void 0 : _a.uid;
                if (!professorId)
                    return res.status(401).json({ error: "Não autenticado" });
                const horarios = yield horarioService.listarPorProfessor(professorId);
                res.json(horarios);
            }
            catch (err) {
                res.status(400).json({ error: err.message });
            }
        });
    }
}
exports.HorarioIndisponivelController = HorarioIndisponivelController;
