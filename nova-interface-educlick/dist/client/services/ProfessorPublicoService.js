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
exports.ProfessorPublicoService = void 0;
// src/client/services/ProfessorPublicoService.ts
const api_1 = require("./api");
class ProfessorPublicoService {
    static carregarProfessor(linkUnico) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield (0, api_1.getProfessorPublico)(linkUnico);
            if (!res.ok)
                throw new Error('Erro ao carregar dados do professor');
            return yield res.json();
        });
    }
    static carregarAulas(linkUnico) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield (0, api_1.getAulasPublicas)(linkUnico);
            if (!res.ok)
                throw new Error('Erro ao carregar aulas');
            return yield res.json();
        });
    }
    static reservarAula(linkUnico, aulaId, nome, telefone, email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = { aulaId, alunoNome: nome, alunoTelefone: telefone, alunoEmail: email };
                const res = yield (0, api_1.reservarAulaPublica)(linkUnico, aulaId, payload);
                if (res.ok) {
                    return { success: true };
                }
                else {
                    const err = yield res.json().catch(() => ({ error: 'Erro desconhecido' }));
                    return { success: false, error: err.error || 'Erro desconhecido' };
                }
            }
            catch (error) {
                return { success: false, error: 'Erro ao conectar com o servidor.' };
            }
        });
    }
    static carregarPerfilEAulas(linkUnico) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield (0, api_1.getPerfilEAulasPublicas)(linkUnico);
            if (!res.ok)
                throw new Error('Erro ao carregar dados do professor');
            return yield res.json();
        });
    }
}
exports.ProfessorPublicoService = ProfessorPublicoService;
