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
exports.renderLoginPage = renderLoginPage;
const LoginTemplate_1 = require("../templates/LoginTemplate");
const LoginService_1 = require("../services/LoginService");
const Toast_1 = require("../components/Toast");
const validators_1 = require("../utils/validators");
function renderLoginPage(root) {
    return __awaiter(this, void 0, void 0, function* () {
        root.innerHTML = LoginTemplate_1.LoginTemplate.render();
        const form = document.getElementById('form-login');
        if (form) {
            form.onsubmit = handleLoginSubmit;
        }
    });
}
function handleLoginSubmit(event) {
    return __awaiter(this, void 0, void 0, function* () {
        event.preventDefault();
        const form = event.target;
        const formData = {
            email: form.email.value,
            senha: form.senha.value
        };
        const validation = validators_1.Validators.validateLogin(formData);
        if (!validation.isValid) {
            validation.errors.forEach(e => (0, Toast_1.mostrarToast)(e, 'danger'));
            return;
        }
        const result = yield LoginService_1.LoginService.login(formData);
        if (result.success) {
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1200);
        }
        else {
            (0, Toast_1.mostrarToast)(result.error || 'Erro no login', 'danger');
        }
    });
}
