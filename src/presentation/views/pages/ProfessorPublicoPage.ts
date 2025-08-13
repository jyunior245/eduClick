export class ProfessorPublicoPage {
  static render(professor: any, aulas: any[]): string {
    return `
      <div class="container-fluid bg-light min-vh-100">
        <div class="container py-4">
          <div class="card mb-4 shadow-sm">
            <div class="card-body d-flex flex-column flex-md-row align-items-center gap-4">
              <img src="${professor.fotoPerfil || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(professor.nome || 'P')}&background=0D8ABC&color=fff'}" alt="Foto de Perfil" class="rounded-circle" style="width: 120px; height: 120px; object-fit: cover; border: 3px solid #eee;">
              <div class="flex-grow-1">
                <h2 class="fw-bold mb-1">${professor.nome || 'Professor'}</h2>
                <p class="mb-1 text-muted">${professor.descricao || ''}</p>
                <div class="mb-2">
                  <span class="badge bg-primary me-1">${(professor.conteudosDominio || []).join('</span> <span class=\'badge bg-primary me-1\'>')}</span>
                </div>
                <div class="mb-1"><b>Formação:</b> ${professor.formacao || '-'}</div>
                <div class="mb-1"><b>Experiência:</b> ${professor.experiencia || '-'}</div>
                <div class="mb-1"><b>Email:</b> <a href="mailto:${professor.email}">${professor.email || '-'}</a></div>
                <div class="mb-1"><b>Telefone:</b> <a href="tel:${professor.telefone}">${professor.telefone || '-'}</a></div>
                <div class="mb-1"><b>Link público:</b> <span class="text-primary">${window.location.origin}/professor/${professor.linkUnico}</span></div>
              </div>
            </div>
          </div>
          <h2 class="fw-bold mb-4">Aulas Disponíveis de ${professor.nome || 'Professor'}</h2>
          <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            ${aulas.map(aula => `
              <div class="col">
                <div class="card h-100 shadow-sm">
                  <div class="card-body">
                    <h5 class="card-title">${aula.titulo}</h5>
                    <p class="mb-1"><b>Conteúdo:</b> ${aula.conteudo}</p>
                    <p class="mb-1"><b>Data/Hora:</b> ${new Date(aula.dataHora).toLocaleString()}</p>
                    <p class="mb-1"><b>Duração:</b> ${aula.duracaoFormatada || aula.duracao + ' min'}</p>
                    <p class="mb-1"><b>Valor:</b> R$ ${aula.valor?.toFixed(2) || '-'}</p>
                    <p class="mb-1"><b>Vagas:</b> ${aula.vagasRestantes ?? (aula.maxAlunos - (aula.alunosReservados?.length || 0))} / ${aula.maxAlunos}</p>
                    <p class="mb-1"><b>Status:</b> <span class="badge bg-${aula.status === 'disponivel' ? 'success' : aula.status === 'lotada' ? 'warning' : 'danger'}">${aula.status}</span></p>
                    <p class="mb-1"><b>Observações:</b> ${aula.observacoes || '-'}</p>
                    <button class="btn btn-primary mt-2 reservar-btn" data-aula-id="${aula.id}" ${aula.status !== 'disponivel' ? 'disabled' : ''}>Reservar</button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        <!-- Modal Reserva -->
        <div class="modal fade" id="modalReserva" tabindex="-1" aria-labelledby="modalReservaLabel" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <form id="formReserva">
                <div class="modal-header">
                  <h5 class="modal-title" id="modalReservaLabel">Reservar Aula</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
                </div>
                <div class="modal-body">
                  <input type="hidden" name="aulaId" id="reservaAulaId">
                  <div class="mb-3">
                    <label class="form-label">Seu nome</label>
                    <input type="text" class="form-control" name="alunoNome" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Seu telefone</label>
                    <input type="text" class="form-control" name="alunoTelefone" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Seu e-mail</label>
                    <input type="email" class="form-control" name="alunoEmail" required>
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                  <button type="submit" class="btn btn-primary">Reservar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;
  }
} 