"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AulaDetailModal = void 0;
const Modal_1 = require("./Modal");
const Button_1 = require("../ui/Button");
class AulaDetailModal {
    static render(aula) {
        const dataHora = new Date(aula.dataHora);
        const duracaoFormatada = this.formatDuracao(aula.duracao);
        const statusBadge = this.getStatusBadge(aula.status);
        const content = `
      <div class="row">
        <div class="col-md-6">
          <div class="mb-3">
            <label class="form-label fw-bold">Título</label>
            <div class="form-control-plaintext">${aula.titulo}</div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="mb-3">
            <label class="form-label fw-bold">Status</label>
            <div class="form-control-plaintext">${statusBadge}</div>
          </div>
        </div>
      </div>
      
      <div class="mb-3">
        <label class="form-label fw-bold">Conteúdo</label>
        <div class="form-control-plaintext">${aula.conteudo}</div>
      </div>
      
      <div class="row">
        <div class="col-md-4">
          <div class="mb-3">
            <label class="form-label fw-bold">Data/Hora</label>
            <div class="form-control-plaintext">${dataHora.toLocaleString()}</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="mb-3">
            <label class="form-label fw-bold">Duração</label>
            <div class="form-control-plaintext">${duracaoFormatada}</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="mb-3">
            <label class="form-label fw-bold">Valor</label>
            <div class="form-control-plaintext text-success fw-bold">R$ ${aula.valor.toFixed(2)}</div>
          </div>
        </div>
      </div>
      
      <div class="row">
        <div class="col-md-6">
          <div class="mb-3">
            <label class="form-label fw-bold">Vagas</label>
            <div class="form-control-plaintext">${aula.reservas.length} / ${aula.maxAlunos}</div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="mb-3">
            <label class="form-label fw-bold">Vagas Restantes</label>
            <div class="form-control-plaintext">${aula.maxAlunos - aula.reservas.length}</div>
          </div>
        </div>
      </div>
      
      ${aula.observacoes ? `
        <div class="mb-3">
          <label class="form-label fw-bold">Observações</label>
          <div class="form-control-plaintext">${aula.observacoes}</div>
        </div>
      ` : ''}
      
      <div class="mb-3">
        <label class="form-label fw-bold">Reservas (${aula.reservas.length})</label>
        <div class="border rounded p-3" style="max-height: 200px; overflow-y: auto;">
          ${aula.reservas.length > 0 ?
            aula.reservas.map(reserva => this.renderReserva(reserva)).join('') :
            '<div class="text-muted">Nenhuma reserva realizada.</div>'}
        </div>
      </div>
    `;
        const footer = `
      ${Button_1.Button.render({
            text: 'Editar Aula',
            type: 'button',
            variant: 'primary',
            className: 'me-2',
            id: 'btn-editar-aula-detail'
        })}
      ${Button_1.Button.render({
            text: 'Fechar',
            type: 'button',
            variant: 'secondary',
            id: 'btn-fechar-detail'
        })}
    `;
        return Modal_1.Modal.renderFormModal({
            id: 'modalAulaDetail',
            title: 'Detalhes da Aula',
            content,
            footer,
            formId: 'formAulaDetail',
            size: 'lg'
        });
    }
    static renderContent(aula) {
        const dataHora = new Date(aula.dataHora);
        const duracaoFormatada = this.formatDuracao(aula.duracao);
        const statusBadge = this.getStatusBadge(aula.status);
        return `
      <div class="row">
        <div class="col-md-6">
          <div class="mb-3">
            <label class="form-label fw-bold">Título</label>
            <div class="form-control-plaintext">${aula.titulo}</div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="mb-3">
            <label class="form-label fw-bold">Status</label>
            <div class="form-control-plaintext">${statusBadge}</div>
          </div>
        </div>
      </div>
      
      <div class="mb-3">
        <label class="form-label fw-bold">Conteúdo</label>
        <div class="form-control-plaintext">${aula.conteudo}</div>
      </div>
      
      <div class="row">
        <div class="col-md-4">
          <div class="mb-3">
            <label class="form-label fw-bold">Data/Hora</label>
            <div class="form-control-plaintext">${dataHora.toLocaleString()}</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="mb-3">
            <label class="form-label fw-bold">Duração</label>
            <div class="form-control-plaintext">${duracaoFormatada}</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="mb-3">
            <label class="form-label fw-bold">Valor</label>
            <div class="form-control-plaintext text-success fw-bold">R$ ${aula.valor.toFixed(2)}</div>
          </div>
        </div>
      </div>
      
      <div class="row">
        <div class="col-md-6">
          <div class="mb-3">
            <label class="form-label fw-bold">Vagas</label>
            <div class="form-control-plaintext">${aula.reservas.length} / ${aula.maxAlunos}</div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="mb-3">
            <label class="form-label fw-bold">Vagas Restantes</label>
            <div class="form-control-plaintext">${aula.maxAlunos - aula.reservas.length}</div>
          </div>
        </div>
      </div>
      
      ${aula.observacoes ? `
        <div class="mb-3">
          <label class="form-label fw-bold">Observações</label>
          <div class="form-control-plaintext">${aula.observacoes}</div>
        </div>
      ` : ''}
      
      <div class="mb-3">
        <label class="form-label fw-bold">Reservas (${aula.reservas.length})</label>
        <div class="border rounded p-3" style="max-height: 200px; overflow-y: auto;">
          ${aula.reservas.length > 0 ?
            aula.reservas.map(reserva => this.renderReserva(reserva)).join('') :
            '<div class="text-muted">Nenhuma reserva realizada.</div>'}
        </div>
      </div>
    `;
    }
    static formatDuracao(minutos) {
        const horas = Math.floor(minutos / 60);
        const mins = minutos % 60;
        if (horas > 0) {
            return `${horas}h ${mins > 0 ? `${mins}min` : ''}`.trim();
        }
        return `${mins}min`;
    }
    static getStatusBadge(status) {
        const statusMap = {
            'disponivel': { class: 'bg-success', label: 'Disponível' },
            'lotada': { class: 'bg-primary', label: 'Lotada' },
            'cancelada': { class: 'bg-danger', label: 'Cancelada' },
            'reagendada': { class: 'bg-warning text-dark', label: 'Reagendada' }
        };
        const statusInfo = statusMap[status] || { class: 'bg-secondary', label: status };
        return `<span class="badge ${statusInfo.class}">${statusInfo.label}</span>`;
    }
    static renderReserva(reserva) {
        const statusBadge = reserva.status === 'cancelado'
            ? '<span class="badge bg-danger">Cancelado</span>'
            : '<span class="badge bg-success">Agendado</span>';
        const pagamentoBadge = reserva.pagamentoEfetivado
            ? '<span class="badge bg-info ms-1">Pagamento Efetivado</span>'
            : '';
        return `
      <div class="d-flex justify-content-between align-items-center mb-2 p-2 border-bottom">
        <div>
          <strong>${reserva.nome}</strong><br>
          <small class="text-muted">${reserva.email} | ${reserva.telefone}</small>
        </div>
        <div>
          ${statusBadge} ${pagamentoBadge}
        </div>
      </div>
    `;
    }
}
exports.AulaDetailModal = AulaDetailModal;
