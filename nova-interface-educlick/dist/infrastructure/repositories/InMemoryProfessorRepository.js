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
exports.InMemoryProfessorRepository = void 0;
class InMemoryProfessorRepository {
    constructor() {
        this.professores = [];
    }
    salvar(professor) {
        return __awaiter(this, void 0, void 0, function* () {
            const idx = this.professores.findIndex(p => p.id === professor.id);
            if (idx >= 0)
                this.professores[idx] = professor;
            else
                this.professores.push(professor);
        });
    }
    buscarPorId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.professores.find(p => p.id === id) || null;
        });
    }
    listarTodos() {
        return __awaiter(this, void 0, void 0, function* () {
            return [...this.professores];
        });
    }
    remover(id) {
        return __awaiter(this, void 0, void 0, function* () {
            this.professores = this.professores.filter(p => p.id !== id);
        });
    }
    limpar() {
        this.professores = [];
    }
}
exports.InMemoryProfessorRepository = InMemoryProfessorRepository;
