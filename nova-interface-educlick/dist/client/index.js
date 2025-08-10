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
require("../presentation/views/styles/cadastro.css");
const LoginPage_1 = require("./pages/LoginPage");
const CadastroPage_1 = require("./pages/CadastroPage");
const DashboardProfessorPage_1 = require("./pages/DashboardProfessorPage");
const ProfessorPublicoPage_1 = require("./pages/ProfessorPublicoPage");
const AgendamentoPage_1 = require("./pages/AgendamentoPage");
const EditarPerfilProfessorPage_1 = require("./pages/EditarPerfilProfessorPage");
const api_1 = require("./services/api");
const HomePage_1 = require("./pages/HomePage");
const logger_1 = require("./utils/logger");
const CadastroService_1 = require("./services/CadastroService");
const LocalAuthProvider_1 = require("infrastructure/auth/LocalAuthProvider");
const LoginService_1 = require("./services/LoginService");
logger_1.logger.info('EduClick - Cliente iniciado');
function logout() {
    (0, api_1.logoutProfessor)().finally(() => window.location.href = '/');
}
function rotear() {
    return __awaiter(this, void 0, void 0, function* () {
        const root = document.getElementById('root');
        if (!root)
            return;
        const path = window.location.pathname;
        // Rotas públicas
        if (path === '/login')
            return (0, LoginPage_1.renderLoginPage)(root);
        if (path === '/cadastro')
            return (0, CadastroPage_1.renderCadastroPage)(root);
        if (path.startsWith('/professor/')) {
            const linkUnico = decodeURIComponent(path.split('/')[2]);
            return (0, ProfessorPublicoPage_1.renderProfessorPublicoPage)(root, linkUnico);
        }
        if (path.startsWith('/agendar/')) {
            const professorId = path.split('/')[2];
            return (0, AgendamentoPage_1.renderAgendamentoPage)(root, professorId);
        }
        // Rotas protegidas (dashboard, editar perfil)
        if (path === '/dashboard' || path === '/editar-perfil') {
            const perfilRes = yield (0, api_1.getPerfilProfessor)();
            if (!perfilRes.ok) {
                window.history.pushState({}, '', '/login');
                return (0, LoginPage_1.renderLoginPage)(root);
            }
            if (path === '/dashboard')
                return (0, DashboardProfessorPage_1.renderDashboardProfessorPage)(root);
            if (path === '/editar-perfil')
                return (0, EditarPerfilProfessorPage_1.renderEditarPerfilProfessorPage)(root);
        }
        // Página inicial
        return (0, HomePage_1.renderHomePage)(root);
    });
}
const authProvider = new LocalAuthProvider_1.FirebaseAuthProvider();
CadastroService_1.CadastroService.setAuthProvider(authProvider);
LoginService_1.LoginService.setAuthProvider(authProvider);
window.addEventListener('popstate', rotear);
window.addEventListener('DOMContentLoaded', rotear);
window.logout = logout;
