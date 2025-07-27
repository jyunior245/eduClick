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
export async function getPerfilProfessor(): Promise<Response> {
  return fetch(`${API_BASE}/professores/me`, { credentials: 'include' });
}

export async function editarPerfilProfessor(data: PerfilFormData): Promise<Response> {
  return fetch(`${API_BASE}/professores/me`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
}

// Aulas (professor)
export async function getMinhasAulas(): Promise<Response> {
  return fetch(`${API_BASE}/aulas/minhas-aulas`, { credentials: 'include' });
}

export async function criarAula(data: AulaFormData): Promise<Response> {
  return fetch(`${API_BASE}/aulas/criar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
}

export async function editarAula(aulaId: string, data: AulaFormData): Promise<Response> {
  return fetch(`${API_BASE}/aulas/${aulaId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
}

export async function excluirAula(aulaId: string): Promise<Response> {
  return fetch(`${API_BASE}/aulas/${aulaId}`, {
    method: 'DELETE',
    credentials: 'include'
  });
}

// Horários indisponíveis
export async function getHorariosIndisponiveis(): Promise<Response> {
  return fetch(`${API_BASE}/professores/me/horarios-indisponiveis`, { credentials: 'include' });
}

export async function adicionarHorarioIndisponivel(data: Omit<HorarioIndisponivel, 'id'>): Promise<Response> {
  return fetch(`${API_BASE}/professores/me/horarios-indisponiveis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
}

export async function removerHorarioIndisponivel(id: string): Promise<Response> {
  return fetch(`${API_BASE}/professores/me/horarios-indisponiveis/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
}

// Agendamentos (professor)
export async function getAgendamentosRecebidos(): Promise<Response> {
  return fetch(`${API_BASE}/professores/me/agendamentos`, { credentials: 'include' });
}

export async function atualizarStatusAgendamento(id: string, status: Agendamento['status']): Promise<Response> {
  return fetch(`${API_BASE}/agendamentos/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ status })
  });
}

// Página pública do professor
export async function getProfessorPublico(linkUnico: string): Promise<Response> {
  return fetch(`${API_BASE}/professores/${linkUnico}`);
}

export async function getAulasPublicas(linkUnico: string): Promise<Response> {
  return fetch(`${API_BASE}/professores/${linkUnico}/aulas`);
}

export async function reservarAulaPublica(
  linkUnico: string, 
  aulaId: string, 
  reserva: any // aceitar payload customizado
): Promise<Response> {
  return fetch(`${API_BASE}/professor-publico/${linkUnico}/reservar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reserva)
  });
}

// Agendamentos públicos (aluno agenda com professor)
export async function agendarComProfessor(
  professorId: string, 
  agendamento: AgendamentoFormData
): Promise<Response> {
  return fetch(`${API_BASE}/professores/${professorId}/agendamentos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(agendamento)
  });
}

export async function getInfoProfessor(professorId: string): Promise<Response> {
  return fetch(`${API_BASE}/professores/${professorId}`);
}

export async function getAgendamentosAluno(professorId: string, telefone: string): Promise<Response> {
  return fetch(`${API_BASE}/professores/${professorId}/agendamentos/aluno/${telefone}`);
}

// Aulas (detalhes, edição, exclusão, cancelamento)
export async function getAula(aulaId: string): Promise<Response> {
  return fetch(`${API_BASE}/aulas/${aulaId}`, { credentials: 'include' });
}

export async function editarAulaAPI(aulaId: string, data: AulaFormData): Promise<Response> {
  return fetch(`${API_BASE}/aulas/${aulaId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
}

export async function excluirAulaAPI(aulaId: string): Promise<Response> {
  return fetch(`${API_BASE}/aulas/${aulaId}`, {
    method: 'DELETE',
    credentials: 'include'
  });
}

export async function cancelarReservaAPI(aulaId: string, nome: string, telefone: string): Promise<Response> {
  return fetch(`${API_BASE}/aulas/${aulaId}/cancelar-reserva`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ nome, telefone })
  });
}

// Utilitários para tratamento de respostas
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

// Página pública do professor (perfil + aulas juntos)
export async function getPerfilEAulasPublicas(linkUnico: string): Promise<Response> {
  return fetch(`${API_BASE}/professor-publico/${linkUnico}`);
} 