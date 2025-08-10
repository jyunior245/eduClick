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
exports.renderEditarPerfilProfessorPage = renderEditarPerfilProfessorPage;
const EditarPerfilTemplate_1 = require("../templates/EditarPerfilTemplate");
const EditarPerfilService_1 = require("../services/EditarPerfilService");
const Toast_1 = require("../components/Toast");
function renderEditarPerfilProfessorPage(root) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const usuario = yield EditarPerfilService_1.EditarPerfilService.carregarPerfil();
            root.innerHTML = EditarPerfilTemplate_1.EditarPerfilTemplate.render({ usuario });
            setupEditarPerfilHandler();
        }
        catch (error) {
            root.innerHTML = EditarPerfilTemplate_1.EditarPerfilTemplate.render({
                errorMessage: 'Erro ao carregar dados do perfil.'
            });
        }
    });
}
function setupEditarPerfilHandler() {
    const form = document.getElementById('form-editar-perfil');
    if (form) {
        form.onsubmit = handleEditarPerfilSubmit;
    }
    window.handleEditarPerfilSubmit = handleEditarPerfilSubmit;
}
function handleEditarPerfilSubmit(event) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        event.preventDefault();
        const form = event.target;
        const getValue = (name) => {
            const el = form.querySelector(`[name="${name}"]`);
            return el ? el.value : undefined;
        };
        const formData = {
            nome: (_a = getValue('nome')) !== null && _a !== void 0 ? _a : '',
            email: (_b = getValue('email')) !== null && _b !== void 0 ? _b : '',
            telefone: getValue('telefone'),
            especialidade: getValue('especialidade'),
            formacao: getValue('formacao'),
            experiencia: getValue('experiencia'),
            linkUnico: getValue('linkUnico')
        };
        const validation = EditarPerfilService_1.EditarPerfilService.validate(formData);
        if (!validation.isValid) {
            validation.errors.forEach(e => (0, Toast_1.mostrarToast)(e, 'danger'));
            return;
        }
        const result = yield EditarPerfilService_1.EditarPerfilService.salvarPerfil(formData);
        if (result.success) {
            setTimeout(() => {
                window.history.pushState({}, '', '/dashboard');
                window.dispatchEvent(new PopStateEvent('popstate'));
            }, 1500);
        }
        else {
            (0, Toast_1.mostrarToast)(result.error || 'Erro ao salvar perfil', 'danger');
        }
    });
}
