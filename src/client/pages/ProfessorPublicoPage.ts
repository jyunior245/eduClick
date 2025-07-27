import { ProfessorPublicoTemplate } from '../templates/ProfessorPublicoTemplate';
import { ProfessorPublicoService } from '../services/ProfessorPublicoService';
import { mostrarToast } from '../components/Toast';
import { getProfessorPublico, getAulasPublicas, reservarAulaPublica, getPerfilEAulasPublicas } from '../services/api';
import { API_BASE } from '../services/api';

let professorCache: any = null;
let aulasCache: any[] = [];
let linkUnicoCache: string = '';

export async function renderProfessorPublicoPage(root: HTMLElement, linkUnico: string): Promise<void> {
  linkUnicoCache = linkUnico;
  try {
    // Buscar perfil e aulas juntos via endpoint correto
    const data = await ProfessorPublicoService.carregarPerfilEAulas(linkUnico);
    professorCache = data.professor;
    aulasCache = data.aulas;
    root.innerHTML = ProfessorPublicoTemplate.render({ professor: professorCache, aulas: aulasCache });
    root.innerHTML += renderAgendamentoConsultaButton();
    setupReservarHandler();
    setupConsultaAgendamentoButton(linkUnico);
  } catch (error) {
    root.innerHTML = ProfessorPublicoTemplate.render({ errorMessage: 'Erro ao carregar dados do professor.' });
  }
}

function setupReservarHandler() {
  (window as any).handleReservarAula = handleReservarAula;
}

function showReservaModal(aulaId: string) {
  const aula = aulasCache.find(a => a.id === aulaId);
  if (!aula) return;
  const modalHtml = `
    <div class="modal fade" id="modalReserva" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Reservar Aula: ${aula.titulo}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form id="formReserva">
              <div class="mb-3">
                <label for="nome" class="form-label">Seu Nome</label>
                <input type="text" class="form-control" id="nome" name="nome" required>
              </div>
              <div class="mb-3">
                <label for="telefone" class="form-label">Telefone</label>
                <input type="tel" class="form-control" id="telefone" name="telefone" required>
              </div>
              <div class="mb-3">
                <label for="email" class="form-label">E-mail</label>
                <input type="email" class="form-control" id="email" name="email" required>
              </div>
              <button type="submit" class="btn btn-primary w-100">Confirmar Reserva</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;
  let modalDiv = document.getElementById('modalReservaContainer');
  if (!modalDiv) {
    modalDiv = document.createElement('div');
    modalDiv.id = 'modalReservaContainer';
    document.body.appendChild(modalDiv);
  }
  modalDiv.innerHTML = modalHtml;
  const modal = new (window as any).bootstrap.Modal(document.getElementById('modalReserva'));
  modal.show();
  const form = document.getElementById('formReserva') as HTMLFormElement;
  if (form) {
    form.onsubmit = (event) => handleReservaSubmit(event, aulaId, modal);
  }
}

function handleReservarAula(aulaId: string) {
  showReservaModal(aulaId);
}

async function handleReservaSubmit(event: Event, aulaId: string, modal: any) {
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  const nome = (form.nome as HTMLInputElement).value;
  const telefone = (form.telefone as HTMLInputElement).value;
  const email = (form.email as HTMLInputElement).value;
  const result = await ProfessorPublicoService.reservarAula(linkUnicoCache, aulaId, nome, telefone, email);
  if (result.success) {
    modal.hide();
    mostrarToast('Reserva realizada com sucesso!', 'success');
    // Atualizar lista de aulas
    aulasCache = await ProfessorPublicoService.carregarAulas(linkUnicoCache);
    const root = document.getElementById('root');
    if (root) {
      root.innerHTML = ProfessorPublicoTemplate.render({ professor: professorCache, aulas: aulasCache, successMessage: 'Reserva realizada com sucesso!' });
      root.innerHTML += renderAgendamentoConsultaButton();
      setupConsultaAgendamentoButton(linkUnicoCache);
    }
    setupReservarHandler();
  } else {
    mostrarToast(result.error || 'Erro ao reservar', 'danger');
  }
}

// Adicionar função para buscar agendamentos do aluno
async function buscarAgendamentosAluno(linkUnico: string, nome: string, telefone: string, email: string) {
  // Chamar endpoint público de agendamentos do aluno
  const res = await fetch(`${API_BASE}/professor-publico/${linkUnico}/agendamentos/aluno?nome=${encodeURIComponent(nome)}&telefone=${encodeURIComponent(telefone)}&email=${encodeURIComponent(email)}`);
  if (!res.ok) throw new Error('Erro ao buscar agendamentos');
  return await res.json();
}

// Adicionar formulário na renderização da página pública
function renderAgendamentoConsultaButton() {
  return `
    <div class="text-center mt-4">
      <button class="btn btn-outline-primary" id="btnAbrirConsultaAgendamento">
        <i class="bi bi-search"></i> Consultar meus agendamentos
      </button>
    </div>
    <div id="modalConsultaAgendamentoContainer"></div>
  `;
}

function showConsultaAgendamentoModal(linkUnico: string) {
  let modalDiv = document.getElementById('modalConsultaAgendamentoContainer');
  if (!modalDiv) {
    modalDiv = document.createElement('div');
    modalDiv.id = 'modalConsultaAgendamentoContainer';
    document.body.appendChild(modalDiv);
  }
  modalDiv.innerHTML = `
    <div class="modal fade" id="modalConsultaAgendamento" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Consultar meus agendamentos</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form id="formConsultaAgendamento">
              <div class="mb-3">
                <input type="text" class="form-control" name="nome" placeholder="Nome" required>
              </div>
              <div class="mb-3">
                <input type="tel" class="form-control" name="telefone" placeholder="Telefone" required>
              </div>
              <div class="mb-3">
                <input type="email" class="form-control" name="email" placeholder="E-mail" required>
              </div>
              <button type="submit" class="btn btn-primary w-100">Buscar Agendamentos</button>
            </form>
            <div id="agendamentosAlunoModal"></div>
          </div>
        </div>
      </div>
    </div>
  `;
  const modal = new (window as any).bootstrap.Modal(document.getElementById('modalConsultaAgendamento'));
  modal.show();
  const form = document.getElementById('formConsultaAgendamento') as HTMLFormElement;
  if (form) {
    form.onsubmit = async (event) => {
      event.preventDefault();
      const nome = (form.nome as HTMLInputElement).value;
      const telefone = (form.telefone as HTMLInputElement).value;
      const email = (form.email as HTMLInputElement).value;
      try {
        const agendamentos = await buscarAgendamentosAluno(linkUnico, nome, telefone, email);
        exibirAgendamentosAlunoModal(agendamentos);
      } catch (error) {
        mostrarToast('Erro ao buscar agendamentos', 'danger');
      }
    };
  }
}

function exibirAgendamentosAlunoNaPagina(agendamentos: any[]) {
  let container = document.getElementById('meusAgendamentosSection');
  if (!container) {
    container = document.createElement('div');
    container.id = 'meusAgendamentosSection';
    const root = document.getElementById('root');
    if (root) {
      const cardPrincipal = root.querySelector('.card.shadow-lg');
      if (cardPrincipal && cardPrincipal.parentElement) {
        cardPrincipal.parentElement.insertAdjacentElement('afterend', container);
      } else {
        root.appendChild(container);
      }
    }
  }
  container.innerHTML = `
    <div class="container d-flex justify-content-center mt-4 mb-5">
      <div class="card shadow rounded-4 w-100" style="max-width: 700px;">
        <div class="card-header bg-primary text-white rounded-top-4">
          <h4 class="mb-0"><i class="bi bi-calendar-check me-2"></i>Meus Agendamentos</h4>
        </div>
        <div class="card-body p-4">
          ${agendamentos.length === 0 ? '<div class="text-muted">Nenhum agendamento encontrado.</div>' : agendamentos.map(a => renderAgendamentoCardUnificado(a)).join('')}
        </div>
      </div>
    </div>
  `;
  setTimeout(() => {
    container.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 200);
}

function renderAgendamentoCardUnificado(agendamento: any): string {
  const agora = new Date();
  const dataAula = new Date(agendamento.dataHora);
  let statusBadge = '';
  let borderColor = 'border-success';
  let icon = '<i class="bi bi-calendar-check me-1 text-success"></i>';
  let podeCancelar = false;
  if (agendamento.status && agendamento.status.toLowerCase().includes('cancel')) {
    statusBadge = '<span class="badge bg-danger"><i class="bi bi-x-circle me-1"></i>Cancelado</span>';
    borderColor = 'border-danger';
    icon = '<i class="bi bi-x-circle me-1 text-danger"></i>';
  } else if (dataAula < agora && (agendamento.status && agendamento.status.toLowerCase().includes('finaliz'))) {
    statusBadge = '<span class="badge bg-secondary"><i class="bi bi-flag me-1"></i>Finalizado</span>';
    borderColor = 'border-secondary';
    icon = '<i class="bi bi-flag me-1 text-secondary"></i>';
  } else if (dataAula < agora) {
    statusBadge = '<span class="badge bg-secondary"><i class="bi bi-flag me-1"></i>Finalizado</span>';
    borderColor = 'border-secondary';
    icon = '<i class="bi bi-flag me-1 text-secondary"></i>';
  } else {
    statusBadge = '<span class="badge bg-success"><i class="bi bi-calendar-check me-1"></i>Agendado</span>';
    borderColor = 'border-success';
    icon = '<i class="bi bi-calendar-check me-1 text-success"></i>';
    podeCancelar = true;
  }
  
  // Status da aula
  let statusAulaBadge = '';
  if (agendamento.statusAula === 'reagendada') {
    statusAulaBadge = '<span class="badge bg-warning text-dark"><i class="bi bi-arrow-clockwise me-1"></i>Reagendada</span>';
  } else if (agendamento.statusAula === 'cancelada') {
    statusAulaBadge = '<span class="badge bg-danger"><i class="bi bi-x-circle me-1"></i>Aula Cancelada</span>';
  } else if (agendamento.statusAula === 'lotada') {
    statusAulaBadge = '<span class="badge bg-info"><i class="bi bi-people me-1"></i>Lotada</span>';
  } else {
    statusAulaBadge = '<span class="badge bg-success"><i class="bi bi-check-circle me-1"></i>Disponível</span>';
  }
  
  const btnCancelar = podeCancelar ? `<button class="btn btn-outline-danger btn-sm float-end" onclick="cancelarReservaAluno('${agendamento.id}', '${agendamento.nome}', '${agendamento.telefone}')"><i class='bi bi-x-circle'></i> Cancelar</button>` : '';
  return `
    <div class="card mb-3 shadow-sm agendamento-card ${borderColor}" style="border-left: 6px solid; background: #f8f9fa; transition: box-shadow 0.2s;">
      <div class="card-body">
        <div class="d-flex align-items-start justify-content-between mb-3">
          <div class="flex-shrink-0 display-5" style="font-size:2rem;">${icon}</div>
          <div class="flex-grow-1 ms-3">
            <h6 class="card-title mb-2 fw-bold text-primary">${agendamento.titulo}</h6>
            <div class="row">
              <div class="col-md-6">
                <div class="mb-2"><i class="bi bi-person-badge me-2 text-secondary"></i><b>Professor:</b> ${agendamento.professorNome || 'N/A'}</div>
                <div class="mb-2"><i class="bi bi-envelope me-2 text-secondary"></i><b>Email:</b> ${agendamento.professorEmail || 'N/A'}</div>
                <div class="mb-2"><i class="bi bi-telephone me-2 text-secondary"></i><b>Telefone:</b> ${agendamento.professorTelefone || 'N/A'}</div>
              </div>
              <div class="col-md-6">
                <div class="mb-2"><i class="bi bi-calendar-event me-2 text-secondary"></i><b>Data/Hora:</b> ${dataAula.toLocaleString()}</div>
                <div class="mb-2"><i class="bi bi-info-circle me-2 text-secondary"></i><b>Status da Reserva:</b> ${statusBadge}</div>
                <div class="mb-2"><i class="bi bi-calendar-check me-2 text-secondary"></i><b>Status da Aula:</b> ${statusAulaBadge}</div>
              </div>
            </div>
          </div>
          <div class="flex-shrink-0 ms-2">
            ${btnCancelar}
          </div>
        </div>
      </div>
    </div>
    <style>
      .agendamento-card:hover { box-shadow: 0 0 0 4px #e3e6ea; }
      @media (max-width: 768px) {
        .agendamento-card .card-body .d-flex { flex-direction: column; align-items: flex-start; }
        .agendamento-card .flex-shrink-0 { margin-bottom: 0.5rem; }
        .agendamento-card .row .col-md-6 { margin-bottom: 1rem; }
      }
    </style>
  `;
}

// Função global para cancelar reserva do aluno
(window as any).cancelarReservaAluno = async function(aulaId: string, nome: string, telefone: string) {
  if (!confirm('Tem certeza que deseja cancelar este agendamento?')) return;
  try {
    const res = await fetch(`/api/aulas/${aulaId}/cancelar-reserva`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, telefone })
    });
    if (res.ok) {
      mostrarToast('Reserva cancelada com sucesso!', 'success');
      // Atualizar status do card imediatamente para feedback visual
      const agendamentoCard = document.querySelector(`.agendamento-card button[onclick*="${aulaId}"]`);
      if (agendamentoCard) {
        const card = agendamentoCard.closest('.agendamento-card');
        if (card) {
          const statusDiv = card.querySelector('.badge');
          if (statusDiv) {
            statusDiv.className = 'badge bg-danger';
            statusDiv.innerHTML = "<i class='bi bi-x-circle me-1'></i>Cancelado";
          }
          card.classList.remove('border-success', 'border-secondary');
          card.classList.add('border-danger');
        }
      }
      // Atualizar agendamentos após cancelamento
      let nomeVal = '', telefoneVal = '', emailVal = '';
      const form = document.getElementById('formConsultaAgendamento') as HTMLFormElement;
      if (form) {
        nomeVal = (form.nome as HTMLInputElement).value;
        telefoneVal = (form.telefone as HTMLInputElement).value;
        emailVal = (form.email as HTMLInputElement).value;
      } else {
        // Se não houver formulário, tente pegar do último agendamento exibido
        const agendamentoCard = document.querySelector('.agendamento-card');
        if (agendamentoCard) {
          nomeVal = nome;
          telefoneVal = telefone;
          emailVal = '';
        }
      }
      if (nomeVal && telefoneVal) {
        const agendamentos = await buscarAgendamentosAluno(linkUnicoCache, nomeVal, telefoneVal, emailVal);
        exibirAgendamentosAlunoNaPagina(agendamentos);
      }
    } else {
      mostrarToast('Erro ao cancelar reserva.', 'danger');
    }
  } catch (e) {
    mostrarToast('Erro ao conectar com o servidor.', 'danger');
  }
}

// Substituir exibirAgendamentosAlunoModal por exibirAgendamentosAlunoNaPagina
function exibirAgendamentosAlunoModal(agendamentos: any[]) {
  exibirAgendamentosAlunoNaPagina(agendamentos);
}

// Substituir chamada do formulário por botão
// root.innerHTML += renderAgendamentoConsultaButton();
// Adicionar handler para o botão
function setupConsultaAgendamentoButton(linkUnico: string) {
  const btn = document.getElementById('btnAbrirConsultaAgendamento');
  if (btn) {
    btn.onclick = () => showConsultaAgendamentoModal(linkUnico);
  }
} 