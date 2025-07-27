export interface ReservaAula {
  nome: string;
  telefone: string;
  email: string;
  status?: 'agendado' | 'cancelado';
  pagamentoEfetivado?: boolean;
}

export class Aula {
  constructor(
    public readonly id: string,
    public readonly professorId: string,
    public titulo: string,
    public conteudo: string,
    public valor: number, // Valor específico desta aula
    public duracao: number, // em minutos
    public dataHora: Date,
    public observacoes?: string,
    public maxAlunos: number = 1,
    public readonly reservas: ReservaAula[] = [],
    public status: 'disponivel' | 'lotada' | 'cancelada' | 'reagendada' = 'disponivel'
  ) {}

  get estaDisponivel(): boolean {
    return this.status === 'disponivel' && this.reservas.length < this.maxAlunos;
  }

  get vagasRestantes(): number {
    return this.maxAlunos - this.reservas.length;
  }

  get valorFormatado(): string {
    return `R$ ${this.valor.toFixed(2).replace('.', ',')}`;
  }

  get duracaoFormatada(): string {
    const horas = Math.floor(this.duracao / 60);
    const minutos = this.duracao % 60;
    if (horas > 0) {
      return `${horas}h ${minutos > 0 ? `${minutos}min` : ''}`.trim();
    }
    return `${minutos}min`;
  }

  reservarPublico(nome: string, telefone: string, email: string): boolean {
    if (!this.estaDisponivel) return false;
    if (this.reservas.find(r => r.nome === nome && r.telefone === telefone)) return false;
    this.reservas.push({ nome, telefone, email, status: 'agendado', pagamentoEfetivado: true });
    if (this.reservas.length >= this.maxAlunos) {
      this.status = 'lotada';
    }
    return true;
  }

  cancelarReservaPublico(nome: string, telefone: string): boolean {
    const reserva = this.reservas.find(r => r.nome === nome && r.telefone === telefone);
    if (reserva) {
      reserva.status = 'cancelado';
      reserva.pagamentoEfetivado = true;
      if (this.status === 'lotada') {
        this.status = 'disponivel';
      }
      return true;
    }
    return false;
  }
} 