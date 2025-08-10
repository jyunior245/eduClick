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
exports.DashboardService = void 0;
const api_1 = require("./api");
const Toast_1 = require("../components/Toast");
class DashboardService {
    static loadDashboardData() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [aulasRes, perfilRes] = yield Promise.all([
                    (0, api_1.getMinhasAulas)(),
                    (0, api_1.getPerfilProfessor)()
                ]);
                const aulasRaw = aulasRes.ok ? yield aulasRes.json() : [];
                // Mapear campos do backend para o formato esperado pelo card
                const aulas = aulasRaw.map((aula) => {
                    var _a, _b, _c, _d, _e, _f, _g;
                    return ({
                        id: (_a = aula.id) !== null && _a !== void 0 ? _a : '',
                        titulo: (_b = aula.titulo) !== null && _b !== void 0 ? _b : '',
                        conteudo: (_c = aula.conteudo) !== null && _c !== void 0 ? _c : '',
                        valor: aula.valor != null ? Number(aula.valor) : 0,
                        duracao: aula.duracao != null ? Number(aula.duracao) : 0,
                        dataHora: (_e = (_d = aula.data_hora) !== null && _d !== void 0 ? _d : aula.dataHora) !== null && _e !== void 0 ? _e : '',
                        maxAlunos: aula.vagas_total != null ? Number(aula.vagas_total) : (aula.maxAlunos != null ? Number(aula.maxAlunos) : 0),
                        status: (_f = aula.status) !== null && _f !== void 0 ? _f : '',
                        observacoes: (_g = aula.observacoes) !== null && _g !== void 0 ? _g : '',
                        reservas: Array.isArray(aula.reservas) ? aula.reservas : []
                    });
                });
                const usuario = perfilRes.ok ? yield perfilRes.json() : {};
                return { usuario, aulas };
            }
            catch (error) {
                (0, Toast_1.mostrarToast)('Erro ao carregar dados do dashboard.', 'danger');
                return { usuario: {}, aulas: [] };
            }
        });
    }
    static criarAula(aulaData) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            try {
                const payload = Object.assign(Object.assign({}, aulaData), { valor: parseFloat((_b = (_a = aulaData.valor) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : '0'), duracao: parseInt((_d = (_c = aulaData.duracao) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : '0', 10), vagas_total: Math.max(1, parseInt((_f = (_e = aulaData.maxAlunos) === null || _e === void 0 ? void 0 : _e.toString()) !== null && _f !== void 0 ? _f : '1', 10)), data_hora: aulaData.dataHora });
                const res = yield (0, api_1.criarAula)(payload);
                if (res.ok) {
                    (0, Toast_1.mostrarToast)('Aula criada com sucesso!', 'success');
                    return true;
                }
                else {
                    const err = yield res.json();
                    (0, Toast_1.mostrarToast)('Erro ao criar aula: ' + (err.error || 'Erro desconhecido'), 'danger');
                    return false;
                }
            }
            catch (error) {
                (0, Toast_1.mostrarToast)('Erro ao conectar com o servidor.', 'danger');
                return false;
            }
        });
    }
    static editarAula(aulaId, aulaData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = Object.assign(Object.assign({}, aulaData), { valor: parseFloat(aulaData.valor.toString()), duracao: parseInt(aulaData.duracao.toString(), 10), maxAlunos: parseInt(aulaData.maxAlunos.toString(), 10) });
                const res = yield (0, api_1.editarAula)(aulaId, payload);
                if (res.ok) {
                    (0, Toast_1.mostrarToast)('Aula editada com sucesso!', 'success');
                    return true;
                }
                else {
                    const err = yield res.json();
                    (0, Toast_1.mostrarToast)('Erro ao editar aula: ' + (err.error || 'Erro desconhecido'), 'danger');
                    return false;
                }
            }
            catch (error) {
                (0, Toast_1.mostrarToast)('Erro ao conectar com o servidor.', 'danger');
                return false;
            }
        });
    }
    static excluirAula(aulaId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield (0, api_1.excluirAula)(aulaId);
                if (res.ok) {
                    (0, Toast_1.mostrarToast)('Aula excluída com sucesso!', 'success');
                    return true;
                }
                else {
                    (0, Toast_1.mostrarToast)('Erro ao excluir aula.', 'danger');
                    return false;
                }
            }
            catch (error) {
                (0, Toast_1.mostrarToast)('Erro ao conectar com o servidor.', 'danger');
                return false;
            }
        });
    }
    static copyToClipboard(text) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield navigator.clipboard.writeText(text);
                return true;
            }
            catch (error) {
                return false;
            }
        });
    }
    static validateAulaData(aulaData) {
        var _a, _b;
        const errors = [];
        if (!((_a = aulaData.titulo) === null || _a === void 0 ? void 0 : _a.trim())) {
            errors.push('Título é obrigatório');
        }
        if (!((_b = aulaData.conteudo) === null || _b === void 0 ? void 0 : _b.trim())) {
            errors.push('Conteúdo é obrigatório');
        }
        if (!aulaData.valor || aulaData.valor <= 0) {
            errors.push('Valor deve ser maior que zero');
        }
        if (!aulaData.duracao || aulaData.duracao <= 0) {
            errors.push('Duração deve ser maior que zero');
        }
        if (!aulaData.maxAlunos || aulaData.maxAlunos <= 0) {
            errors.push('Número de vagas deve ser maior que zero');
        }
        if (!aulaData.dataHora) {
            errors.push('Data e hora são obrigatórios');
        }
        const validStatuses = ['disponivel', 'lotada', 'cancelada', 'reagendada'];
        if (aulaData.status && !validStatuses.includes(aulaData.status)) {
            errors.push('Status inválido');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}
exports.DashboardService = DashboardService;
