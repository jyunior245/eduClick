import { BaseTemplate } from './BaseTemplate';
import { Button } from '../components/ui/Button';
import { AulaCard, AulaCardData } from '../components/ui/AulaCard';
import { AulaModal } from '../components/modals/AulaModal';
import { AulaDetailModal } from 'client/components/modals/AulaDetailModal';

export interface DashboardData {
  usuario: any;
  aulas: AulaCardData[];
}

export class DashboardTemplate {
  static render(data: DashboardData): string {
    const header = this.renderHeader(data.usuario);
    const content = this.renderContent(data.aulas);
    const modals = this.renderModals();

    return `
      ${BaseTemplate.render({
        title: 'Dashboard do Professor',
        content,
        header
      })}
      ${modals}
    `;
  }

  private static renderHeader(usuario: any): string {
    const logoutButton = Button.render({
      text: 'Sair',
      variant: 'outline-danger',
      size: 'sm',
      className: 'ms-2',
      id: 'btn-logout'
    });

    const novaAulaButton = Button.render({
      text: 'Nova Aula',
      variant: 'primary',
      size: 'sm',
      className: 'ms-2',
      id: 'nova-aula-btn',
      icon: 'bi bi-plus-circle'
    });

    const editarPerfilButton = Button.render({
      text: 'Editar Perfil',
      variant: 'outline-secondary',
      size: 'sm',
      icon: 'bi bi-gear',
      id: 'btn-editar-perfil'
    });

    return `
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 class="fw-bold mb-2 d-flex align-items-center gap-2">
            Dashboard do Professor
            ${logoutButton}
          </h2>
          <div class="d-flex align-items-center gap-3">
            <div class="d-flex align-items-center">
              <span class="fw-semibold me-2">Link público:</span>
              <input type="text" id="input-link-publico" class="form-control form-control-sm" style="width: 300px;" readonly value="${location.origin}/professor/${usuario.linkUnico || usuario.id}">
              <button class="btn btn-outline-primary btn-sm ms-2" id="btn-copiar-link">Copiar</button>
            </div>
            ${editarPerfilButton}
            ${novaAulaButton}
          </div>
        </div>
      </div>
    `;
  }

  private static renderContent(aulas: AulaCardData[]): string {
    // Separar aulas reagendadas e normais
    const aulasReagendadas = aulas.filter(a => a.status === 'reagendada');
    const aulasNormais = aulas.filter(a => a.status !== 'reagendada');

    const aulasHtml = aulas.length > 0 
      ? aulas.map(aula => `
          <div class="col-12 col-md-6 col-lg-4">
            ${AulaCard.render(aula)}
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

    return `
      <!-- Navegação por abas -->
      <ul class="nav nav-tabs mb-4" id="dashboardTabs" role="tablist">
        <li class="nav-item" role="presentation">
          <button class="nav-link active" id="aulas-tab" data-bs-toggle="tab" data-bs-target="#aulas" type="button" role="tab">
            <i class="bi bi-calendar3"></i> Minhas Aulas
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="calendario-tab" data-bs-toggle="tab" data-bs-target="#calendario" type="button" role="tab">
            <i class="bi bi-calendar-month"></i> Calendário
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="agendamentos-tab" data-bs-toggle="tab" data-bs-target="#agendamentos" type="button" role="tab">
            <i class="bi bi-people"></i> Agendamentos
          </button>
        </li>
      </ul>

      <!-- Conteúdo das abas -->
      <div class="tab-content" id="dashboardTabContent">
        <!-- Aba: Minhas Aulas -->
        <div class="tab-pane fade show active" id="aulas" role="tabpanel">
          <div class="row g-4">
            ${aulasHtml}
          </div>
        </div>

        <!-- Aba: Calendário -->
        <div class="tab-pane fade" id="calendario" role="tabpanel">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Calendário de Aulas</h5>
              <div class="btn-group">
                <button class="btn btn-outline-secondary btn-sm" onclick="navegarMes(-1)">
                  <i class="bi bi-chevron-left"></i>
                </button>
                <button class="btn btn-outline-secondary btn-sm" onclick="navegarMes(1)">
                  <i class="bi bi-chevron-right"></i>
                </button>
              </div>
            </div>
            <div class="card-body">
              <div id="calendario-container">
                <!-- Calendário será renderizado aqui -->
              </div>
            </div>
          </div>
        </div>

        <!-- Aba: Agendamentos -->
        <div class="tab-pane fade" id="agendamentos" role="tabpanel">
          <div class="card mb-4">
            <div class="card-header bg-primary text-white">
              <h5 class="mb-0"><i class="bi bi-list-check me-2"></i>Agendamentos Realizados</h5>
            </div>
            <div class="card-body">
              ${aulasNormais.length === 0 ? '<div class="text-muted">Nenhum agendamento realizado.</div>' : aulasNormais.map(aula => renderAulaAgendamento(aula)).join('')}
            </div>
          </div>
          <div class="card">
            <div class="card-header bg-warning text-dark">
              <h5 class="mb-0"><i class="bi bi-arrow-repeat me-2"></i>Aulas Reagendadas</h5>
            </div>
            <div class="card-body">
              ${aulasReagendadas.length === 0 ? '<div class="text-muted">Nenhuma aula reagendada.</div>' : aulasReagendadas.map(aula => renderAulaAgendamento(aula)).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    // Função auxiliar para exibir reservas de cada aula
    function renderAulaAgendamento(aula: any): string {
      return `
        <div class="mb-4">
          <div class="fw-bold mb-2">${aula.titulo} <span class="badge bg-${aula.status === 'reagendada' ? 'warning text-dark' : 'primary'} ms-2">${aula.status.charAt(0).toUpperCase() + aula.status.slice(1)}</span></div>
          <div class="mb-1 text-muted"><b>Data/Hora:</b> ${new Date(aula.dataHora).toLocaleString()}</div>
          <div class="mb-2"><b>Reservas:</b></div>
          <ul class="list-group mb-2">
            ${(aula.reservas && aula.reservas.length > 0) ? aula.reservas.map((r: any) => renderReserva(r)).join('') : '<li class="list-group-item text-muted">Nenhuma reserva</li>'}
          </ul>
        </div>
      `;
    }
    function renderReserva(reserva: any): string {
      let statusBadge = '';
      if (reserva.status === 'cancelado') {
        statusBadge = '<span class="badge bg-danger ms-2">Cancelado</span>';
      } else {
        statusBadge = '<span class="badge bg-success ms-2">Agendado</span>';
      }
      let pagamentoBadge = reserva.pagamentoEfetivado ? '<span class="badge bg-info ms-2">Pagamento Efetivado</span>' : '';
      return `<li class="list-group-item d-flex justify-content-between align-items-center">
        <span><b>${reserva.nome}</b> <span class="text-muted">${reserva.email}</span><br><span class="text-muted">${reserva.telefone || ''}</span></span>
        <span>${statusBadge} ${pagamentoBadge}</span>
      </li>`;
    }
  }

  private static renderModals(): string {
    return `
      ${AulaModal.renderNovaAula()}
      ${AulaModal.renderEditarAula({})}
      ${AulaDetailModal.render({
        id: '',
        titulo: '',
        conteudo: '',
        dataHora: '',
        duracao: 0,
        valor: 0,
        maxAlunos: 0,
        status: '',
        reservas: []
      })}
    `;
  }
} 