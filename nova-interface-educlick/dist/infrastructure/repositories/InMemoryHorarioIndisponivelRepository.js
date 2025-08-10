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
exports.InMemoryHorarioIndisponivelRepository = void 0;
class InMemoryHorarioIndisponivelRepository {
    constructor() {
        this.horarios = [];
    }
    salvar(horario) {
        return __awaiter(this, void 0, void 0, function* () {
            const idx = this.horarios.findIndex(h => h.id === horario.id);
            if (idx >= 0)
                this.horarios[idx] = horario;
            else
                this.horarios.push(horario);
        });
    }
    buscarPorId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.horarios.find(h => String(h.id) === String(id)) || null;
        });
    }
    listarTodos() {
        return __awaiter(this, void 0, void 0, function* () {
            return [...this.horarios];
        });
    }
    remover(id) {
        return __awaiter(this, void 0, void 0, function* () {
            this.horarios = this.horarios.filter(h => String(h.id) !== String(id));
        });
    }
}
exports.InMemoryHorarioIndisponivelRepository = InMemoryHorarioIndisponivelRepository;
