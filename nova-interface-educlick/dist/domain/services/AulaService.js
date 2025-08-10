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
exports.AulaService = void 0;
class AulaService {
    constructor(aulaRepository) {
        this.aulaRepository = aulaRepository;
    }
    criarAula(aula) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.aulaRepository.salvar(aula);
        });
    }
    listarAulasPorProfessor(professorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const todas = yield this.aulaRepository.listarTodos();
            return todas.filter(a => a.professorId === professorId);
        });
    }
    listarAulasDisponiveisPorProfessor(professorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const aulas = yield this.listarAulasPorProfessor(professorId);
            return aulas.filter(a => a.estaDisponivel);
        });
    }
    buscarAulaPorId(aulaId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.aulaRepository.buscarPorId(Number(aulaId));
        });
    }
    reservarAula(aulaId, nome, telefone, email) {
        return __awaiter(this, void 0, void 0, function* () {
            const aula = yield this.buscarAulaPorId(aulaId);
            if (!aula)
                throw new Error("Aula não encontrada");
            const reservada = aula.reservarPublico(nome, telefone, email);
            if (reservada) {
                yield this.aulaRepository.salvar(aula);
            }
            return reservada;
        });
    }
    cancelarReserva(aulaId, nome, telefone) {
        return __awaiter(this, void 0, void 0, function* () {
            const aula = yield this.buscarAulaPorId(aulaId);
            if (!aula)
                throw new Error("Aula não encontrada");
            const cancelada = aula.cancelarReservaPublico(nome, telefone);
            if (cancelada) {
                yield this.aulaRepository.salvar(aula);
            }
            return cancelada;
        });
    }
    cancelarAula(aulaId) {
        return __awaiter(this, void 0, void 0, function* () {
            const aula = yield this.buscarAulaPorId(aulaId);
            if (!aula)
                throw new Error("Aula não encontrada");
            aula.status = 'cancelada';
            yield this.aulaRepository.salvar(aula);
        });
    }
    atualizarAula(aula) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.aulaRepository.salvar(aula);
        });
    }
    excluirAula(aulaId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.aulaRepository.remover(Number(aulaId));
        });
    }
    reagendarAula(aulaId, novaDataHora) {
        return __awaiter(this, void 0, void 0, function* () {
            const aula = yield this.buscarAulaPorId(aulaId);
            if (!aula)
                throw new Error("Aula não encontrada");
            aula.dataHora = novaDataHora;
            aula.status = 'reagendada';
            yield this.aulaRepository.salvar(aula);
            return aula;
        });
    }
    // Método utilitário para diagnóstico
    listarTodasAulas() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.aulaRepository.listarTodos();
        });
    }
}
exports.AulaService = AulaService;
