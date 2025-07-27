// Interfaces tipadas para o frontend EduClick

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha?: string; // Não enviar senha em respostas
}

export interface Professor extends Usuario {
  fotoPerfil?: string;
  descricao?: string;
  conteudosDominio?: string[];
  linkUnico?: string;
  telefone?: string;
  formacao?: string;
  experiencia?: string;
  especialidade?: string;
  bio?: string;
  valorHora?: number;
  observacoes?: string;
}

export interface Aluno extends Usuario {
  telefone: string;
  fotoPerfil?: string;
}

export interface Aula {
  id: string;
  titulo: string;
  conteudo: string;
  dataHora: string;
  duracao: number;
  valor: number;
  maxAlunos: number;
  status: 'disponivel' | 'lotada' | 'cancelada' | 'reagendada';
  observacoes?: string;
  professorId: string;
  reservas?: Reserva[];
}

export interface Reserva {
  nome: string;
  telefone: string;
  email: string;
  dataReserva?: string;
}

export interface Agendamento {
  id: string;
  professorId: string;
  alunoNome: string;
  alunoTelefone: string;
  dataHora: string;
  status: 'pendente' | 'confirmado' | 'cancelado';
}

export interface HorarioIndisponivel {
  id: string;
  professorId: string;
  dataInicio: string;
  dataFim: string;
  motivo?: string;
}

// Interfaces para formulários
export interface LoginFormData {
  email: string;
  senha: string;
}

export interface CadastroFormData {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
}

export interface PerfilFormData {
  nome: string;
  email: string;
  telefone?: string;
  especialidade?: string;
  bio?: string;
  valorHora?: number;
  linkUnico?: string;
  observacoes?: string;
}

export interface AulaFormData {
  titulo: string;
  conteudo: string;
  valor: number;
  duracao: number;
  maxAlunos: number;
  dataHora: string;
  status: string;
  observacoes?: string;
}

export interface AgendamentoFormData {
  nome: string;
  telefone: string;
  dataHora: string;
}

export interface ReservaFormData {
  nome: string;
  telefone: string;
  email: string;
}

// Interfaces para respostas da API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Interfaces para componentes
export interface DashboardData {
  usuario: Professor;
  aulas: Aula[];
}

export interface ProfessorPublicoData {
  professor: Professor;
  aulas: Aula[];
} 