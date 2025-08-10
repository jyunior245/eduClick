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
exports.listarReservasDoAluno = exports.removerAluno = exports.atualizarAluno = exports.buscarAluno = exports.listarAlunos = exports.criarAluno = void 0;
const criarAluno = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({ message: 'Aluno criado!' });
});
exports.criarAluno = criarAluno;
const listarAlunos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json([]);
});
exports.listarAlunos = listarAlunos;
const buscarAluno = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({});
});
exports.buscarAluno = buscarAluno;
const atualizarAluno = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({ message: 'Aluno atualizado!' });
});
exports.atualizarAluno = atualizarAluno;
const removerAluno = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({ message: 'Aluno removido!' });
});
exports.removerAluno = removerAluno;
const listarReservasDoAluno = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json([]);
});
exports.listarReservasDoAluno = listarReservasDoAluno;
