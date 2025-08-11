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
    status?: string;
  }>;
}

export class AulaCard {
  static render(aula: AulaCardData): string {
    const reservas = Array.isArray(aula.reservas) ? aula.reservas : [];
    const reservasAtivas = reservas.filter(r => String(r?.status || '').toLowerCase() === 'ativa');
    const vagasRestantes = (typeof aula.vagasRestantes === 'number')
      ? aula.vagasRestantes
      : (aula.maxAlunos - reservasAtivas.length);
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
          <div class="fw-semibold">${vagasRestantes} / ${aula.maxAlunos}</div>
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
      case 'reagendada': return 'info'; // Adicionado para reagendada
      default: return 'secondary';
    }
  }
}