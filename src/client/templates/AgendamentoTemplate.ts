export interface AgendamentoTemplateParams {
  professor?: any;
  onSubmit?: string;
  errorMessage?: string;
  successMessage?: string;
}

export class AgendamentoTemplate {
  static render(params: AgendamentoTemplateParams = {}): string {
    const professor = params.professor || {};
    return `
      <div class="container py-5">
        <div class="row justify-content-center">
          <div class="col-md-7 col-lg-6">
            <div class="card shadow-sm">
              <div class="card-header bg-primary text-white">
                <h3 class="mb-0">
                  <i class="bi bi-calendar-plus"></i> Agendar Aula
                </h3>
              </div>
              <div class="card-body p-4">
                <div class="mb-3 text-center">
                  <h5 class="fw-bold mb-1">${professor.nome || 'Professor(a)'}</h5>
                  <div class="text-muted">${professor.especialidade || ''}</div>
                </div>
                ${params.errorMessage ? `<div class='alert alert-danger'>${params.errorMessage}</div>` : ''}
                ${params.successMessage ? `<div class='alert alert-success'>${params.successMessage}</div>` : ''}
                <form id="form-agendamento" onsubmit="${params.onSubmit || 'handleAgendamentoSubmit'}(event)">
                  <div class="mb-3">
                    <label for="nome" class="form-label">Seu Nome</label>
                    <input type="text" class="form-control" id="nome" name="nome" required>
                  </div>
                  <div class="mb-3">
                    <label for="telefone" class="form-label">Telefone</label>
                    <input type="tel" class="form-control" id="telefone" name="telefone" required placeholder="(11) 99999-9999">
                  </div>
                  <div class="mb-3">
                    <label for="dataHora" class="form-label">Data e Hora</label>
                    <input type="datetime-local" class="form-control" id="dataHora" name="dataHora" required>
                  </div>
                  <button type="submit" class="btn btn-primary w-100">
                    <i class="bi bi-calendar-check"></i> Agendar
                  </button>
                </form>
                <div class="mt-3 text-center">
                  <a href="/professor/${professor.id || ''}">Voltar ao perfil do professor</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
} 
