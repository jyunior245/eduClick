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
exports.EditarPerfilService = void 0;
const api_1 = require("./api");
const Toast_1 = require("../components/Toast");
class EditarPerfilService {
    static carregarPerfil() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield (0, api_1.getPerfilProfessor)();
                if (res.ok) {
                    return yield res.json();
                }
                else {
                    throw new Error('Erro ao carregar perfil');
                }
            }
            catch (error) {
                (0, Toast_1.mostrarToast)('Erro ao carregar dados do perfil.', 'danger');
                throw error;
            }
        });
    }
    static validate(data) {
        var _a;
        const errors = [];
        if (!((_a = data.nome) === null || _a === void 0 ? void 0 : _a.trim())) {
            errors.push('Nome é obrigatório');
        }
        if (data.linkUnico && !/^[a-zA-Z0-9-_]+$/.test(data.linkUnico)) {
            errors.push('Link único deve conter apenas letras, números, hífens e underscores');
        }
        return { isValid: errors.length === 0, errors };
    }
    static salvarPerfil(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield (0, api_1.editarPerfilProfessor)(data);
                if (res.ok) {
                    (0, Toast_1.mostrarToast)('Perfil atualizado com sucesso!', 'success');
                    return { success: true };
                }
                else {
                    const err = yield res.json();
                    return { success: false, error: err.error || 'Erro desconhecido' };
                }
            }
            catch (error) {
                return { success: false, error: 'Erro ao conectar com o servidor.' };
            }
        });
    }
}
exports.EditarPerfilService = EditarPerfilService;
