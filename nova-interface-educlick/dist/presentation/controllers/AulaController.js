"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AulaController = void 0;
const AulaService_1 = require("../../domain/services/AulaService");
const singletons_1 = require("../../infrastructure/repositories/singletons");
const Aula_1 = require("../../core/entities/Aula");
const aulaService = new AulaService_1.AulaService(singletons_1.aulaRepository);
class AulaController {
    static criar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { titulo, conteudo, valor, duracao, dataHora, observacoes, maxAlunos } = req.body;
                const professorId = (_a = req.usuario) === null || _a === void 0 ? void 0 : _a.uid;
                console.log('[AulaController.criar] professorId do token:', professorId);
                if (!professorId) {
                    return res.status(401).json({ error: "Não autenticado" });
                }
                const aula = new Aula_1.Aula(Date.now().toString(), professorId, titulo, conteudo, valor, duracao, new Date(dataHora), observacoes, maxAlunos || 1);
                console.log('[AulaController.criar] Aula criada:', {
                    id: aula.id,
                    professorId: aula.professorId,
                    titulo: aula.titulo,
                    conteudo: aula.conteudo,
                    valor: aula.valor,
                    duracao: aula.duracao,
                    dataHora: aula.dataHora,
                    observacoes: aula.observacoes,
                    maxAlunos: aula.maxAlunos
                });
                yield aulaService.criarAula(aula);
                res.status(201).json({ message: "Aula criada com sucesso", aula });
            }
            catch (err) {
                res.status(400).json({ error: err.message });
            }
        });
    }
    static listarDoProfessor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                console.log('[AulaController.listarDoProfessor] Iniciando listagem de aulas do professor');
                const professorId = (_a = req.usuario) === null || _a === void 0 ? void 0 : _a.uid;
                console.log('[AulaController.listarDoProfessor] professorId:', professorId);
                if (!professorId) {
                    console.log('[AulaController.listarDoProfessor] Erro: professorId não encontrado');
                    return res.status(401).json({ error: "Não autenticado" });
                }
                const aulas = yield aulaService.listarAulasPorProfessor(professorId);
                console.log('[AulaController.listarDoProfessor] Aulas encontradas:', aulas.length);
                res.json(aulas);
            }
            catch (err) {
                console.error('[AulaController.listarDoProfessor] Erro:', err);
                res.status(400).json({ error: err.message });
            }
        });
    }
    static listarDisponiveisPorProfessor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { professorId } = req.params;
                const aulas = yield aulaService.listarAulasDisponiveisPorProfessor(professorId);
                res.json(aulas);
            }
            catch (err) {
                res.status(400).json({ error: err.message });
            }
        });
    }
    static reservar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { aulaId } = req.params;
                const { alunoNome, alunoTelefone } = req.body;
                if (!alunoNome || !alunoTelefone) {
                    return res.status(400).json({ error: "Nome e telefone do aluno são obrigatórios" });
                }
                const reservada = yield aulaService.reservarAula(aulaId, alunoNome, alunoTelefone, '');
                if (reservada) {
                    res.json({ message: "Aula reservada com sucesso" });
                }
                else {
                    res.status(400).json({ error: "Não foi possível reservar a aula" });
                }
            }
            catch (err) {
                res.status(400).json({ error: err.message });
            }
        });
    }
    static cancelar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { aulaId } = req.params;
                const professorId = (_a = req.usuario) === null || _a === void 0 ? void 0 : _a.uid;
                if (!professorId) {
                    return res.status(401).json({ error: "Não autenticado" });
                }
                yield aulaService.cancelarAula(aulaId);
                res.json({ message: "Aula cancelada com sucesso" });
            }
            catch (err) {
                res.status(400).json({ error: err.message });
            }
        });
    }
    // Novos métodos para funcionalidades avançadas
    static buscarPorId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                console.log('[AulaController.buscarPorId] Iniciando busca de aula por ID');
                console.log('[AulaController.buscarPorId] Usuário:', req.usuario);
                const { aulaId } = req.params;
                const professorId = (_a = req.usuario) === null || _a === void 0 ? void 0 : _a.uid;
                console.log('[AulaController.buscarPorId] aulaId:', aulaId);
                console.log('[AulaController.buscarPorId] professorId:', professorId);
                if (!professorId) {
                    console.log('[AulaController.buscarPorId] Erro: professorId não encontrado');
                    return res.status(401).json({ error: "Não autenticado" });
                }
                const aula = yield aulaService.buscarAulaPorId(aulaId);
                console.log('[AulaController.buscarPorId] Aula encontrada:', aula ? { id: aula.id, titulo: aula.titulo } : 'null');
                if (!aula) {
                    console.log('[AulaController.buscarPorId] Erro: aula não encontrada');
                    return res.status(404).json({ error: "Aula não encontrada" });
                }
                // Verificar se a aula pertence ao professor
                if (aula.professorId !== professorId) {
                    console.log('[AulaController.buscarPorId] Erro: aula não pertence ao professor');
                    console.log('[AulaController.buscarPorId] professorId da aula:', aula.professorId);
                    console.log('[AulaController.buscarPorId] professorId do token:', professorId);
                    return res.status(403).json({ error: "Acesso negado" });
                }
                console.log('[AulaController.buscarPorId] Aula retornada com sucesso');
                res.json(aula);
            }
            catch (err) {
                console.error('[AulaController.buscarPorId] Erro:', err);
                res.status(400).json({ error: err.message });
            }
        });
    }
    static atualizar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                console.log('[AulaController.atualizar] Iniciando atualização de aula');
                console.log('[AulaController.atualizar] Usuário:', req.usuario);
                console.log('[AulaController.atualizar] Headers:', req.headers);
                console.log('[AulaController.atualizar] Body:', req.body);
                const { aulaId } = req.params;
                const { titulo, conteudo, valor, duracao, dataHora, observacoes, maxAlunos, status } = req.body;
                const professorId = (_a = req.usuario) === null || _a === void 0 ? void 0 : _a.uid;
                console.log('[AulaController.atualizar] aulaId:', aulaId);
                console.log('[AulaController.atualizar] professorId do token:', professorId);
                console.log('[AulaController.atualizar] Dados recebidos:', { titulo, valor, duracao, dataHora, status });
                if (!professorId) {
                    console.log('[AulaController.atualizar] Erro: professorId não encontrado no token');
                    return res.status(401).json({ error: "Não autenticado" });
                }
                const aula = yield aulaService.buscarAulaPorId(aulaId);
                if (!aula) {
                    console.log('[AulaController.atualizar] Erro: aula não encontrada');
                    return res.status(404).json({ error: "Aula não encontrada" });
                }
                console.log('[AulaController.atualizar] Aula encontrada:', {
                    id: aula.id,
                    professorId: aula.professorId,
                    titulo: aula.titulo
                });
                // Verificar se a aula pertence ao professor
                if (aula.professorId !== professorId) {
                    console.log('[AulaController.atualizar] Erro: aula não pertence ao professor');
                    console.log('[AulaController.atualizar] professorId da aula:', aula.professorId);
                    console.log('[AulaController.atualizar] professorId do token:', professorId);
                    return res.status(403).json({ error: "Acesso negado" });
                }
                // Atualizar campos da aula
                if (titulo !== undefined)
                    aula.titulo = titulo;
                if (conteudo !== undefined)
                    aula.conteudo = conteudo;
                if (valor !== undefined)
                    aula.valor = valor;
                if (duracao !== undefined)
                    aula.duracao = duracao;
                if (dataHora) {
                    const novaData = new Date(dataHora);
                    if (isNaN(novaData.getTime())) {
                        console.log('[AulaController.atualizar] Erro: data/hora inválida');
                        return res.status(400).json({ error: "Data/Hora inválida" });
                    }
                    aula.dataHora = novaData;
                }
                if (observacoes !== undefined)
                    aula.observacoes = observacoes;
                if (maxAlunos !== undefined)
                    aula.maxAlunos = maxAlunos;
                if (status)
                    aula.status = status;
                console.log('[AulaController.atualizar] Atualizando aula com dados:', {
                    titulo: aula.titulo,
                    valor: aula.valor,
                    duracao: aula.duracao,
                    dataHora: aula.dataHora,
                    status: aula.status
                });
                yield aulaService.atualizarAula(aula);
                console.log('[AulaController.atualizar] Aula atualizada com sucesso');
                res.json({ message: "Aula atualizada com sucesso", aula });
            }
            catch (err) {
                console.error('[AulaController.atualizar] Erro:', err);
                res.status(400).json({ error: err.message });
            }
        });
    }
    static excluir(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { aulaId } = req.params;
                const professorId = (_a = req.usuario) === null || _a === void 0 ? void 0 : _a.uid;
                if (!professorId) {
                    return res.status(401).json({ error: "Não autenticado" });
                }
                const aula = yield aulaService.buscarAulaPorId(aulaId);
                if (!aula) {
                    return res.status(404).json({ error: "Aula não encontrada" });
                }
                // Verificar se a aula pertence ao professor
                if (aula.professorId !== professorId) {
                    return res.status(403).json({ error: "Acesso negado" });
                }
                yield aulaService.excluirAula(aulaId);
                res.json({ message: "Aula excluída com sucesso" });
            }
            catch (err) {
                res.status(400).json({ error: err.message });
            }
        });
    }
    static cancelarReserva(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                console.log('[cancelarReserva] chamada recebida:', req.method, req.originalUrl);
                const { aulaId } = req.params;
                const { nome, telefone } = req.body;
                console.log('[cancelarReserva] params:', { aulaId });
                console.log('[cancelarReserva] body:', { nome, telefone });
                // Verificar se os dados obrigatórios foram fornecidos
                if (!nome || !telefone) {
                    return res.status(400).json({ error: "Nome e telefone são obrigatórios" });
                }
                const aula = yield aulaService.buscarAulaPorId(aulaId);
                if (!aula) {
                    console.log('[cancelarReserva] Aula não encontrada');
                    return res.status(404).json({ error: "Aula não encontrada" });
                }
                // Verificar se a reserva existe e pertence ao aluno
                const reserva = (_a = aula.reservas) === null || _a === void 0 ? void 0 : _a.find(r => r.nome === nome && r.telefone === telefone);
                if (!reserva) {
                    return res.status(404).json({ error: "Reserva não encontrada" });
                }
                // Apenas o aluno pode cancelar sua própria reserva
                // Professores não podem cancelar reservas de alunos
                const professorId = (_b = req.usuario) === null || _b === void 0 ? void 0 : _b.uid;
                if (professorId) {
                    return res.status(403).json({ error: "Professores não podem cancelar reservas de alunos. Apenas o aluno pode cancelar sua própria reserva." });
                }
                const cancelada = yield aulaService.cancelarReserva(aulaId, nome, telefone);
                if (cancelada) {
                    console.log('[cancelarReserva] Reserva cancelada com sucesso');
                    res.json({ message: "Reserva cancelada com sucesso" });
                }
                else {
                    console.log('[cancelarReserva] Não foi possível cancelar a reserva');
                    res.status(400).json({ error: "Não foi possível cancelar a reserva" });
                }
            }
            catch (err) {
                console.log('[cancelarReserva] Erro:', err.message);
                res.status(400).json({ error: err.message });
            }
        });
    }
    static atualizarStatusAgendamento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { status } = req.body;
                if (!status)
                    return res.status(400).json({ error: 'Status é obrigatório' });
                const aula = yield aulaService.buscarAulaPorId(id);
                if (!aula)
                    return res.status(404).json({ error: 'Aula/agendamento não encontrado' });
                aula.status = status;
                yield aulaService.atualizarAula(aula);
                res.json({ message: 'Status atualizado com sucesso', aula });
            }
            catch (err) {
                res.status(400).json({ error: err.message });
            }
        });
    }
    static reagendar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { aulaId } = req.params;
                const { novaDataHora } = req.body;
                const professorId = (_a = req.usuario) === null || _a === void 0 ? void 0 : _a.uid;
                if (!professorId)
                    return res.status(401).json({ error: "Não autenticado" });
                const aula = yield aulaService.buscarAulaPorId(aulaId);
                if (!aula)
                    return res.status(404).json({ error: "Aula não encontrada" });
                if (aula.professorId !== professorId)
                    return res.status(403).json({ error: "Acesso negado" });
                const novaData = new Date(novaDataHora);
                if (isNaN(novaData.getTime()))
                    return res.status(400).json({ error: "Data/Hora inválida" });
                const aulaReagendada = yield aulaService.reagendarAula(aulaId, novaData);
                res.json({ message: "Aula reagendada com sucesso", aula: aulaReagendada });
            }
            catch (err) {
                res.status(400).json({ error: err.message });
            }
        });
    }
}
exports.AulaController = AulaController;
