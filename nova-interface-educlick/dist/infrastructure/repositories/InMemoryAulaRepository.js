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
exports.InMemoryAulaRepository = void 0;
const Aula_1 = require("../../core/entities/Aula");
class InMemoryAulaRepository {
    constructor() {
        this.aulas = [];
    }
    salvar(aula) {
        return __awaiter(this, void 0, void 0, function* () {
            const index = this.aulas.findIndex(a => a.id === aula.id);
            if (index >= 0) {
                this.aulas[index] = aula;
            }
            else {
                this.aulas.push(aula);
            }
        });
    }
    buscarPorId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.aulas.find(a => String(a.id) === String(id)) || null;
        });
    }
    listarTodos() {
        return __awaiter(this, void 0, void 0, function* () {
            return [...this.aulas];
        });
    }
    remover(id) {
        return __awaiter(this, void 0, void 0, function* () {
            this.aulas = this.aulas.filter(a => String(a.id) !== String(id));
        });
    }
    limpar() {
        this.aulas = [];
    }
    buscarPorProfessor(professorId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.aulas.filter(a => a.professorId === professorId);
        });
    }
    // Método utilitário para corrigir professorId das aulas antigas
    corrigirProfessorIds(linkUnicoParaId) {
        this.aulas = this.aulas.map(aula => {
            if (linkUnicoParaId[aula.professorId]) {
                // Cria uma nova instância de Aula com o professorId corrigido
                return new Aula_1.Aula(aula.id, linkUnicoParaId[aula.professorId], aula.titulo, aula.conteudo, aula.valor, aula.duracao, aula.dataHora, aula.observacoes, aula.maxAlunos, aula.reservas, aula.status);
            }
            return aula;
        });
    }
}
exports.InMemoryAulaRepository = InMemoryAulaRepository;
