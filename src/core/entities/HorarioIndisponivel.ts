export class HorarioIndisponivel {
  constructor(
    public readonly id: string,
    public readonly professorId: string,
    public dataInicio: Date,
    public dataFim: Date,
    public motivo: string
  ) {}
} 