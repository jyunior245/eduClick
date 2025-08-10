"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfessorPublicoTemplate = void 0;
class ProfessorPublicoTemplate {
    static render(params = {}) {
        const professor = params.professor || {};
        const aulas = params.aulas || [];
        return `
      <div class="container py-5">
        <div class="row justify-content-center">
          <div class="col-lg-10">
            <div class="card shadow-lg border-0 mb-4">
              <div class="card-body d-flex flex-column flex-md-row align-items-md-center gap-4 p-4">
                <div class="text-center flex-shrink-0">
                  <i class="bi bi-person-circle display-1 text-primary"></i>
                  <h2 class="fw-bold mt-2 mb-1">${professor.nome || 'Professor(a)'}</h2>
                  <div class="text-muted mb-3 fs-5">${professor.especialidade || ''}</div>
                </div>
                <div class="flex-fill">
                  <div class="row g-2">
                    <div class="col-12 col-md-6">
                      <div class="mb-2"><i class="bi bi-mortarboard me-2 text-secondary"></i><b>Formação:</b> <span class="text-dark">${professor.formacao || '-'}</span></div>
                      <div class="mb-2"><i class="bi bi-briefcase me-2 text-secondary"></i><b>Experiência:</b> <span class="text-dark">${professor.experiencia || '-'}</span></div>
                    </div>
                    <div class="col-12 col-md-6">
                      <div class="mb-2"><i class="bi bi-envelope me-2 text-secondary"></i><b>E-mail:</b> <span class="text-dark">${professor.email || '-'}</span></div>
                      <div class="mb-2"><i class="bi bi-telephone me-2 text-secondary"></i><b>Telefone:</b> <span class="text-dark">${professor.telefone || '-'}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="card shadow-sm">
              <div class="card-header bg-primary text-white">
                <h4 class="mb-0"><i class="bi bi-calendar3"></i> Aulas Disponíveis</h4>
              </div>
              <div class="card-body">
                ${params.errorMessage ? `<div class='alert alert-danger'>${params.errorMessage}</div>` : ''}
                ${params.successMessage ? `<div class='alert alert-success'>${params.successMessage}</div>` : ''}
                <div class="row g-4">
                  ${aulas.length > 0 ? aulas.map(aula => {
            var _a, _b;
            return `
                    <div class="col-12 col-md-6 col-lg-4">
                      <div class="card h-100 border-primary">
                        <div class="card-body">
                          <h5 class="card-title">${aula.titulo}</h5>
                          <div><b>Conteúdo:</b> ${aula.conteudo}</div>
                          <div><b>Data/Hora:</b> ${new Date(aula.dataHora).toLocaleString()}</div>
                          <div><b>Duração:</b> ${aula.duracao} min</div>
                          <div><b>Valor:</b> R$ ${((_a = aula.valor) === null || _a === void 0 ? void 0 : _a.toFixed(2)) || '-'}</div>
                          <div><b>Vagas:</b> ${aula.maxAlunos - (((_b = aula.reservas) === null || _b === void 0 ? void 0 : _b.length) || 0)} / ${aula.maxAlunos}</div>
                          <div class="mt-3">
                            <button class="btn btn-outline-primary w-100" onclick="${params.onReservar || 'handleReservarAula'}('${aula.id}')">
                              <i class="bi bi-calendar-plus"></i> Reservar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  `;
        }).join('') : `<div class='col-12 text-center text-muted'>Nenhuma aula disponível no momento.</div>`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    }
}
exports.ProfessorPublicoTemplate = ProfessorPublicoTemplate;
