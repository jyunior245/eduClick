"use strict";
// Serviço centralizado de API para o frontend EduClick
// Todas as funções retornam o resultado da chamada fetch (ou lançam erro)
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
exports.API_BASE = void 0;
exports.loginProfessor = loginProfessor;
exports.cadastroProfessor = cadastroProfessor;
exports.logoutProfessor = logoutProfessor;
exports.getPerfilProfessor = getPerfilProfessor;
exports.editarPerfilProfessor = editarPerfilProfessor;
exports.getMinhasAulas = getMinhasAulas;
exports.criarAula = criarAula;
exports.editarAula = editarAula;
exports.excluirAula = excluirAula;
exports.getHorariosIndisponiveis = getHorariosIndisponiveis;
exports.adicionarHorarioIndisponivel = adicionarHorarioIndisponivel;
exports.removerHorarioIndisponivel = removerHorarioIndisponivel;
exports.getAgendamentosRecebidos = getAgendamentosRecebidos;
exports.atualizarStatusAgendamento = atualizarStatusAgendamento;
exports.getProfessorPublico = getProfessorPublico;
exports.getAulasPublicas = getAulasPublicas;
exports.reservarAulaPublica = reservarAulaPublica;
exports.agendarComProfessor = agendarComProfessor;
exports.getInfoProfessor = getInfoProfessor;
exports.getAgendamentosAluno = getAgendamentosAluno;
exports.getAula = getAula;
exports.editarAulaAPI = editarAulaAPI;
exports.excluirAulaAPI = excluirAulaAPI;
exports.cancelarReservaAPI = cancelarReservaAPI;
exports.getPerfilEAulasPublicas = getPerfilEAulasPublicas;
exports.handleApiResponse = handleApiResponse;
exports.API_BASE = 'http://localhost:3000/api';
// Auth
function fetchComToken(url_1) {
    return __awaiter(this, arguments, void 0, function* (url, options = {}) {
        // Sempre envia o cookie de sessão
        return fetch(url, Object.assign(Object.assign({}, options), { headers: Object.assign(Object.assign({}, options.headers), { 'Content-Type': 'application/json' }), credentials: 'include' }));
    });
}
// Auth
function loginProfessor(email, senha) {
    return __awaiter(this, void 0, void 0, function* () {
        return fetch(`${exports.API_BASE}/professores/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha }),
            credentials: 'include'
        });
    });
}
function cadastroProfessor(data) {
    return __awaiter(this, void 0, void 0, function* () {
        return fetch(`${exports.API_BASE}/professores/cadastro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    });
}
function logoutProfessor() {
    return __awaiter(this, void 0, void 0, function* () {
        return fetch(`${exports.API_BASE}/professores/logout`, {
            method: 'POST',
            credentials: 'include'
        });
    });
}
// Perfil
function getPerfilProfessor() {
    return fetchComToken(`${exports.API_BASE}/professores/me`);
}
function editarPerfilProfessor(data) {
    return fetchComToken(`${exports.API_BASE}/professores/me`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}
// Aulas (professor)
function getMinhasAulas() {
    return fetchComToken(`${exports.API_BASE}/aulas/minhas-aulas`);
}
function criarAula(data) {
    return fetchComToken(`${exports.API_BASE}/aulas/criar`, {
        method: 'POST',
        body: JSON.stringify(data)
    });
}
function editarAula(aulaId, data) {
    return fetchComToken(`${exports.API_BASE}/aulas/${aulaId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}
function excluirAula(aulaId) {
    return fetchComToken(`${exports.API_BASE}/aulas/${aulaId}`, {
        method: 'DELETE'
    });
}
// Horários indisponíveis
function getHorariosIndisponiveis() {
    return fetchComToken(`${exports.API_BASE}/professores/me/horarios-indisponiveis`);
}
function adicionarHorarioIndisponivel(data) {
    return fetchComToken(`${exports.API_BASE}/professores/me/horarios-indisponiveis`, {
        method: 'POST',
        body: JSON.stringify(data)
    });
}
function removerHorarioIndisponivel(id) {
    return fetchComToken(`${exports.API_BASE}/professores/me/horarios-indisponiveis/${id}`, {
        method: 'DELETE'
    });
}
// Agendamentos (professor)
function getAgendamentosRecebidos() {
    return fetchComToken(`${exports.API_BASE}/professores/me/agendamentos`);
}
function atualizarStatusAgendamento(id, status) {
    return fetchComToken(`${exports.API_BASE}/agendamentos/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
    });
}
// Página pública do professor
function getProfessorPublico(linkUnico) {
    return fetch(`${exports.API_BASE}/professor-publico/${encodeURIComponent(linkUnico)}`);
}
function getAulasPublicas(linkUnico) {
    return fetch(`${exports.API_BASE}/professor-publico/${encodeURIComponent(linkUnico)}/aulas`);
}
function reservarAulaPublica(linkUnico, aulaId, reserva) {
    return fetch(`${exports.API_BASE}/professor-publico/${encodeURIComponent(linkUnico)}/reservar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reserva)
    });
}
// Agendamentos públicos (aluno)
function agendarComProfessor(professorId, agendamento) {
    return fetch(`${exports.API_BASE}/professores/${professorId}/agendamentos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agendamento)
    });
}
function getInfoProfessor(professorId) {
    return fetch(`${exports.API_BASE}/professores/${professorId}`);
}
function getAgendamentosAluno(professorId, telefone) {
    return fetch(`${exports.API_BASE}/professores/${professorId}/agendamentos/aluno/${telefone}`);
}
// Aulas (detalhes e cancelamento)
function getAula(aulaId) {
    return fetchComToken(`${exports.API_BASE}/aulas/${aulaId}`);
}
function editarAulaAPI(aulaId, data) {
    return fetchComToken(`${exports.API_BASE}/aulas/${aulaId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}
function excluirAulaAPI(aulaId) {
    return fetchComToken(`${exports.API_BASE}/aulas/${aulaId}`, {
        method: 'DELETE'
    });
}
function cancelarReservaAPI(aulaId, nome, telefone) {
    return fetchComToken(`${exports.API_BASE}/aulas/${aulaId}/cancelar-reserva`, {
        method: 'POST',
        body: JSON.stringify({ nome, telefone })
    });
}
// Página pública do professor (perfil + aulas)
function getPerfilEAulasPublicas(linkUnico) {
    return fetch(`${exports.API_BASE}/professor-publico/${encodeURIComponent(linkUnico)}`);
}
// Utilitário de tratamento
function handleApiResponse(response) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!response.ok) {
                const errorData = yield response.json().catch(() => ({ error: 'Erro desconhecido' }));
                return { success: false, error: errorData.error || `Erro ${response.status}` };
            }
            const data = yield response.json();
            return { success: true, data };
        }
        catch (error) {
            return { success: false, error: 'Erro ao processar resposta' };
        }
    });
}
