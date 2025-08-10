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
exports.DashboardProfessorPage = void 0;
exports.renderDashboardProfessorPage = renderDashboardProfessorPage;
const DashboardTemplate_1 = require("../templates/DashboardTemplate");
const DashboardService_1 = require("../services/DashboardService");
const Toast_1 = require("../components/Toast");
const calendarService_1 = require("../services/calendarService");
const AulaDetailModal_1 = require("../components/modals/AulaDetailModal");
const perfomance_1 = require("../utils/perfomance");
const AulaCard_1 = require("../components/ui/AulaCard");
const logger_1 = require("../utils/logger");
const api_1 = require("../services/api");
class DashboardProfessorPage {
    static render() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield DashboardService_1.DashboardService.loadDashboardData();
                return DashboardTemplate_1.DashboardTemplate.render(data);
            }
            catch (error) {
                return this.renderErrorState();
            }
        });
    }
    static init() {
        return __awaiter(this, void 0, void 0, function* () {
            // Aplicar otimizações de performance
            perfomance_1.PerformanceOptimizer.applyOptimizations();
            this.setupEventListeners();
            this.setupGlobalFunctions();
            this.setupCalendar();
        });
    }
    static setupEventListeners() {
        setTimeout(() => {
            // Botão de logout
            const btnLogout = document.getElementById('btn-logout');
            if (btnLogout) {
                btnLogout.addEventListener('click', this.handleLogout.bind(this));
            }
            // Botão nova aula
            const btnNovaAula = document.getElementById('nova-aula-btn');
            if (btnNovaAula) {
                btnNovaAula.addEventListener('click', () => {
                    this.showNovaAulaModal();
                });
            }
            // Botão copiar link
            const btnCopiarLink = document.getElementById('btn-copiar-link');
            if (btnCopiarLink) {
                btnCopiarLink.addEventListener('click', this.handleCopyLink.bind(this));
            }
            // Botão editar perfil
            const btnEditarPerfil = document.getElementById('btn-editar-perfil');
            if (btnEditarPerfil) {
                btnEditarPerfil.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleEditarPerfil();
                });
            }
            // Formulário nova aula
            const formNovaAula = document.getElementById('formNovaAula');
            if (formNovaAula) {
                formNovaAula.addEventListener('submit', this.handleSubmitNovaAula.bind(this));
            }
            // Formulário editar aula
            const formEditarAula = document.getElementById('formEditarAula');
            if (formEditarAula) {
                formEditarAula.addEventListener('submit', this.handleSubmitEditarAula.bind(this));
            }
            // Botões de fechar modal e cancelar
            const closeButtons = document.querySelectorAll('[data-bs-dismiss="modal"], .modal-footer .btn-secondary');
            closeButtons.forEach(button => {
                button.addEventListener('click', () => {
                    // Fechar modal manualmente se não for data-bs-dismiss
                    const modalEl = button.closest('.modal');
                    if (modalEl && window.bootstrap) {
                        const modalInstance = window.bootstrap.Modal.getInstance(modalEl);
                        if (modalInstance)
                            modalInstance.hide();
                    }
                    this.resetForms();
                });
            });
        }, 100);
    }
    static setupGlobalFunctions() {
        // Funções globais para serem chamadas pelos cards
        window.editarAula = this.handleEditarAula.bind(this);
        window.excluirAula = this.handleExcluirAula.bind(this);
        window.navegarMes = this.handleNavegarMes.bind(this);
    }
    static setupCalendar() {
        // Inicializar calendário quando a aba for ativada
        const calendarioTab = document.getElementById('calendario-tab');
        if (calendarioTab) {
            calendarioTab.addEventListener('shown.bs.tab', perfomance_1.PerformanceOptimizer.debounce(() => {
                this.initializeCalendar();
            }, 100));
        }
        // Listener para cliques em eventos do calendário
        document.addEventListener('aulaCalendarClick', (event) => {
            this.handleCalendarEventClick(event.detail);
        });
    }
    static initializeCalendar() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield DashboardService_1.DashboardService.loadDashboardData();
                const calendarContainer = document.getElementById('calendario-container');
                if (calendarContainer) {
                    calendarService_1.CalendarService.initializeCalendar('calendario-container', data.aulas);
                    // Inicializar tooltips do Bootstrap
                    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
                    tooltipTriggerList.map(function (tooltipTriggerEl) {
                        return new window.bootstrap.Tooltip(tooltipTriggerEl);
                    });
                }
            }
            catch (error) {
                console.error('Erro ao inicializar calendário:', error);
                (0, Toast_1.mostrarToast)('Erro ao carregar calendário.', 'danger');
            }
        });
    }
    static handleCalendarEventClick(detail) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { aulaId } = detail;
                // Buscar dados da aula usando fetchComToken
                const response = yield (0, api_1.getAula)(aulaId);
                if (response.ok) {
                    const aula = yield response.json();
                    // Atualizar conteúdo do modal de detalhes
                    const modalBody = document.getElementById('modalAulaDetailBody');
                    if (modalBody) {
                        modalBody.innerHTML = AulaDetailModal_1.AulaDetailModal.renderContent(aula);
                        // Configurar botões do modal
                        this.setupDetailModalButtons(aulaId);
                        // Mostrar modal
                        const modal = new window.bootstrap.Modal(document.getElementById('modalAulaDetail'));
                        modal.show();
                    }
                }
                else {
                    (0, Toast_1.mostrarToast)('Erro ao carregar detalhes da aula.', 'danger');
                }
            }
            catch (error) {
                console.error('Erro ao abrir detalhes da aula:', error);
                (0, Toast_1.mostrarToast)('Erro ao abrir detalhes da aula.', 'danger');
            }
        });
    }
    static setupDetailModalButtons(aulaId) {
        // Botão editar
        const btnEditar = document.getElementById('btn-editar-aula-detail');
        if (btnEditar) {
            btnEditar.addEventListener('click', () => {
                // Fechar modal de detalhes
                const modalDetail = window.bootstrap.Modal.getInstance(document.getElementById('modalAulaDetail'));
                if (modalDetail) {
                    modalDetail.hide();
                }
                // Abrir modal de edição
                this.handleEditarAula(aulaId);
            });
        }
        // Botão fechar
        const btnFechar = document.getElementById('btn-fechar-detail');
        if (btnFechar) {
            btnFechar.addEventListener('click', () => {
                const modalDetail = window.bootstrap.Modal.getInstance(document.getElementById('modalAulaDetail'));
                if (modalDetail) {
                    modalDetail.hide();
                }
            });
        }
    }
    static handleLogout() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`${api_1.API_BASE}/auth/logout`, {
                    method: 'GET',
                    credentials: 'include'
                });
                if (response.ok) {
                    (0, Toast_1.mostrarToast)('Logout realizado com sucesso!', 'success');
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 1000);
                }
                else {
                    (0, Toast_1.mostrarToast)('Erro ao fazer logout.', 'danger');
                }
            }
            catch (error) {
                (0, Toast_1.mostrarToast)('Erro ao conectar com o servidor.', 'danger');
            }
        });
    }
    static handleCopyLink() {
        return __awaiter(this, void 0, void 0, function* () {
            const input = document.getElementById('input-link-publico');
            if (input) {
                const success = yield DashboardService_1.DashboardService.copyToClipboard(input.value);
                if (success) {
                    (0, Toast_1.mostrarToast)('Link copiado para a área de transferência!', 'success');
                }
                else {
                    (0, Toast_1.mostrarToast)('Erro ao copiar link.', 'danger');
                }
            }
        });
    }
    static handleEditarPerfil() {
        window.location.href = '/editar-perfil';
    }
    static showNovaAulaModal() {
        this.currentAulaId = null;
        const modal = new window.bootstrap.Modal(document.getElementById('modalNovaAula'));
        modal.show();
    }
    static handleEditarAula(aulaId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield (0, api_1.getAula)(aulaId);
                if (response.ok) {
                    const aula = yield response.json();
                    this.populateEditForm(aula);
                    this.currentAulaId = aulaId;
                    const modal = new window.bootstrap.Modal(document.getElementById('modalEditarAula'));
                    modal.show();
                }
                else {
                    let errorMsg = 'Erro ao carregar dados da aula.';
                    try {
                        const err = yield response.json();
                        errorMsg = err.error || errorMsg;
                        // Se erro de autenticação, forçar logout
                        if (response.status === 401) {
                            (0, Toast_1.mostrarToast)('Sessão expirada. Faça login novamente.', 'danger');
                            setTimeout(() => window.location.href = '/login', 1500);
                            return;
                        }
                    }
                    catch (_a) { }
                    (0, Toast_1.mostrarToast)(errorMsg, 'danger');
                }
            }
            catch (error) {
                console.error('Erro ao editar aula:', error);
                (0, Toast_1.mostrarToast)((error === null || error === void 0 ? void 0 : error.message) || 'Erro ao conectar com o servidor.', 'danger');
            }
        });
    }
    // Adicionar modal de confirmação de exclusão
    static showExcluirAulaModal(aulaId) {
        let modalDiv = document.getElementById('modalExcluirAulaContainer');
        if (!modalDiv) {
            modalDiv = document.createElement('div');
            modalDiv.id = 'modalExcluirAulaContainer';
            document.body.appendChild(modalDiv);
        }
        modalDiv.innerHTML = `
      <div class="modal fade" id="modalExcluirAula" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Confirmar Exclusão</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              Tem certeza que deseja excluir esta aula? Esta ação não poderá ser desfeita.
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button type="button" class="btn btn-danger" id="btnConfirmarExcluirAula">Excluir</button>
            </div>
          </div>
        </div>
      </div>
    `;
        const modal = new window.bootstrap.Modal(document.getElementById('modalExcluirAula'));
        modal.show();
        const btnConfirmar = document.getElementById('btnConfirmarExcluirAula');
        if (btnConfirmar) {
            btnConfirmar.onclick = () => __awaiter(this, void 0, void 0, function* () {
                yield this.confirmarExcluirAula(aulaId, modal);
            });
        }
    }
    static confirmarExcluirAula(aulaId, modal) {
        return __awaiter(this, void 0, void 0, function* () {
            const success = yield DashboardService_1.DashboardService.excluirAula(aulaId);
            if (success) {
                (0, Toast_1.mostrarToast)('Aula excluída com sucesso!', 'success');
                modal.hide();
                yield this.refreshDashboard();
            }
            else {
                (0, Toast_1.mostrarToast)('Erro ao excluir aula.', 'danger');
            }
        });
    }
    static handleExcluirAula(aulaId) {
        return __awaiter(this, void 0, void 0, function* () {
            this.showExcluirAulaModal(aulaId);
        });
    }
    static handleNavegarMes(direction) {
        // Implementação do calendário será adicionada posteriormente
        logger_1.logger.debug('Navegar mês:', direction);
    }
    static handleSubmitNovaAula(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            const formData = this.getFormData(event.target);
            // Garantir status 'disponivel' se não informado
            if (!formData.status)
                formData.status = 'disponivel';
            const validation = DashboardService_1.DashboardService.validateAulaData(formData);
            if (!validation.isValid) {
                validation.errors.forEach(error => (0, Toast_1.mostrarToast)(error, 'danger'));
                return;
            }
            try {
                const success = yield DashboardService_1.DashboardService.criarAula(formData);
                if (success) {
                    const modal = window.bootstrap.Modal.getInstance(document.getElementById('modalNovaAula'));
                    modal.hide();
                    this.resetForms();
                    yield this.refreshDashboard();
                }
            }
            catch (error) {
                (0, Toast_1.mostrarToast)((error === null || error === void 0 ? void 0 : error.message) || 'Erro ao criar aula', 'danger');
            }
        });
    }
    static handleSubmitEditarAula(event) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            event.preventDefault();
            if (!this.currentAulaId)
                return;
            const formData = this.getFormData(event.target);
            if (!formData.status)
                formData.status = 'disponivel';
            const validation = DashboardService_1.DashboardService.validateAulaData(formData);
            if (!validation.isValid) {
                validation.errors.forEach(error => (0, Toast_1.mostrarToast)(error, 'danger'));
                return;
            }
            try {
                const payload = Object.assign(Object.assign({}, formData), { valor: parseFloat(formData.valor.toString()), duracao: parseInt(formData.duracao.toString(), 10), maxAlunos: parseInt(formData.maxAlunos.toString(), 10), dataHora: formData.dataHora.includes('T') ? formData.dataHora : new Date(formData.dataHora).toISOString(), status: formData.status || 'disponivel' });
                const success = yield DashboardService_1.DashboardService.editarAula(this.currentAulaId, payload);
                if (success) {
                    const modalElement = document.getElementById('modalEditarAula');
                    if (modalElement) {
                        const modal = window.bootstrap.Modal.getInstance(modalElement);
                        if (modal) {
                            modal.hide();
                        }
                    }
                    this.resetForms();
                    yield this.refreshDashboard();
                }
            }
            catch (error) {
                if (((_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.status) === 401) {
                    (0, Toast_1.mostrarToast)('Sessão expirada. Faça login novamente.', 'danger');
                    setTimeout(() => window.location.href = '/login', 1500);
                    return;
                }
                (0, Toast_1.mostrarToast)((error === null || error === void 0 ? void 0 : error.message) || 'Erro ao editar aula', 'danger');
            }
        });
    }
    static getFormData(form) {
        var _a;
        const formData = new FormData(form);
        // Converter dataHora para ISO 8601 se não estiver
        let dataHora = formData.get('dataHora');
        if (dataHora && !dataHora.endsWith('Z') && !dataHora.includes('T')) {
            dataHora = dataHora.replace(' ', 'T');
        }
        return {
            titulo: formData.get('titulo'),
            conteudo: formData.get('conteudo'),
            valor: parseFloat(formData.get('valor')),
            duracao: parseInt(formData.get('duracao'), 10),
            maxAlunos: Math.max(1, parseInt((_a = formData.get('maxAlunos')) !== null && _a !== void 0 ? _a : '1', 10)),
            dataHora: dataHora,
            status: formData.get('status') || 'disponivel',
            observacoes: formData.get('observacoes') || undefined
        };
    }
    static populateEditForm(aula) {
        const form = document.getElementById('formEditarAula');
        if (form) {
            form.querySelector('[name="titulo"]').value = aula.titulo;
            form.querySelector('[name="conteudo"]').value = aula.conteudo;
            form.querySelector('[name="valor"]').value = aula.valor;
            form.querySelector('[name="duracao"]').value = aula.duracao;
            form.querySelector('[name="maxAlunos"]').value = aula.maxAlunos;
            // Só atualizar se o campo estiver vazio ou diferente
            const inputDataHora = form.querySelector('[name="dataHora"]');
            // Sempre use o valor original da aula, nunca o horário atual
            inputDataHora.value = new Date(aula.dataHora).toISOString().slice(0, 16);
            inputDataHora.setAttribute('data-original', inputDataHora.value); // Para comparar depois
            form.querySelector('[name="status"]').value = aula.status;
            form.querySelector('[name="observacoes"]').value = aula.observacoes || '';
        }
    }
    static resetForms() {
        const forms = ['formNovaAula', 'formEditarAula'];
        forms.forEach(formId => {
            const form = document.getElementById(formId);
            if (form) {
                form.reset();
            }
        });
        this.currentAulaId = null;
    }
    static refreshDashboard() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield DashboardService_1.DashboardService.loadDashboardData();
                const contentContainer = document.querySelector('.tab-content');
                if (contentContainer) {
                    const aulasContainer = contentContainer.querySelector('#aulas .row');
                    if (aulasContainer) {
                        const aulasHtml = data.aulas.length > 0
                            ? data.aulas.map(aula => `
                <div class="col-12 col-md-6 col-lg-4">
                  ${this.renderAulaCard(aula)}
                </div>
              `).join('')
                            : `
                <div class="col-12">
                  <div class="text-center py-5">
                    <i class="bi bi-calendar3 display-1 text-muted"></i>
                    <h4 class="mt-3 text-muted">Nenhuma aula cadastrada</h4>
                    <p class="text-muted">Clique em "Nova Aula" para começar a criar suas aulas.</p>
                  </div>
                </div>
              `;
                        aulasContainer.innerHTML = aulasHtml;
                    }
                }
                // Atualizar calendário se estiver ativo
                const calendar = calendarService_1.CalendarService.getCalendar();
                if (calendar) {
                    calendarService_1.CalendarService.updateEvents(data.aulas);
                }
            }
            catch (error) {
                (0, Toast_1.mostrarToast)('Erro ao atualizar dashboard.', 'danger');
            }
        });
    }
    static renderAulaCard(aula) {
        return AulaCard_1.AulaCard.render(aula);
    }
    static renderErrorState() {
        return `
      <div class="container mt-5">
        <div class="row justify-content-center">
          <div class="col-md-8">
            <div class="card">
              <div class="card-body text-center">
                <i class="bi bi-exclamation-triangle text-danger display-1"></i>
                <h4 class="mt-3 text-danger">Erro ao carregar dashboard</h4>
                <p class="text-muted">Não foi possível carregar os dados do dashboard.</p>
                <button class="btn btn-primary" onclick="location.reload()">
                  <i class="bi bi-arrow-clockwise"></i> Tentar novamente
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    }
}
exports.DashboardProfessorPage = DashboardProfessorPage;
DashboardProfessorPage.currentAulaId = null;
function renderDashboardProfessorPage(root) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const html = yield DashboardProfessorPage.render();
            root.innerHTML = html;
            yield DashboardProfessorPage.init();
        }
        catch (error) {
            console.error('Erro ao renderizar dashboard:', error);
            root.innerHTML = `
      <div class="container mt-5">
        <div class="row justify-content-center">
          <div class="col-md-8">
            <div class="card">
              <div class="card-body text-center">
                <i class="bi bi-exclamation-triangle text-danger display-1"></i>
                <h4 class="mt-3 text-danger">Erro ao carregar dashboard</h4>
                <p class="text-muted">Não foi possível carregar os dados do dashboard.</p>
                <button class="btn btn-primary" onclick="location.reload()">
                  <i class="bi bi-arrow-clockwise"></i> Tentar novamente
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
        }
    });
}
