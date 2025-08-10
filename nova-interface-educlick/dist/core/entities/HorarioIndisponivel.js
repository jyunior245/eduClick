"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HorarioIndisponivel = void 0;
class HorarioIndisponivel {
    constructor(id, professorId, dataInicio, dataFim, motivo) {
        this.id = id;
        this.professorId = professorId;
        this.dataInicio = dataInicio;
        this.dataFim = dataFim;
        this.motivo = motivo;
    }
}
exports.HorarioIndisponivel = HorarioIndisponivel;
