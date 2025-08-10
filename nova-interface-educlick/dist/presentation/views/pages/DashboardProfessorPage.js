"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardProfessorPage = void 0;
class DashboardProfessorPage {
    static render(usuario, aulas = []) {
        return `
      <div class="container-fluid bg-light min-vh-100">
        <div class="container py-4">
          <!-- Header com navegação -->
          <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
            <div>
              <h2 class="fw-bold mb-2 d-flex align-items-center gap-2">
                Dashboard do Professor
                <button id="btn-logout" class="btn btn-sm ms-2" style="border: 2px solidrgb(255, 0, 25); background: #dc3545; color: #fff; box-shadow: 0 2px 8px rgba(220,53,69,0.08); font-weight: 600; transition: background 0.2s, color 0.2s; padding: 2px 12px; min-width: 60px;">Sair</button>
              </h2>
              <div class="d-flex align-items-center gap-3">
                <div class="d-flex align-items-center">
                  <span class="fw-semibold me-2">Link público:</span>
                  <input type="text" id="input-link-publico" class="form-control form-control-sm" style="width: 300px;" readonly value="${window.location.origin}/professor/${usuario.linkUnico || usuario.id}">
                  <button class="btn btn-outline-primary btn-sm ms-2" id="btn-copiar-link">Copiar</button>
                </div>
                <button class="btn btn-outline-secondary btn-sm" onclick="window.location.href='/editar-perfil'">
                  <i class="bi bi-gear"></i> Editar Perfil
                </button>
                <button class="btn btn-primary btn-sm ms-2" id="nova-aula-btn" data-bs-toggle="modal" data-bs-target="#modalNovaAula">
                  <i class="bi bi-plus-circle"></i> Nova Aula
                </button>
              </div>
            </div>
          </div>

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
                ${aulas.map(aula => {
            var _a, _b, _c, _d;
            return `
                  <div class="col-12 col-md-6 col-lg-4">
                    <div class="card h-100 shadow-sm">
                      <div class="card-header d-flex justify-content-between align-items-center">
                        <h6 class="card-title mb-0">${aula.titulo}</h6>
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
                      </div>
                      <div class="card-body">
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
                            <div class="fw-semibold">${(_b = aula.vagasRestantes) !== null && _b !== void 0 ? _b : (aula.maxAlunos - (((_c = aula.alunosReservados) === null || _c === void 0 ? void 0 : _c.length) || 0))} / ${aula.maxAlunos}</div>
                          </div>
                          <div class="col-6">
                            <small class="text-muted">Status</small>
                            <div><span class="badge bg-${aula.status === 'disponivel' ? 'success' : aula.status === 'lotada' ? 'warning' : 'danger'}">${aula.status}</span></div>
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
                      </div>
                    </div>
                  </div>
                `;
        }).join('')}
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
              <div class="card">
                <div class="card-header">
                  <h5 class="mb-0">Agendamentos Recebidos</h5>
                </div>
                <div class="card-body">
                  <div id="agendamentos-list">
                    <!-- Agendamentos serão carregados aqui -->
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Nova Aula -->
        <div class="modal fade" id="modalNovaAula" tabindex="-1" aria-labelledby="modalNovaAulaLabel" aria-hidden="true">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <form id="formNovaAula">
                <div class="modal-header">
                  <h5 class="modal-title" id="modalNovaAulaLabel">Nova Aula</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
                </div>
                <div class="modal-body">
                  <div class="row">
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label class="form-label">Título</label>
                        <input type="text" class="form-control" name="titulo" required>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label class="form-label">Conteúdo</label>
                        <input type="text" class="form-control" name="conteudo" required>
                      </div>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-4">
                      <div class="mb-3">
                        <label class="form-label">Valor (R$)</label>
                        <input type="number" class="form-control" name="valor" step="0.01" required>
                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="mb-3">
                        <label class="form-label">Duração (minutos)</label>
                        <input type="number" class="form-control" name="duracao" required>
                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="mb-3">
                        <label class="form-label">Vagas</label>
                        <input type="number" class="form-control" name="maxAlunos" min="1" value="1" required>
                      </div>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label class="form-label">Data/Hora</label>
                        <input type="datetime-local" class="form-control" name="dataHora" required>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label class="form-label">Status</label>
                        <select class="form-control" name="status">
                          <option value="disponivel">Disponível</option>
                          <option value="lotada">Lotada</option>
                          <option value="cancelada">Cancelada</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Observações</label>
                    <textarea class="form-control" name="observacoes" rows="3"></textarea>
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                  <button type="submit" class="btn btn-primary">Salvar</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Modal Editar Aula -->
        <div class="modal fade" id="modalEditarAula" tabindex="-1" aria-labelledby="modalEditarAulaLabel" aria-hidden="true">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <form id="formEditarAula">
                <div class="modal-header">
                  <h5 class="modal-title" id="modalEditarAulaLabel">Editar Aula</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
                </div>
                <div class="modal-body">
                  <input type="hidden" name="aulaId" id="editAulaId">
                  <div class="row">
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label class="form-label">Título</label>
                        <input type="text" class="form-control" name="titulo" id="editTitulo" required>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label class="form-label">Conteúdo</label>
                        <input type="text" class="form-control" name="conteudo" id="editConteudo" required>
                      </div>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-4">
                      <div class="mb-3">
                        <label class="form-label">Valor (R$)</label>
                        <input type="number" class="form-control" name="valor" id="editValor" step="0.01" required>
                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="mb-3">
                        <label class="form-label">Duração (minutos)</label>
                        <input type="number" class="form-control" name="duracao" id="editDuracao" required>
                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="mb-3">
                        <label class="form-label">Vagas</label>
                        <input type="number" class="form-control" name="maxAlunos" id="editMaxAlunos" min="1" required>
                      </div>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label class="form-label">Data/Hora</label>
                        <input type="datetime-local" class="form-control" name="dataHora" id="editDataHora" required>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label class="form-label">Status</label>
                        <select class="form-control" name="status" id="editStatus">
                          <option value="disponivel">Disponível</option>
                          <option value="lotada">Lotada</option>
                          <option value="cancelada">Cancelada</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Observações</label>
                    <textarea class="form-control" name="observacoes" id="editObservacoes" rows="3"></textarea>
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                  <button type="submit" class="btn btn-primary">Salvar Alterações</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Modal Detalhes da Aula -->
        <div class="modal fade" id="modalAulaDetail" tabindex="-1" aria-labelledby="modalAulaDetailLabel" aria-hidden="true">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="modalAulaDetailLabel">Detalhes da Aula</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
              </div>
              <div class="modal-body" id="modalAulaDetailBody">
                <!-- Conteúdo será carregado dinamicamente -->
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-primary" id="btn-editar-aula-detail">Editar Aula</button>
                <button type="button" class="btn btn-secondary" id="btn-fechar-detail">Fechar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    }
}
exports.DashboardProfessorPage = DashboardProfessorPage;
