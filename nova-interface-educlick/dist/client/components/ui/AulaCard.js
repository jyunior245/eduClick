"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AulaCard = void 0;
const Card_1 = require("./Card");
class AulaCard {
    static render(aula) {
        var _a, _b, _c, _d;
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
          <div class="fw-semibold text-success">R$ ${((_a = aula.valor) === null || _a === void 0 ? void 0 : _a.toFixed(2)) || '-'}</div>
        </div>
      </div>
      <div class="row mb-3">
        <div class="col-6">
          <small class="text-muted">Vagas</small>
          <div class="fw-semibold">${(_b = aula.vagasRestantes) !== null && _b !== void 0 ? _b : (aula.maxAlunos - (((_c = aula.reservas) === null || _c === void 0 ? void 0 : _c.length) || 0))} / ${aula.maxAlunos}</div>
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
      <!-- Informação de vagas -->
      <div class="mt-3">
        <small class="text-muted">
          <i class="bi bi-people"></i> Vagas: ${((_d = aula.reservas) === null || _d === void 0 ? void 0 : _d.length) || 0}/${aula.maxAlunos}
        </small>
      </div>
    `;
        return Card_1.Card.render({
            title: aula.titulo,
            content,
            headerActions,
            className: 'h-100'
        });
    }
    static getStatusColor(status) {
        switch (status) {
            case 'disponivel': return 'success';
            case 'lotada': return 'warning';
            case 'cancelada': return 'danger';
            case 'reagendada': return 'info'; // Adicionado para reagendada
            default: return 'secondary';
        }
    }
}
exports.AulaCard = AulaCard;
