// Serviço centralizado de API para o frontend EduClick
// Todas as funções retornam o resultado da chamada fetch (ou lançam erro)

const API_BASE = 'http://localhost:3000/api';

// Auth
export async function loginProfessor(email: string, senha: string) {
  return fetch(`${API_BASE}/professores/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha }),
    credentials: 'include'
  });
}

export async function cadastroProfessor(data: any) {
  return fetch(`${API_BASE}/professores/cadastro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

export async function logoutProfessor() {
  return fetch(`${API_BASE}/professores/logout`, {
    method: 'POST',
    credentials: 'include'
  });
}

// Perfil
export async function getPerfilProfessor() {
  return fetch(`${API_BASE}/professores/me`, { credentials: 'include' });
}

export async function editarPerfilProfessor(data: any) {
  return fetch(`${API_BASE}/professores/me`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
}

// Aulas (professor)
export async function getMinhasAulas() {
  return fetch(`${API_BASE}/aulas/minhas-aulas`, { credentials: 'include' });
}

export async function criarAula(data: any) {
  return fetch(`${API_BASE}/aulas/criar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
}

export async function editarAula(aulaId: string, data: any) {
  return fetch(`${API_BASE}/aulas/${aulaId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
}

export async function excluirAula(aulaId: string) {
  return fetch(`${API_BASE}/aulas/${aulaId}`, {
    method: 'DELETE',
    credentials: 'include'
  });
}

// Horários indisponíveis
export async function getHorariosIndisponiveis() {
  return fetch(`${API_BASE}/professores/me/horarios-indisponiveis`, { credentials: 'include' });
}

export async function adicionarHorarioIndisponivel(data: any) {
  return fetch(`${API_BASE}/professores/me/horarios-indisponiveis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
}

export async function removerHorarioIndisponivel(id: string) {
  return fetch(`${API_BASE}/professores/me/horarios-indisponiveis/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
}

// Agendamentos (professor)
export async function getAgendamentosRecebidos() {
  return fetch(`${API_BASE}/professores/me/agendamentos`, { credentials: 'include' });
}

export async function atualizarStatusAgendamento(id: string, status: string) {
  return fetch(`${API_BASE}/agendamentos/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ status })
  });
}

// Página pública do professor
export async function getProfessorPublico(linkUnico: string) {
  return fetch(`${API_BASE}/professores/${linkUnico}`);
}

export async function getAulasPublicas(linkUnico: string) {
  return fetch(`${API_BASE}/professores/${linkUnico}/aulas`);
}

export async function reservarAulaPublica(linkUnico: string, aulaId: string, alunoNome: string, alunoTelefone: string) {
  return fetch(`${API_BASE}/professor-publico/${linkUnico}/reservar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ aulaId, alunoNome, alunoTelefone })
  });
}

// Agendamentos públicos (aluno agenda com professor)
export async function agendarComProfessor(professorId: string, alunoNome: string, alunoTelefone: string, dataHora: string) {
  return fetch(`${API_BASE}/professores/${professorId}/agendamentos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ alunoNome, alunoTelefone, dataHora })
  });
}

export async function getInfoProfessor(professorId: string) {
  return fetch(`${API_BASE}/professores/${professorId}`);
}

export async function getAgendamentosAluno(professorId: string, telefone: string) {
  return fetch(`${API_BASE}/professores/${professorId}/agendamentos/aluno/${telefone}`);
}

// Aulas (detalhes, edição, exclusão, cancelamento)
export async function getAula(aulaId: string) {
  return fetch(`${API_BASE}/aulas/${aulaId}`, { credentials: 'include' });
}

export async function editarAulaAPI(aulaId: string, data: any) {
  return fetch(`${API_BASE}/aulas/${aulaId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
}

export async function excluirAulaAPI(aulaId: string) {
  return fetch(`${API_BASE}/aulas/${aulaId}`, {
    method: 'DELETE',
    credentials: 'include'
  });
}

export async function cancelarReservaAPI(aulaId: string, nome: string, telefone: string) {
  return fetch(`${API_BASE}/aulas/${aulaId}/cancelar-reserva`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ nome, telefone })
  });
}

// Outras funções podem ser adicionadas conforme necessário 