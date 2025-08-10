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
exports.renderCadastroPage = renderCadastroPage;
const CadastroTemplate_1 = require("../templates/CadastroTemplate");
const CadastroService_1 = require("../services/CadastroService");
const Toast_1 = require("../components/Toast");
function renderCadastroPage(root) {
    return __awaiter(this, void 0, void 0, function* () {
        root.innerHTML = CadastroTemplate_1.CadastroTemplate.render();
        setupCadastroHandler();
    });
}
function setupCadastroHandler() {
    const form = document.getElementById('form-cadastro');
    if (form) {
        form.onsubmit = handleCadastroSubmit;
    }
    window.handleCadastroSubmit = handleCadastroSubmit;
}
function handleCadastroSubmit(event) {
    return __awaiter(this, void 0, void 0, function* () {
        event.preventDefault();
        const form = event.target;
        const formData = {
            nome: form.nome.value,
            email: form.email.value,
            senha: form.senha.value,
            confirmarSenha: form.confirmarSenha.value
        };
        const validation = CadastroService_1.CadastroService.validate(formData);
        if (!validation.isValid) {
            validation.errors.forEach(e => (0, Toast_1.mostrarToast)(e, 'danger'));
            return;
        }
        const result = yield CadastroService_1.CadastroService.cadastrar(formData);
        if (result.success) {
            setTimeout(() => {
                window.history.pushState({}, '', '/login');
                window.dispatchEvent(new PopStateEvent('popstate'));
            }, 1200);
        }
        else {
            (0, Toast_1.mostrarToast)(result.error || 'Erro ao cadastrar', 'danger');
        }
    });
}
