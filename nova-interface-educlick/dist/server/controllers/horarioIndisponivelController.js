"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listarHorariosIndisponiveis = void 0;
const listarHorariosIndisponiveis = (req, res) => {
    res.status(200).json({ message: 'Listagem de horários indisponíveis.' });
};
exports.listarHorariosIndisponiveis = listarHorariosIndisponiveis;
