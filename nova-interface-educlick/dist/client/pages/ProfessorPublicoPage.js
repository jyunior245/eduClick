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
exports.renderProfessorPublicoPage = renderProfessorPublicoPage;
// src/client/pages/ProfessorPublicoPage.ts
const ProfessorPublicoTemplate_1 = require("../templates/ProfessorPublicoTemplate");
const ProfessorPublicoService_1 = require("../services/ProfessorPublicoService");
const Toast_1 = require("../components/Toast");
let professorCache = null;
let aulasCache = [];
let linkUnicoCache = '';
function renderProfessorPublicoPage(root, linkUnico) {
    return __awaiter(this, void 0, void 0, function* () {
        linkUnicoCache = linkUnico;
        try {
            const data = yield ProfessorPublicoService_1.ProfessorPublicoService.carregarPerfilEAulas(linkUnico);
            professorCache = data.professor;
            aulasCache = data.aulas || [];
            root.innerHTML = ProfessorPublicoTemplate_1.ProfessorPublicoTemplate.render({ professor: professorCache, aulas: aulasCache });
            setupReservarHandler();
            setupConsultaAgendamentoButton(linkUnico);
        }
        catch (error) {
            console.error('[renderProfessorPublicoPage] erro:', error);
            root.innerHTML = ProfessorPublicoTemplate_1.ProfessorPublicoTemplate.render({ errorMessage: 'Erro ao carregar dados do professor.' });
        }
    });
}
function setupReservarHandler() {
    window.handleReservarAula = handleReservarAula;
}
function showReservaModal(aulaId) {
    // Normalizar tipo: comparar como string
    const aula = aulasCache.find(a => String(a.id) === String(aulaId));
    if (!aula) {
        (0, Toast_1.mostrarToast)('Aula não encontrada.', 'danger');
        return;
    }
    // (resto do modal continua igual)
    const modalHtml = `
    <div class="modal fade" id="modalReserva" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Reservar Aula: ${aula.titulo}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form id="formReserva">
              <div class="mb-3">
                <label for="nome" class="form-label">Seu Nome</label>
                <input type="text" class="form-control" id="nome" name="nome" required>
              </div>
              <div class="mb-3">
                <label for="telefone" class="form-label">Telefone</label>
                <input type="tel" class="form-control" id="telefone" name="telefone" required>
              </div>
              <div class="mb-3">
                <label for="email" class="form-label">E-mail</label>
                <input type="email" class="form-control" id="email" name="email" required>
              </div>
              <button type="submit" class="btn btn-primary w-100">Confirmar Reserva</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;
    let modalDiv = document.getElementById('modalReservaContainer');
    if (!modalDiv) {
        modalDiv = document.createElement('div');
        modalDiv.id = 'modalReservaContainer';
        document.body.appendChild(modalDiv);
    }
    modalDiv.innerHTML = modalHtml;
    const modalEl = document.getElementById('modalReserva');
    const modal = new window.bootstrap.Modal(modalEl);
    modal.show();
    const form = document.getElementById('formReserva');
    if (form) {
        form.onsubmit = (event) => handleReservaSubmit(event, aulaId, modal);
    }
}
function handleReservarAula(aulaId) {
    showReservaModal(aulaId);
}
function handleReservaSubmit(event, aulaId, modal) {
    return __awaiter(this, void 0, void 0, function* () {
        event.preventDefault();
        const form = event.target;
        const nome = form.nome.value;
        const telefone = form.telefone.value;
        const email = form.email.value;
        const result = yield ProfessorPublicoService_1.ProfessorPublicoService.reservarAula(linkUnicoCache, aulaId, nome, telefone, email);
        if (result.success) {
            modal.hide();
            (0, Toast_1.mostrarToast)('Reserva realizada com sucesso!', 'success');
            // Recarregar perfil e aulas para atualizar visual
            try {
                const data = yield ProfessorPublicoService_1.ProfessorPublicoService.carregarPerfilEAulas(linkUnicoCache);
                aulasCache = data.aulas || [];
                professorCache = data.professor || professorCache;
                const root = document.getElementById('root');
                if (root) {
                    root.innerHTML = ProfessorPublicoTemplate_1.ProfessorPublicoTemplate.render({ professor: professorCache, aulas: aulasCache, successMessage: 'Reserva realizada com sucesso!' });
                    setupReservarHandler();
                    setupConsultaAgendamentoButton(linkUnicoCache);
                }
            }
            catch (e) {
                console.warn('[handleReservaSubmit] não foi possível recarregar aulas:', e);
            }
        }
        else {
            (0, Toast_1.mostrarToast)(result.error || 'Erro ao reservar', 'danger');
        }
    });
}
// resto do arquivo (funções de consulta/agendamentos e renderizações) permanece igual,
// mas sempre compare ids com String(...) para evitar mismatches
// ...
function setupConsultaAgendamentoButton(linkUnico) {
    const btn = document.getElementById('btnAbrirConsultaAgendamento');
    // Função de consulta de agendamento desabilitada até implementação
}
