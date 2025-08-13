import { DashboardTemplate, DashboardData } from '../templates/DashboardTemplate';
import { DashboardService, AulaFormData } from '../services/DashboardService';
import { mostrarToast } from '../components/Toast';
import { CalendarService } from '../services/calendarService';
import { AulaDetailModal } from '../components/modals/AulaDetailModal';
import { PerformanceOptimizer } from '../utils/perfomance';
import { AulaCard } from '../components/ui/AulaCard';
import { logger } from '../utils/logger';
import { API_BASE, getAula, reagendarAulaAPI } from '../services/api';
import { setupPushAfterLogin } from '../services/notifications';

export class DashboardProfessorPage {
  private static currentAulaId: string | null = null;
  private static autoRefreshTimer: any = null;

  static async render(): Promise<string> {
    try {
      const data = await DashboardService.loadDashboardData();
      return DashboardTemplate.render(data);
    } catch (error) {
      return this.renderErrorState();
    }
  }

  // Remove backdrops "presas" e classe modal-open para evitar tela escura
  private static cleanModalArtifacts(): void {
    try {
      document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
      document.body.classList.remove('modal-open');
      document.body.style.removeProperty('overflow');
      document.body.style.removeProperty('padding-right');
    } catch {}
  }

  static async init(): Promise<void> {
    // Aplicar otimizações de performance
    PerformanceOptimizer.applyOptimizations();
    this.setupEventListeners();
    this.setupGlobalFunctions();
    // Configurar push e ouvir mensagens do Service Worker (AULAS_UPDATED)
    try { await setupPushAfterLogin(); } catch {}
    try {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', (event: MessageEvent) => {
          const t = (event as any)?.data?.type;
          if (t === 'AULAS_UPDATED') {
            try { window.dispatchEvent(new CustomEvent('aulas-updated', { detail: (event as any).data?.payload })); } catch {}
            DashboardProfessorPage.refreshDashboard();
          }
        });
      }
    } catch {}
    // Atualiza automaticamente quando chegar push relevante
    try {
      window.addEventListener('aulas-updated', async () => {
        await DashboardProfessorPage.refreshDashboard();
      });
    } catch {}

    // Fallback 1: atualizar quando a janela ganhar foco (ex.: após reservar em outra aba)
    try {
      window.addEventListener('focus', () => {
        DashboardProfessorPage.refreshDashboard();
      });
    } catch {}

    // Fallback 2: auto-refresh periódico leve (evita depender só de push)
    try {
      if (DashboardProfessorPage.autoRefreshTimer) {
        clearInterval(DashboardProfessorPage.autoRefreshTimer);
      }
      DashboardProfessorPage.autoRefreshTimer = setInterval(() => {
        DashboardProfessorPage.refreshDashboard();
      }, 15000);
      window.addEventListener('beforeunload', () => {
        if (DashboardProfessorPage.autoRefreshTimer) clearInterval(DashboardProfessorPage.autoRefreshTimer);
      });
    } catch {}

    // Fallback 3: ouvir BroadcastChannel da página pública
    try {
      const bc = new (window as any).BroadcastChannel('aulas');
      bc.onmessage = (ev: any) => {
        const t = ev?.data?.type || ev?.data?.tipo;
        if (t === 'AULAS_UPDATED') {
          DashboardProfessorPage.refreshDashboard();
        }
      };
      window.addEventListener('beforeunload', () => {
        if (typeof bc.close === 'function') bc.close();
      });
    } catch {}
    this.setupCalendar();
    await this.refreshDashboard();
  }

  private static setupEventListeners(): void {
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
          if (modalEl && (window as any).bootstrap) {
            const modalInstance = (window as any).bootstrap.Modal.getInstance(modalEl);
            if (modalInstance) modalInstance.hide();
          }
          this.resetForms();
        });
      });
    }, 100);
  }

  private static setupGlobalFunctions(): void {
    // Funções globais para serem chamadas pelos cards
    (window as any).editarAula = this.handleEditarAula.bind(this);
    (window as any).excluirAula = this.handleExcluirAula.bind(this);
    (window as any).navegarMes = this.handleNavegarMes.bind(this);
  }

  private static setupCalendar(): void {
    // Inicializar calendário quando a aba for ativada
    const calendarioTab = document.getElementById('calendario-tab');
    if (calendarioTab) {
      calendarioTab.addEventListener('shown.bs.tab', PerformanceOptimizer.debounce(() => {
        this.initializeCalendar();
      }, 100));
    }

    // Listener para cliques em eventos do calendário
    document.addEventListener('aulaCalendarClick', (event: any) => {
      this.handleCalendarEventClick(event.detail);
    });

    // Inicialização imediata se o container já estiver no DOM
    // (Melhora UX: permite clique em eventos sem precisar alternar a aba)
    setTimeout(async () => {
      const container = document.getElementById('calendario-container');
      if (container) {
        try {
          const data = await DashboardService.loadDashboardData();
          CalendarService.initializeCalendar('calendario-container', data.aulas);

          // Inicializar tooltips do Bootstrap
          const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
          tooltipTriggerList.map(function (tooltipTriggerEl: any) {
            return new (window as any).bootstrap.Tooltip(tooltipTriggerEl);
          });
        } catch (e) {
          console.error('Falha na inicialização imediata do calendário:', e);
        }
      }
    }, 150);
  }

  private static async initializeCalendar(): Promise<void> {
    try {
      const data = await DashboardService.loadDashboardData();
      const calendarContainer = document.getElementById('calendario-container');
      
      if (calendarContainer) {
        CalendarService.initializeCalendar('calendario-container', data.aulas);
        
        // Inicializar tooltips do Bootstrap
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl: any) {
          return new (window as any).bootstrap.Tooltip(tooltipTriggerEl);
        });
      }
    } catch (error) {
      console.error('Erro ao inicializar calendário:', error);
      mostrarToast('Erro ao carregar calendário.', 'danger');
    }
  }

  private static async handleCalendarEventClick(detail: any): Promise<void> {
    try {
      const { aulaId, event } = detail;
      const ext = event.extendedProps || {};
      const startIso: string = event.start ? new Date(event.start).toISOString() : new Date().toISOString();
      const duracaoMin = event.end && event.start ? Math.max(0, Math.round((new Date(event.end).getTime() - new Date(event.start).getTime()) / 60000)) : 0;

      const aulaDetail = {
        id: String(aulaId),
        titulo: event.title || 'Aula',
        conteudo: ext.conteudo || '',
        dataHora: startIso,
        duracao: duracaoMin,
        valor: typeof ext.valor === 'number' ? ext.valor : 0,
        maxAlunos: typeof ext.maxAlunos === 'number' ? ext.maxAlunos : (Array.isArray(ext.reservas) ? ext.reservas.length : 0),
        status: ext.status || 'disponivel',
        observacoes: ext.observacoes || '',
        reservas: Array.isArray(ext.reservas) ? ext.reservas : []
      } as any;

      // Atualizar conteúdo do modal de detalhes
      const modalEl = document.getElementById('modalAulaDetail');
      const modalBody = modalEl ? modalEl.querySelector('.modal-body') as HTMLElement : null;
      if (modalBody) {
        modalBody.innerHTML = AulaDetailModal.renderContent(aulaDetail);

        // Configurar botões do modal
        this.setupDetailModalButtons(String(aulaId));

        // Mostrar modal
        const modal = new (window as any).bootstrap.Modal(modalEl);
        modal.show();
      }
    } catch (error) {
      console.error('Erro ao abrir detalhes da aula:', error);
      mostrarToast('Erro ao abrir detalhes da aula.', 'danger');
    }
  }

  private static setupDetailModalButtons(aulaId: string): void {
    // Botão editar
    const btnEditar = document.getElementById('btn-editar-aula-detail');
    if (btnEditar) {
      btnEditar.addEventListener('click', () => {
        // Fechar modal de detalhes
        const modalDetail = (window as any).bootstrap.Modal.getInstance(document.getElementById('modalAulaDetail'));
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
        const modalDetail = (window as any).bootstrap.Modal.getInstance(document.getElementById('modalAulaDetail'));
        if (modalDetail) {
          modalDetail.hide();
        }
      });
    }

    // Botão Reagendar (garante footer e cria se não existir)
    const modalEl = document.getElementById('modalAulaDetail')!;
    let footer = modalEl ? modalEl.querySelector('.modal-footer') as HTMLElement | null : null;
    if (!footer && modalEl) {
      const modalContent = modalEl.querySelector('.modal-content');
      if (modalContent) {
        footer = document.createElement('div');
        footer.className = 'modal-footer';
        modalContent.appendChild(footer);
      }
    }
    let btnReagendar = document.getElementById('btn-reagendar-aula') as HTMLButtonElement | null;
    if (!btnReagendar && footer) {
      btnReagendar = document.createElement('button');
      btnReagendar.id = 'btn-reagendar-aula';
      btnReagendar.type = 'button';
      btnReagendar.className = 'btn btn-warning me-2';
      btnReagendar.textContent = 'Reagendar';
      footer.insertBefore(btnReagendar, footer.firstChild);
    }
    if (btnReagendar) {
      btnReagendar.onclick = async () => {
        try {
          // Lê o valor do input datetime-local (opcional)
          const inputEl = document.getElementById('input-nova-data-hora') as HTMLInputElement | null;
          let novaIso: string | undefined = undefined;
          if (inputEl && inputEl.value) {
            // datetime-local retorna em formato local (e.g. 2025-08-20T15:00), converter para ISO
            const local = inputEl.value;
            const dt = new Date(local);
            if (isNaN(dt.getTime())) {
              mostrarToast('Data/hora inválida.', 'danger');
              return;
            }
            novaIso = dt.toISOString();
          }
          const resp = await reagendarAulaAPI(aulaId, novaIso);
          if (!resp.ok) {
            const err = await resp.json().catch(() => ({}));
            mostrarToast(err.error || 'Erro ao reagendar aula.', 'danger');
            return;
          }
          mostrarToast('Aula reagendada com sucesso.', 'success');
          // Notificar atualização para outras partes da UI e abas
          try { window.dispatchEvent(new CustomEvent('aulas-updated')); } catch {}
          try { const bc = new (window as any).BroadcastChannel('aulas'); bc.postMessage({ type: 'AULAS_UPDATED' }); if (typeof bc.close === 'function') bc.close(); } catch {}
          // Fechar modal e atualizar dashboard
          const modalDetail = (window as any).bootstrap.Modal.getInstance(document.getElementById('modalAulaDetail'));
          if (modalDetail) modalDetail.hide();
          await this.refreshDashboard();
        } catch (e) {
          mostrarToast('Erro ao reagendar aula.', 'danger');
        }
      };
    }
  }

  private static async handleLogout(): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/auth/logout`, {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        mostrarToast('Logout realizado com sucesso!', 'success');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      } else {
        mostrarToast('Erro ao fazer logout.', 'danger');
      }
    } catch (error) {
      mostrarToast('Erro ao conectar com o servidor.', 'danger');
    }
  }

  private static async handleCopyLink(): Promise<void> {
    const input = document.getElementById('input-link-publico') as HTMLInputElement;
    if (input) {
      const success = await DashboardService.copyToClipboard(input.value);
      if (success) {
        mostrarToast('Link copiado para a área de transferência!', 'success');
      } else {
        mostrarToast('Erro ao copiar link.', 'danger');
      }
    }
  }

  private static handleEditarPerfil(): void {
    window.location.href = '/editar-perfil';
  }

  private static showNovaAulaModal(): void {
    this.currentAulaId = null;
    // Evitar tela escura: limpar backdrops e garantir um Modal fresco
    this.cleanModalArtifacts();
    const el = document.getElementById('modalNovaAula');
    if (!el) {
      mostrarToast('Modal de Nova Aula não encontrado.', 'danger');
      return;
    }
    const Old = (window as any).bootstrap.Modal.getInstance(el);
    if (Old) Old.hide();
    const modal = new (window as any).bootstrap.Modal(el, { backdrop: true, keyboard: true, focus: true });
    modal.show();
  }

  private static async handleEditarAula(aulaId: string): Promise<void> {
    try {
      const response = await getAula(aulaId);
      if (response.ok) {
        const aula = await response.json();
        this.populateEditForm(aula);
        this.currentAulaId = aulaId;
        // Evitar tela escura: limpar backdrops e garantir um Modal fresco
        this.cleanModalArtifacts();
        const el = document.getElementById('modalEditarAula');
        if (!el) {
          mostrarToast('Modal de Edição não encontrado.', 'danger');
          return;
        }
        const Old = (window as any).bootstrap.Modal.getInstance(el);
        if (Old) Old.hide();
        const modal = new (window as any).bootstrap.Modal(el, { backdrop: true, keyboard: true, focus: true });
        modal.show();
      } else {
        let errorMsg = 'Erro ao carregar dados da aula.';
        try {
          const err = await response.json();
          errorMsg = err.error || errorMsg;
          // Se erro de autenticação, forçar logout
          if (response.status === 401) {
            mostrarToast('Sessão expirada. Faça login novamente.', 'danger');
            setTimeout(() => window.location.href = '/login', 1500);
            return;
          }
        } catch {}
        mostrarToast(errorMsg, 'danger');
      }
    } catch (error: any) {
      console.error('Erro ao editar aula:', error);
      mostrarToast(error?.message || 'Erro ao conectar com o servidor.', 'danger');
    }
  }

  // Adicionar modal de confirmação de exclusão
  private static showExcluirAulaModal(aulaId: string): void {
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
    const modal = new (window as any).bootstrap.Modal(document.getElementById('modalExcluirAula'));
    modal.show();
    const btnConfirmar = document.getElementById('btnConfirmarExcluirAula');
    if (btnConfirmar) {
      btnConfirmar.onclick = async () => {
        await this.confirmarExcluirAula(aulaId, modal);
      };
    }
  }

  private static async confirmarExcluirAula(aulaId: string, modal: any): Promise<void> {
    const success = await DashboardService.excluirAula(aulaId);
    if (success) {
      mostrarToast('Aula excluída com sucesso!', 'success');
      modal.hide();
      try {
        await this.refreshDashboard();
      } catch {
        window.location.reload();
      }
    } else {
      mostrarToast('Erro ao excluir aula.', 'danger');
    }
  }

  private static async handleExcluirAula(aulaId: string): Promise<void> {
    this.showExcluirAulaModal(aulaId);
  }



  private static handleNavegarMes(direction: number): void {
    // Re-renderiza o calendário ao navegar entre meses
    logger.debug('Navegar mês:', direction);
    // Por simplicidade, recarregamos os dados e reinicializamos
    this.initializeCalendar();
  }

  private static async handleSubmitNovaAula(event: Event): Promise<void> {
    event.preventDefault();
    const formData = this.getFormData(event.target as HTMLFormElement);
    // Garantir status 'disponivel' se não informado
    if (!formData.status) formData.status = 'disponivel';
    const validation = DashboardService.validateAulaData(formData);
    if (!validation.isValid) {
      validation.errors.forEach(error => mostrarToast(error, 'danger'));
      return;
    }
    try {
      const success = await DashboardService.criarAula(formData);
      if (success) {
        const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById('modalNovaAula'));
        if (modal) modal.hide();
        this.resetForms();
        try {
          await this.refreshDashboard();
        } catch {
          window.location.reload();
        }
      }
    } catch (error: any) {
      mostrarToast(error?.message || 'Erro ao criar aula', 'danger');
    }
  }

  private static async handleSubmitEditarAula(event: Event): Promise<void> {
    event.preventDefault();
    if (!this.currentAulaId) return;
    const formData = this.getFormData(event.target as HTMLFormElement);
    if (!formData.status) formData.status = 'disponivel';
    const validation = DashboardService.validateAulaData(formData);
    if (!validation.isValid) {
      validation.errors.forEach(error => mostrarToast(error, 'danger'));
      return;
    }
    try {
      const success = await DashboardService.editarAula(this.currentAulaId, formData);
      if (success) {
        const modalElement = document.getElementById('modalEditarAula');
        if (modalElement) {
          const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
          if (modal) modal.hide();
        }
        // Garantir limpeza de artefatos de modal (evita tela escura)
        this.cleanModalArtifacts();
        this.resetForms();
        // Feedback e recarregamento automático para refletir as alterações
        mostrarToast('Aula editada com sucesso!', 'success');
        try {
          // Primeiro, volta para a aba de Aulas
          const aulasTab = document.getElementById('aulas-tab') as HTMLButtonElement | null;
          if (aulasTab) aulasTab.click();
          // Atualiza dados e componentes
          await DashboardProfessorPage.refreshDashboard();
          // Recria/atualiza o calendário para refletir alterações sem precisar recarregar a página
          await this.initializeCalendar();
        } catch {
          setTimeout(() => window.location.reload(), 600);
        }
      }
    } catch (error: any) {
      if (error?.response?.status === 401) {
        mostrarToast('Sessão expirada. Faça login novamente.', 'danger');
        setTimeout(() => window.location.href = '/login', 1500);
        return;
      }
      mostrarToast(error?.message || 'Erro ao editar aula', 'danger');
    }
  }

  private static getFormData(form: HTMLFormElement): AulaFormData {
    const formData = new FormData(form);
    // Converter dataHora para ISO 8601 se não estiver
    let dataHora = formData.get('dataHora') as string;
    if (dataHora && !dataHora.endsWith('Z') && !dataHora.includes('T')) {
      dataHora = dataHora.replace(' ', 'T');
    }
    return {
      titulo: formData.get('titulo') as string,
      conteudo: formData.get('conteudo') as string,
      valor: parseFloat(formData.get('valor') as string),
      duracao: parseInt(formData.get('duracao') as string, 10),
  maxAlunos: Math.max(1, parseInt(formData.get('maxAlunos') as string ?? '1', 10)),
      dataHora: dataHora,
      status: (formData.get('status') as string) || 'disponivel',
      observacoes: formData.get('observacoes') as string || undefined
    };
  }

  private static populateEditForm(aula: any): void {
    const form = document.getElementById('formEditarAula') as HTMLFormElement;
    if (form) {
      // Setar ID oculto corretamente
      const idHidden = form.querySelector('#editAulaId') as HTMLInputElement | null;
      if (idHidden) {
        idHidden.value = String(aula.id || aula._id || '');
      }
      (form.querySelector('[name="titulo"]') as HTMLInputElement).value = aula.titulo;
      (form.querySelector('[name="conteudo"]') as HTMLTextAreaElement).value = aula.conteudo;
      (form.querySelector('[name="valor"]') as HTMLInputElement).value = aula.valor;
      (form.querySelector('[name="duracao"]') as HTMLInputElement).value = aula.duracao;
      (form.querySelector('[name="maxAlunos"]') as HTMLInputElement).value = aula.maxAlunos;
      // Só atualizar se o campo estiver vazio ou diferente
      const inputDataHora = form.querySelector('[name="dataHora"]') as HTMLInputElement;
      // Corrigir: garantir valor válido para datetime-local
      let dataIso = '';
      if (aula.dataHora) {
        const dt = new Date(aula.dataHora);
        if (!isNaN(dt.getTime())) {
          dataIso = dt.toISOString().slice(0, 16);
        }
      }
      inputDataHora.value = dataIso;
      inputDataHora.setAttribute('data-original', dataIso); // Para comparar depois
      (form.querySelector('[name="status"]') as HTMLSelectElement).value = aula.status;
      (form.querySelector('[name="observacoes"]') as HTMLTextAreaElement).value = aula.observacoes || '';
    }
  }

  private static resetForms(): void {
    const forms = ['formNovaAula', 'formEditarAula'];
    forms.forEach(formId => {
      const form = document.getElementById(formId) as HTMLFormElement;
      if (form) {
        form.reset();
      }
    });
    this.currentAulaId = null;
  }

  private static async refreshDashboard(): Promise<void> {
    try {
      const data = await DashboardService.loadDashboardData();
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

        // Atualizar a aba de Agendamentos, incluindo Aulas Reagendadas
        const agTab = contentContainer.querySelector('#agendamentos');
        if (agTab) {
          const cardBodies = agTab.querySelectorAll('.card .card-body');
          // Pela estrutura do template: [0] Agendamentos Realizados, [1] Aulas Reagendadas
          if (cardBodies.length >= 2) {
            const aulasReagendadas = data.aulas.filter((a: any) => (a.status || '').toLowerCase() === 'reagendada');
            const aulasNormais = data.aulas.filter((a: any) => (a.status || '').toLowerCase() !== 'reagendada');

            const renderReserva = (reserva: any) => {
              const statusBadge = (reserva.status === 'cancelado')
                ? '<span class="badge bg-danger ms-2">Cancelado</span>'
                : '<span class="badge bg-success ms-2">Agendado</span>';
              const pagamentoBadge = reserva.pagamentoEfetivado ? '<span class="badge bg-info ms-2">Pagamento Efetivado</span>' : '';
              return `<li class="list-group-item d-flex justify-content-between align-items-center">
                <span><b>${reserva.nome}</b> <span class="text-muted">${reserva.email || ''}</span><br><span class="text-muted">${reserva.telefone || ''}</span></span>
                <span>${statusBadge} ${pagamentoBadge}</span>
              </li>`;
            };

            const renderAulaAgendamento = (aula: any) => {
              const badgeClass = ((aula.status || '').toLowerCase() === 'reagendada') ? 'warning text-dark' : 'primary';
              const titulo = aula.titulo || 'Aula';
              let dataHoraStr = '';
              try { const d = new Date(aula.dataHora); dataHoraStr = isNaN(d.getTime()) ? String(aula.dataHora || '-') : d.toLocaleString(); } catch { dataHoraStr = String(aula.dataHora || '-'); }
              const reservasHtml = (Array.isArray(aula.reservas) && aula.reservas.length > 0)
                ? aula.reservas.map((r: any) => renderReserva(r)).join('')
                : '<li class="list-group-item text-muted">Nenhuma reserva</li>';
              return `
                <div class="mb-4">
                  <div class="fw-bold mb-2">${titulo} <span class="badge bg-${badgeClass} ms-2">${(aula.status || '').charAt(0).toUpperCase() + (aula.status || '').slice(1)}</span></div>
                  <div class="mb-1 text-muted"><b>Data/Hora:</b> ${dataHoraStr}</div>
                  <div class="mb-2"><b>Reservas:</b></div>
                  <ul class="list-group mb-2">${reservasHtml}</ul>
                </div>
              `;
            };

            // Preenche Agendamentos Realizados
            cardBodies[0].innerHTML = (aulasNormais.length === 0)
              ? '<div class="text-muted">Nenhum agendamento realizado.</div>'
              : aulasNormais.map(renderAulaAgendamento).join('');

            // Preenche Aulas Reagendadas
            cardBodies[1].innerHTML = (aulasReagendadas.length === 0)
              ? '<div class="text-muted">Nenhuma aula reagendada.</div>'
              : aulasReagendadas.map(renderAulaAgendamento).join('');
          }
        }
      }
      
      // Atualizar calendário se estiver ativo
      const calendar = CalendarService.getCalendar();
      if (calendar) {
        CalendarService.updateEvents(data.aulas);
      }
    } catch (error) {
      mostrarToast('Erro ao atualizar dashboard.', 'danger');
    }
  }

  private static renderAulaCard(aula: any): string {
    return AulaCard.render(aula);
  }

  private static renderErrorState(): string {
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

export async function renderDashboardProfessorPage(root: HTMLElement): Promise<void> {
  try {
    const html = await DashboardProfessorPage.render();
    root.innerHTML = html;
    await DashboardProfessorPage.init();
  } catch (error) {
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
}