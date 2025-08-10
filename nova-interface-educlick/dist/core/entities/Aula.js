"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Aula = void 0;
class Aula {
    constructor(id, professorId, titulo, conteudo, valor, // Valor específico desta aula
    duracao, // em minutos
    dataHora, observacoes, maxAlunos = 1, reservas = [], status = 'disponivel') {
        this.id = id;
        this.professorId = professorId;
        this.titulo = titulo;
        this.conteudo = conteudo;
        this.valor = valor;
        this.duracao = duracao;
        this.dataHora = dataHora;
        this.observacoes = observacoes;
        this.maxAlunos = maxAlunos;
        this.reservas = reservas;
        this.status = status;
    }
    get estaDisponivel() {
        return this.status === 'disponivel' && this.reservas.length < this.maxAlunos;
    }
    get vagasRestantes() {
        return this.maxAlunos - this.reservas.length;
    }
    get valorFormatado() {
        return `R$ ${this.valor.toFixed(2).replace('.', ',')}`;
    }
    get duracaoFormatada() {
        const horas = Math.floor(this.duracao / 60);
        const minutos = this.duracao % 60;
        if (horas > 0) {
            return `${horas}h ${minutos > 0 ? `${minutos}min` : ''}`.trim();
        }
        return `${minutos}min`;
    }
    reservarPublico(nome, telefone, email) {
        if (!this.estaDisponivel)
            return false;
        if (this.reservas.find(r => r.nome === nome && r.telefone === telefone))
            return false;
        this.reservas.push({ nome, telefone, email, status: 'agendado', pagamentoEfetivado: true });
        if (this.reservas.length >= this.maxAlunos) {
            this.status = 'lotada';
        }
        return true;
    }
    cancelarReservaPublico(nome, telefone) {
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
exports.Aula = Aula;
