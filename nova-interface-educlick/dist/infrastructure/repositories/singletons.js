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
exports.usuarioRepository = exports.alunoRepository = exports.aulaRepository = exports.horarioIndisponivelRepository = exports.professorRepository = void 0;
const InMemoryProfessorRepository_1 = require("./InMemoryProfessorRepository");
const InMemoryHorarioIndisponivelRepository_1 = require("./InMemoryHorarioIndisponivelRepository");
const InMemoryAulaRepository_1 = require("./InMemoryAulaRepository");
const InMemoryAlunoRepository_1 = require("./InMemoryAlunoRepository");
exports.professorRepository = new InMemoryProfessorRepository_1.InMemoryProfessorRepository();
exports.horarioIndisponivelRepository = new InMemoryHorarioIndisponivelRepository_1.InMemoryHorarioIndisponivelRepository();
exports.aulaRepository = new InMemoryAulaRepository_1.InMemoryAulaRepository();
exports.alunoRepository = new InMemoryAlunoRepository_1.InMemoryAlunoRepository();
// Stub para compatibilidade
exports.usuarioRepository = {
    buscarPorId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return null;
        });
    }
};
