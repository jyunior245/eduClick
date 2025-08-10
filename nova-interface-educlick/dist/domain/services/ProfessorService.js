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
exports.ProfessorService = void 0;
class ProfessorService {
    constructor(professorRepository) {
        this.professorRepository = professorRepository;
    }
    atualizarPerfil(id, dados) {
        return __awaiter(this, void 0, void 0, function* () {
            const professorId = Number(id);
            if (isNaN(professorId))
                throw new Error("ID de professor inválido");
            const professor = yield this.professorRepository.buscarPorId(professorId);
            if (!professor)
                throw new Error("Professor não encontrado");
            const camposPermitidos = [
                'nomePersonalizado',
                'telefone',
                'formacao',
                'experiencia',
                'especialidade',
                'linkUnico',
                'fotoPerfil',
                'descricao',
                'bio',
                'observacoes'
            ];
            for (const campo of camposPermitidos) {
                if (dados[campo] !== undefined) {
                    professor[campo] = dados[campo];
                }
            }
            yield this.professorRepository.salvar(professor);
            return professor;
        });
    }
    listarTodos() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.professorRepository.listarTodos();
        });
    }
    buscarPorId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const professorId = Number(id);
            if (isNaN(professorId))
                return null;
            return this.professorRepository.buscarPorId(professorId);
        });
    }
    // Novo: busca por linkUnico (normaliza e permite fallback por id string)
    buscarPorLinkUnico(linkOrId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!linkOrId)
                return null;
            const busca = String(linkOrId).trim();
            // Tentar buscar por linkUnico diretamente (listaTodos + find)
            const todos = yield this.professorRepository.listarTodos();
            const encontrado = todos.find(p => {
                var _a;
                const link = String((_a = p.linkUnico) !== null && _a !== void 0 ? _a : '').trim();
                if (link && link.toLowerCase() === busca.toLowerCase())
                    return true;
                // fallback: comparar com id
                return String(p.id) === busca;
            });
            return encontrado !== null && encontrado !== void 0 ? encontrado : null;
        });
    }
}
exports.ProfessorService = ProfessorService;
