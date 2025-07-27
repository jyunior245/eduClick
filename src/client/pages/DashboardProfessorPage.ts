import { DashboardTemplate, DashboardData } from '../templates/DashboardTemplate';
import { DashboardService, AulaFormData } from '../services/DashboardService';
import { mostrarToast } from '../components/Toast';
import { CalendarService } from '../services/calendarService';
import { AulaDetailModal } from '../components/modals/AulaDetailModal';
import { PerformanceOptimizer } from '../utils/perfomance';
import { AulaCard } from '../components/ui/AulaCard';
import { logger } from '../utils/logger';
import { API_BASE } from '../services/api';

export class DashboardProfessorPage {
  private static currentAulaId: string | null = null;

  static async render(): Promise<string> {
    try {
      const data = await DashboardService.loadDashboardData();
      return DashboardTemplate.render(data);
    } catch (error) {
      return this.renderErrorState();
    }
  }

  static async init(): Promise<void> {
    // Aplicar otimizações de performance
    PerformanceOptimizer.applyOptimizations();
    
    this.setupEventListeners();
    this.setupGlobalFunctions();
    this.setupCalendar();
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
    // Atualizar para passar aulaId no cancelarReserva
    (window as any).cancelarReserva = this.handleCancelarReserva.bind(this);
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
      const { aulaId } = detail;
      
      // Buscar dados da aula
      const response = await fetch(`/api/aulas/${aulaId}`, { credentials: 'include' });
      if (response.ok) {
        const aula = await response.json();
        
        // Atualizar modal de detalhes
        const modalContainer = document.getElementById('modalAulaDetail');
        if (modalContainer) {
          modalContainer.innerHTML = AulaDetailModal.render(aula);
          
          // Configurar botões do modal
          this.setupDetailModalButtons(aulaId);
          
          // Mostrar modal
          const modal = new (window as any).bootstrap.Modal(modalContainer);
          modal.show();
        }
      } else {
        mostrarToast('Erro ao carregar detalhes da aula.', 'danger');
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
    const modal = new (window as any).bootstrap.Modal(document.getElementById('modalNovaAula'));
    modal.show();
  }

  private static async handleEditarAula(aulaId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/aulas/${aulaId}`, { credentials: 'include' });
      if (response.ok) {
        const aula = await response.json();
        this.populateEditForm(aula);
        this.currentAulaId = aulaId;
        const modal = new (window as any).bootstrap.Modal(document.getElementById('modalEditarAula'));
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
      await this.refreshDashboard();
    } else {
      mostrarToast('Erro ao excluir aula.', 'danger');
    }
  }

  private static async handleExcluirAula(aulaId: string): Promise<void> {
    this.showExcluirAulaModal(aulaId);
  }

  // Atualizar assinatura para receber aulaId
  private static async handleCancelarReserva(aulaId: string, nome: string, telefone: string): Promise<void> {
    if (confirm(`Tem certeza que deseja cancelar a reserva de ${nome}?`)) {
      try {
        const response = await fetch(`${API_BASE}/aulas/${aulaId}/cancelar-reserva`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ nome, telefone })
        });

        if (response.ok) {
          mostrarToast('Reserva cancelada com sucesso!', 'success');
          await this.refreshDashboard();
        } else {
          const err = await response.json();
          mostrarToast('Erro ao cancelar reserva: ' + (err.error || 'Erro desconhecido'), 'danger');
        }
      } catch (error) {
        mostrarToast('Erro ao conectar com o servidor.', 'danger');
      }
    }
  }

  private static handleNavegarMes(direction: number): void {
    // Implementação do calendário será adicionada posteriormente
    logger.debug('Navegar mês:', direction);
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
        modal.hide();
        this.resetForms();
        await this.refreshDashboard();
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
      const payload = {
        ...formData,
        valor: parseFloat(formData.valor.toString()),
        duracao: parseInt(formData.duracao.toString(), 10),
        maxAlunos: parseInt(formData.maxAlunos.toString(), 10),
        dataHora: formData.dataHora.includes('T') ? formData.dataHora : new Date(formData.dataHora).toISOString(),
        status: formData.status || 'disponivel',
      };
      const success = await DashboardService.editarAula(this.currentAulaId, payload);
      if (success) {
        const modalElement = document.getElementById('modalEditarAula');
        if (modalElement) {
          const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
          if (modal) {
            modal.hide();
          }
        }
        this.resetForms();
        await this.refreshDashboard();
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
      maxAlunos: parseInt(formData.get('maxAlunos') as string, 10),
      dataHora: dataHora,
      status: (formData.get('status') as string) || 'disponivel',
      observacoes: formData.get('observacoes') as string || undefined
    };
  }

  private static populateEditForm(aula: any): void {
    const form = document.getElementById('formEditarAula') as HTMLFormElement;
    if (form) {
      (form.querySelector('[name="titulo"]') as HTMLInputElement).value = aula.titulo;
      (form.querySelector('[name="conteudo"]') as HTMLTextAreaElement).value = aula.conteudo;
      (form.querySelector('[name="valor"]') as HTMLInputElement).value = aula.valor;
      (form.querySelector('[name="duracao"]') as HTMLInputElement).value = aula.duracao;
      (form.querySelector('[name="maxAlunos"]') as HTMLInputElement).value = aula.maxAlunos;
      // Formatar a data para o input datetime-local
      const dataHora = new Date(aula.dataHora);
      const dataFormatada = dataHora.toISOString().slice(0, 16); // Formato YYYY-MM-DDTHH:MM
      (form.querySelector('[name="dataHora"]') as HTMLInputElement).value = dataFormatada;
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