// Serviço centralizado de API para o frontend EduClick
// Todas as funções retornam o resultado da chamada fetch (ou lançam erro)

import { 
  Professor, 
  Aula, 
  Agendamento, 
  HorarioIndisponivel, 
  CadastroFormData, 
  PerfilFormData, 
  AulaFormData, 
  AgendamentoFormData, 
  ReservaFormData,
  ApiResponse 
} from '../types';

export const API_BASE = 'http://localhost:3000/api';


// Auth
async function fetchComToken(url: string, options: RequestInit = {}): Promise<Response> {
  // Sempre envia o cookie de sessão
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  });
}

// Auth
export async function loginProfessor(email: string, senha: string): Promise<Response> {
  return fetch(`${API_BASE}/professores/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha }),
    credentials: 'include'
  });
}

export async function cadastroProfessor(data: Omit<CadastroFormData, 'confirmarSenha'>): Promise<Response> {
  return fetch(`${API_BASE}/professores/cadastro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

export async function logoutProfessor(): Promise<Response> {
  return fetch(`${API_BASE}/professores/logout`, {
    method: 'POST',
    credentials: 'include'
  });
}

// Perfil
export function getPerfilProfessor(): Promise<Response> {
  return fetchComToken(`${API_BASE}/professores/me`);
}

export function editarPerfilProfessor(data: PerfilFormData): Promise<Response> {
  return fetchComToken(`${API_BASE}/professores/me`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

// Aulas (professor)
export function getMinhasAulas(): Promise<Response> {
  return fetchComToken(`${API_BASE}/aulas/minhas-aulas`);
}

export function criarAula(data: AulaFormData): Promise<Response> {
  return fetchComToken(`${API_BASE}/aulas/criar`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export function editarAula(aulaId: string, data: AulaFormData): Promise<Response> {
  return fetchComToken(`${API_BASE}/aulas/${aulaId}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export function excluirAula(aulaId: string): Promise<Response> {
  return fetchComToken(`${API_BASE}/aulas/${aulaId}`, {
    method: 'DELETE'
  });
}

// Horários indisponíveis
export function getHorariosIndisponiveis(): Promise<Response> {
  return fetchComToken(`${API_BASE}/professores/me/horarios-indisponiveis`);
}

export function adicionarHorarioIndisponivel(data: Omit<HorarioIndisponivel, 'id'>): Promise<Response> {
  return fetchComToken(`${API_BASE}/professores/me/horarios-indisponiveis`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export function removerHorarioIndisponivel(id: string): Promise<Response> {
  return fetchComToken(`${API_BASE}/professores/me/horarios-indisponiveis/${id}`, {
    method: 'DELETE'
  });
}

// Agendamentos (professor)
export function getAgendamentosRecebidos(): Promise<Response> {
  return fetchComToken(`${API_BASE}/professores/me/agendamentos`);
}

export function atualizarStatusAgendamento(id: string, status: Agendamento['status']): Promise<Response> {
  return fetchComToken(`${API_BASE}/agendamentos/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  });
}

// Página pública do professor
export function getProfessorPublico(linkUnico: string): Promise<Response> {
  const ts = Date.now();
  return fetch(`${API_BASE}/professor-publico/${encodeURIComponent(linkUnico)}?_ts=${ts}` as string, { cache: 'no-store' });
}

export function getAulasPublicas(linkUnico: string): Promise<Response> {
  const ts = Date.now();
  return fetch(`${API_BASE}/professor-publico/${encodeURIComponent(linkUnico)}/aulas?_ts=${ts}` as string, { cache: 'no-store' });
}

export function reservarAulaPublica(linkUnico: string, aulaId: string, reserva: any): Promise<Response> {
  return fetch(`${API_BASE}/professor-publico/${encodeURIComponent(linkUnico)}/reservar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reserva)
  });
}
// Agendamentos públicos (aluno)
export function agendarComProfessor(professorId: string, agendamento: AgendamentoFormData): Promise<Response> {
  return fetch(`${API_BASE}/professores/${professorId}/agendamentos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(agendamento)
  });
}

export function getInfoProfessor(professorId: string): Promise<Response> {
  return fetch(`${API_BASE}/professores/${professorId}`);
}

export function getAgendamentosAluno(professorId: string, telefone: string): Promise<Response> {
  return fetch(`${API_BASE}/professores/${professorId}/agendamentos/aluno/${telefone}`);
}

// Aulas (detalhes e cancelamento)
export function getAula(aulaId: string): Promise<Response> {
  return fetchComToken(`${API_BASE}/aulas/${aulaId}`);
}

export function editarAulaAPI(aulaId: string, data: AulaFormData): Promise<Response> {
  return fetchComToken(`${API_BASE}/aulas/${aulaId}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export function excluirAulaAPI(aulaId: string): Promise<Response> {
  return fetchComToken(`${API_BASE}/aulas/${aulaId}`, {
    method: 'DELETE'
  });
}

export function cancelarReservaAPI(aulaId: string, nome: string, telefone: string): Promise<Response> {
  return fetchComToken(`${API_BASE}/aulas/${aulaId}/cancelar-reserva`, {
    method: 'POST',
    body: JSON.stringify({ nome, telefone })
  });
}

// Reagendar aula (professor)
export function reagendarAulaAPI(aulaId: string, novaDataHora?: string): Promise<Response> {
  const body: any = {};
  if (novaDataHora) body.nova_data_hora = novaDataHora;
  return fetchComToken(`${API_BASE}/aulas/${aulaId}/reagendar`, {
    method: 'PUT',
    body: JSON.stringify(body)
  });
}

// Página pública do professor (perfil + aulas)
export function getPerfilEAulasPublicas(linkUnico: string): Promise<Response> {
  const ts = Date.now();
  return fetch(`${API_BASE}/professor-publico/${encodeURIComponent(linkUnico)}?_ts=${ts}` as string, { cache: 'no-store' });
}

// Utilitário de tratamento
export async function handleApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
  try {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
      return { success: false, error: errorData.error || `Erro ${response.status}` };
    }
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: 'Erro ao processar resposta' };
  }
}
