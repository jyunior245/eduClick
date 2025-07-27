import { Card } from './Card';
import { Button } from './Button';

export interface AulaCardData {
  id: string;
  titulo: string;
  conteudo: string;
  dataHora: string;
  duracao: number;
  duracaoFormatada?: string;
  valor: number;
  maxAlunos: number;
  vagasRestantes?: number;
  status: string;
  observacoes?: string;
  reservas?: Array<{
    nome: string;
    telefone: string;
    email: string;
  }>;
}

export class AulaCard {
  static render(aula: AulaCardData): string {
    const headerActions = `
      <div class="dropdown">
        <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
          <i class="bi bi-three-dots"></i>
        </button>
        <ul class="dropdown-menu">
          <li><a class="dropdown-item" href="#" onclick="editarAula('${aula.id}')">
            <i class="bi bi-pencil"></i> Editar
          </a></li>
          <li><a class="dropdown-item" href="#" onclick="excluirAula('${aula.id}')">
            <i class="bi bi-trash"></i> Excluir
          </a></li>
        </ul>
      </div>
    `;

    const content = `
      <div class="row mb-3">
        <div class="col-6">
          <small class="text-muted">Conteúdo</small>
          <div class="fw-semibold">${aula.conteudo}</div>
        </div>
        <div class="col-6">
          <small class="text-muted">Data/Hora</small>
          <div class="fw-semibold">${new Date(aula.dataHora).toLocaleString()}</div>
        </div>
      </div>
      <div class="row mb-3">
        <div class="col-6">
          <small class="text-muted">Duração</small>
          <div class="fw-semibold">${aula.duracaoFormatada || aula.duracao + ' min'}</div>
        </div>
        <div class="col-6">
          <small class="text-muted">Valor</small>
          <div class="fw-semibold text-success">R$ ${aula.valor?.toFixed(2) || '-'}</div>
        </div>
      </div>
      <div class="row mb-3">
        <div class="col-6">
          <small class="text-muted">Vagas</small>
          <div class="fw-semibold">${aula.vagasRestantes ?? (aula.maxAlunos - (aula.reservas?.length || 0))} / ${aula.maxAlunos}</div>
        </div>
        <div class="col-6">
          <small class="text-muted">Status</small>
          <div><span class="badge bg-${this.getStatusColor(aula.status)}">${aula.status}</span></div>
        </div>
      </div>
      ${aula.observacoes ? `
        <div class="mb-3">
          <small class="text-muted">Observações</small>
          <div class="fw-semibold">${aula.observacoes}</div>
        </div>
      ` : ''}
      ${this.renderReservasAccordion(aula)}
    `;

    return Card.render({
      title: aula.titulo,
      content,
      headerActions,
      className: 'h-100'
    });
  }

  private static getStatusColor(status: string): string {
    switch (status) {
      case 'disponivel': return 'success';
      case 'lotada': return 'warning';
      case 'cancelada': return 'danger';
      default: return 'secondary';
    }
  }

  private static renderReservasAccordion(aula: AulaCardData): string {
    const reservasCount = aula.reservas?.length || 0;
    
    return `
      <div class="accordion" id="accordion-${aula.id}">
        <div class="accordion-item">
          <h2 class="accordion-header">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${aula.id}">
              <i class="bi bi-people"></i> Reservas (${reservasCount})
            </button>
          </h2>
          <div id="collapse-${aula.id}" class="accordion-collapse collapse" data-bs-parent="#accordion-${aula.id}">
            <div class="accordion-body p-0">
              <ul class="list-group list-group-flush">
                ${this.renderReservasList(aula.reservas || [], aula.id)}
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private static renderReservasList(reservas: Array<{ nome: string; telefone: string; email: string }>, aulaId?: string): string {
    if (reservas.length === 0) {
      return '<li class="list-group-item text-muted">Nenhuma reserva</li>';
    }

    return reservas.map(reserva => `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <div>
          <div class="fw-semibold">${reserva.nome}</div>
          <small class="text-muted">${reserva.telefone}</small>
          ${reserva.email ? `<br><small class="text-muted">${reserva.email}</small>` : ''}
        </div>
        <button class="btn btn-sm btn-outline-danger" onclick="cancelarReserva('${aulaId}', '${reserva.nome}', '${reserva.telefone}')">
          <i class="bi bi-x-circle"></i>
        </button>
      </li>
    `).join('');
  }
} 