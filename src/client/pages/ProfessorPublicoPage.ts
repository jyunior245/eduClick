// src/client/pages/ProfessorPublicoPage.ts
import { ProfessorPublicoTemplate } from '../templates/ProfessorPublicoTemplate';
import { ProfessorPublicoService } from '../services/ProfessorPublicoService';
import { getPublicFcmToken } from '../services/notifications';
import { setupPublicOnMessage } from '../services/notifications';
import { mostrarToast } from '../components/Toast';
import { API_BASE } from '../services/api';

let professorCache: any = null;
let aulasCache: any[] = [];
let linkUnicoCache: string = '';
let aulasRefreshTimer: any = null;
let meusAgendamentosTimer: any = null;

export async function renderProfessorPublicoPage(root: HTMLElement, linkUnico: string): Promise<void> {
  try {
    // Habilita recepção de push em páginas públicas (alunos)
    try { setupPublicOnMessage(); } catch {}
  } catch {}
  linkUnicoCache = linkUnico;
  try {
    const data = await ProfessorPublicoService.carregarPerfilEAulas(linkUnico);
    professorCache = data.professor;
    aulasCache = data.aulas || [];
  root.innerHTML = ProfessorPublicoTemplate.render({ professor: professorCache, aulas: aulasCache });
    setupReservarHandler();
    setupConsultaAgendamentoButton(linkUnico);
    startAulasAutoRefresh(root);
    // Listener público para reagir imediatamente a pushes (AULA_REAGENDADA/AULAS_UPDATED)
    try {
      setupPublicOnMessage();
      window.addEventListener('aulas-updated', async () => {
        try {
          const d = await ProfessorPublicoService.carregarPerfilEAulas(linkUnicoCache);
          aulasCache = d.aulas || aulasCache;
          professorCache = d.professor || professorCache;
          root.innerHTML = ProfessorPublicoTemplate.render({ professor: professorCache, aulas: aulasCache });
          setupReservarHandler();
          setupConsultaAgendamentoButton(linkUnicoCache);
        } catch {}
      });
      // Recebe atualizações vindas de outras abas (ex.: dashboard) via BroadcastChannel
      try {
        const bc = new (window as any).BroadcastChannel('aulas');
        bc.onmessage = async (event: any) => {
          if (event?.data?.type === 'AULAS_UPDATED') {
            try {
              const d = await ProfessorPublicoService.carregarPerfilEAulas(linkUnicoCache);
              aulasCache = d.aulas || aulasCache;
              professorCache = d.professor || professorCache;
              root.innerHTML = ProfessorPublicoTemplate.render({ professor: professorCache, aulas: aulasCache });
              setupReservarHandler();
              setupConsultaAgendamentoButton(linkUnicoCache);
            } catch {}
          }
        };
      } catch {}
      // Atualiza ao focar a aba ou quando volta a ficar visível (evita recarregar manualmente)
      const refreshIfVisible = async () => {
        if (document.visibilityState === 'visible') {
          try {
            const d = await ProfessorPublicoService.carregarPerfilEAulas(linkUnicoCache);
            const novas = d.aulas || [];
            const before = JSON.stringify(aulasCache.map(a => ({ id: a.id, status: a.status, dataHora: a.dataHora, vagas_restantes: a.vagas_restantes })));
            const after = JSON.stringify(novas.map((a: any) => ({ id: a.id, status: a.status, dataHora: a.dataHora, vagas_restantes: a.vagas_restantes })));
            if (before !== after) {
              aulasCache = novas;
              professorCache = d.professor || professorCache;
              root.innerHTML = ProfessorPublicoTemplate.render({ professor: professorCache, aulas: aulasCache });
              setupReservarHandler();
              setupConsultaAgendamentoButton(linkUnicoCache);
            }
          } catch {}
        }
      };
      window.addEventListener('focus', refreshIfVisible);
      document.addEventListener('visibilitychange', refreshIfVisible);
    } catch {}
  } catch (error) {
    console.error('[renderProfessorPublicoPage] erro:', error);
    root.innerHTML = ProfessorPublicoTemplate.render({ errorMessage: 'Erro ao carregar dados do professor.' });
  }
}

function startAulasAutoRefresh(root: HTMLElement) {
  if (aulasRefreshTimer) clearInterval(aulasRefreshTimer);
  aulasRefreshTimer = setInterval(async () => {
    try {
      const data = await ProfessorPublicoService.carregarPerfilEAulas(linkUnicoCache);
      const novasAulas = data.aulas || [];
      // Re-render apenas se houve mudança relevante
      const before = JSON.stringify(aulasCache.map(a => ({ id: a.id, status: a.status, dataHora: a.dataHora, vagas_restantes: a.vagas_restantes })));
      const after = JSON.stringify(novasAulas.map((a: any) => ({ id: a.id, status: a.status, dataHora: a.dataHora, vagas_restantes: a.vagas_restantes })));
      if (before !== after) {
        aulasCache = novasAulas;
        professorCache = data.professor || professorCache;
        root.innerHTML = ProfessorPublicoTemplate.render({ professor: professorCache, aulas: aulasCache });
        setupReservarHandler();
        setupConsultaAgendamentoButton(linkUnicoCache);
      }
    } catch (e) {
      // silencioso
    }
  }, 15000);
}

function setupReservarHandler() {
  (window as any).handleReservarAula = handleReservarAula;
}

function showReservaModal(aulaId: string) {
  // Normalizar tipo: comparar como string
  const aula = aulasCache.find(a => String(a.id) === String(aulaId));
  if (!aula) {
    mostrarToast('Aula não encontrada.', 'danger');
    return;
  }
  // (resto do modal continua igual)
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
  const modalEl = document.getElementById('modalReserva');
  const modal = new (window as any).bootstrap.Modal(modalEl);
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
  // Obter token FCM público (se disponível) com uma tentativa extra
  let alunoFcmToken: string | null = null;
  try {
    alunoFcmToken = await getPublicFcmToken();
    if (!alunoFcmToken) {
      // pequeno retry após eventuais prompts/registro de SW
      await new Promise(r => setTimeout(r, 600));
      alunoFcmToken = await getPublicFcmToken();
    }
  } catch {}
  const result = await ProfessorPublicoService.reservarAula(linkUnicoCache, aulaId, nome, telefone, email, alunoFcmToken);
  if (result.success) {
    modal.hide();
    mostrarToast('Reserva realizada com sucesso!', 'success');
    // Avisar outras abas da mesma origem (ex.: dashboard do professor) para atualizar imediatamente
    try {
      const bc = new (window as any).BroadcastChannel('aulas');
      bc.postMessage({ type: 'AULAS_UPDATED' });
      // Fecha o canal (opcional)
      if (typeof bc.close === 'function') bc.close();
    } catch {}
    // Recarregar perfil e aulas para atualizar visual
    try {
      const data = await ProfessorPublicoService.carregarPerfilEAulas(linkUnicoCache);
      aulasCache = data.aulas || [];
      professorCache = data.professor || professorCache;
      const root = document.getElementById('root');
      if (root) {
  root.innerHTML = ProfessorPublicoTemplate.render({ professor: professorCache, aulas: aulasCache, successMessage: 'Reserva realizada com sucesso!' });
        setupReservarHandler();
        setupConsultaAgendamentoButton(linkUnicoCache);
        startAulasAutoRefresh(root);
      }
    } catch (e) {
      console.warn('[handleReservaSubmit] não foi possível recarregar aulas:', e);
    }
  } else {
    mostrarToast(result.error || 'Erro ao reservar', 'danger');
  }
}

// resto do arquivo (funções de consulta/agendamentos e renderizações) permanece igual,
// mas sempre compare ids com String(...) para evitar mismatches
// ...

function setupConsultaAgendamentoButton(linkUnico: string) {
  const btn = document.getElementById('btnAbrirConsultaAgendamento');
  if (btn) {
    btn.onclick = () => showConsultaAgendamentoModal(linkUnico);
  }
}

function showConsultaAgendamentoModal(linkUnico: string) {
  const modalHtml = `
    <div class="modal fade" id="modalConsultaAgendamento" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Consultar Meus Agendamentos</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form id="formConsultaAgendamento">
              <div class="mb-3">
                <label for="nomeConsulta" class="form-label">Nome</label>
                <input type="text" class="form-control" id="nomeConsulta" name="nome" required>
              </div>
              <div class="mb-3">
                <label for="telefoneConsulta" class="form-label">Telefone</label>
                <input type="tel" class="form-control" id="telefoneConsulta" name="telefone" required>
              </div>
              <div class="mb-3">
                <label for="emailConsulta" class="form-label">E-mail</label>
                <input type="email" class="form-control" id="emailConsulta" name="email" required>
              </div>
              <button type="submit" class="btn btn-primary w-100">Consultar</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;
  let modalDiv = document.getElementById('modalConsultaAgendamentoContainer');
  if (!modalDiv) {
    modalDiv = document.createElement('div');
    modalDiv.id = 'modalConsultaAgendamentoContainer';
    document.body.appendChild(modalDiv);
  }
  modalDiv.innerHTML = modalHtml;
  const modalEl = document.getElementById('modalConsultaAgendamento');
  const modal = new (window as any).bootstrap.Modal(modalEl);
  modal.show();
  const form = document.getElementById('formConsultaAgendamento') as HTMLFormElement;
  if (form) {
    form.onsubmit = (event) => handleConsultaAgendamentoSubmit(event, linkUnico, modal);
  }
}

async function handleCancelarAgendamentoAluno(agendamento: any) {
  if (!agendamento || !agendamento.reservaId) {
    mostrarToast('Reserva inválida.', 'danger');
    return;
  }
  try {
    const url = `${API_BASE}/reservas/${agendamento.reservaId}`;
    // Usar PUT para marcar status 'cancelada' e liberar vaga no backend
    const res = await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' } });
    if (res.ok) {
      mostrarToast('Reserva cancelada com sucesso!', 'success');
      // Atualizar UI e recarregar página automaticamente para refletir mudanças
      try {
        if ((window as any).lastConsultaAgendamento) {
          const { linkUnico, nome, telefone, email } = (window as any).lastConsultaAgendamento;
          await consultarAgendamentosAluno(linkUnico, nome, telefone, email);
        } else {
          document.getElementById('resultadoConsultaAgendamento')?.remove();
        }
      } finally {
        setTimeout(() => window.location.reload(), 800);
      }
    } else {
      mostrarToast('Erro ao cancelar reserva.', 'danger');
    }
  } catch (err) {
    mostrarToast('Erro ao cancelar reserva.', 'danger');
  }
}

// Expose the cancel handler globally for use in inline onclick
(window as any).handleCancelarAgendamentoAluno = handleCancelarAgendamentoAluno;

async function consultarAgendamentosAluno(linkUnico: string, nome: string, telefone: string, email: string) {
  try {
    const url = `${API_BASE}/professor-publico/${encodeURIComponent(linkUnico)}/agendamentos?nome=${encodeURIComponent(nome)}&telefone=${encodeURIComponent(telefone)}&email=${encodeURIComponent(email)}`;
    const res = await fetch(url);
    const agendamentos = await res.json();
    renderResultadoConsultaAgendamento(agendamentos);
  } catch (err) {
    mostrarToast('Erro ao atualizar agendamentos.', 'danger');
  }
}

async function handleConsultaAgendamentoSubmit(event: Event, linkUnico: string, modal: any) {
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  const nome = (form.nome as HTMLInputElement).value;
  const telefone = (form.telefone as HTMLInputElement).value;
  const email = (form.email as HTMLInputElement).value;
  (window as any).lastConsultaAgendamento = { linkUnico, nome, telefone, email };
  try {
    const url = `${API_BASE}/professor-publico/${encodeURIComponent(linkUnico)}/agendamentos?nome=${encodeURIComponent(nome)}&telefone=${encodeURIComponent(telefone)}&email=${encodeURIComponent(email)}`;
    const res = await fetch(url);
    const agendamentos = await res.json();
    modal.hide();
    renderResultadoConsultaAgendamento(agendamentos);
  } catch (err) {
    mostrarToast('Erro ao consultar agendamentos.', 'danger');
  }
}

function renderResultadoConsultaAgendamento(agendamentos: any[]) {
  // Remove modal anterior se existir
  const oldModal = document.getElementById('modalMeusAgendamentos');
  const modalHtml = `
    <div class="modal fade" id="modalMeusAgendamentos" tabindex="-1" style="display:none;">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">Meus Agendamentos</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            ${(!agendamentos || agendamentos.length === 0)
              ? `<div class='alert alert-info'>Nenhum agendamento encontrado para os dados informados.</div>`
              : agendamentos.map(a => {
                  // Badge de status da aula (inclui destaque para REAGENDADA)
                  let statusAulaBadge = `<span class='badge bg-secondary'>${a.statusAula || '-'}</span>`;
                  const statusAulaLc = (a.statusAula || '').toLowerCase();
                  if (statusAulaLc === 'disponivel' || statusAulaLc === 'disponível') {
                    statusAulaBadge = `<span class='badge bg-success'>${a.statusAula}</span>`;
                  } else if (statusAulaLc === 'reagendada') {
                    statusAulaBadge = `<span class='badge bg-warning text-dark'>Reagendada</span>`;
                  } else if (statusAulaLc === 'cancelada') {
                    statusAulaBadge = `<span class='badge bg-danger'>Cancelada</span>`;
                  }
                  // Data/hora formatada (mostrar string crua se não for possível converter)
                  let dataHoraRaw = a.dataHora || a.data_hora;
                  let dataHoraStr = '-';
                  if (dataHoraRaw) {
                    try {
                      const d = new Date(dataHoraRaw);
                      if (!isNaN(d.getTime())) {
                        dataHoraStr = d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      } else {
                        dataHoraStr = String(dataHoraRaw);
                      }
                    } catch {
                      dataHoraStr = String(dataHoraRaw);
                    }
                  }
                  if (dataHoraStr === '-' && dataHoraRaw) {
                    dataHoraStr = String(dataHoraRaw);
                  }
                  // Status da reserva
                  let statusReservaBadge = `<span class='badge bg-secondary'>${a.status || '-'}</span>`;
                  if ((a.status || '').toLowerCase() === 'ativa') {
                    statusReservaBadge = `<span class='badge bg-success'>Disponível</span>`;
                  }
                  // Exibir objeto inteiro para depuração
                  let debugInfo = '';
                  return `
                  <div class='card border-2 border-primary shadow-sm mb-4'>
                    <div class='card-header bg-primary text-white d-flex justify-content-between align-items-center'>
                      <span><i class="bi bi-calendar-event"></i> ${a.titulo}</span>
                      ${statusAulaBadge}
                    </div>
                    <div class='card-body d-flex flex-column flex-md-row flex-wrap justify-content-between'>
                      <div class='mb-2' style='min-width:220px;'>
                        <p class='mb-1'><b>Professor:</b> ${a.professorNome || '-'}</p>
                        <p class='mb-1'><b>Email:</b> ${a.professorEmail || '-'}</p>
                        <p class='mb-1'><b>Telefone:</b> ${a.professorTelefone || '-'}</p>
                      </div>
                      <div class='mb-2' style='min-width:180px;'>
                        <p class='mb-1'><b>${statusAulaLc === 'reagendada' ? 'Nova Data/Hora' : 'Data/Hora'}:</b> <span class='text-primary'>${dataHoraStr}</span></p>
                        <p class='mb-1'><b>Status da Aula:</b> <span class='text-primary'>${a.statusAula || '-'}</span></p>
                        <p class='mb-1'><b>Status da Reserva:</b> ${statusReservaBadge}</p>
                        ${debugInfo}
                      </div>
                      <div class='d-flex align-items-end justify-content-end flex-grow-1'>
                        <button class='btn btn-outline-danger btn-sm' onclick='if(confirm("Tem certeza que deseja cancelar a aula?")) handleCancelarAgendamentoAluno(${JSON.stringify(a)})'>Cancelar</button>
                      </div>
                    </div>
                  </div>
                  `;
                }).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
  // Adiciona modal ao body
  const modalDiv = document.createElement('div');
  modalDiv.innerHTML = modalHtml;
  document.body.appendChild(modalDiv);

  // Inicializa e exibe o modal (Bootstrap 5)
  const modalElement = document.getElementById('modalMeusAgendamentos');
  if (modalElement) {
    // @ts-ignore
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  }
}
