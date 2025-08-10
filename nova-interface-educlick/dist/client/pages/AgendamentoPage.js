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
exports.renderAgendamentoPage = renderAgendamentoPage;
const AgendamentoTemplate_1 = require("../templates/AgendamentoTemplate");
const AgendamentoService_1 = require("../services/AgendamentoService");
const Toast_1 = require("../components/Toast");
function renderAgendamentoPage(root, professorId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const professor = yield AgendamentoService_1.AgendamentoService.carregarProfessor(professorId);
            root.innerHTML = AgendamentoTemplate_1.AgendamentoTemplate.render({ professor });
            setupAgendamentoHandler(professorId);
        }
        catch (error) {
            root.innerHTML = AgendamentoTemplate_1.AgendamentoTemplate.render({ errorMessage: 'Erro ao carregar dados do professor.' });
        }
    });
}
function setupAgendamentoHandler(professorId) {
    const form = document.getElementById('form-agendamento');
    if (form) {
        form.onsubmit = (event) => handleAgendamentoSubmit(event, professorId);
    }
    window.handleAgendamentoSubmit = (event) => handleAgendamentoSubmit(event, professorId);
}
function handleAgendamentoSubmit(event, professorId) {
    return __awaiter(this, void 0, void 0, function* () {
        event.preventDefault();
        const form = event.target;
        const formData = {
            nome: form.nome.value,
            telefone: form.telefone.value,
            dataHora: form.dataHora.value
        };
        const validation = AgendamentoService_1.AgendamentoService.validate(formData);
        if (!validation.isValid) {
            validation.errors.forEach(e => (0, Toast_1.mostrarToast)(e, 'danger'));
            return;
        }
        const result = yield AgendamentoService_1.AgendamentoService.agendar(professorId, formData);
        if (result.success) {
            form.reset();
            (0, Toast_1.mostrarToast)('Agendamento realizado com sucesso!', 'success');
        }
        else {
            (0, Toast_1.mostrarToast)(result.error || 'Erro ao agendar', 'danger');
        }
    });
}
