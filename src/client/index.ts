import '../presentation/views/styles/cadastro.css';
import { renderLoginPage } from './pages/LoginPage';
import { renderCadastroPage } from './pages/CadastroPage';
import { renderDashboardProfessorPage } from './pages/DashboardProfessorPage';
import { renderProfessorPublicoPage } from './pages/ProfessorPublicoPage';
import { renderAgendamentoPage } from './pages/AgendamentoPage';
import { renderEditarPerfilProfessorPage } from './pages/EditarPerfilProfessorPage';
import { logoutProfessor, getPerfilProfessor } from './services/api';
import { renderHomePage } from './pages/HomePage';

import { logger } from './utils/logger';
import { CadastroService } from './services/CadastroService';
import { FirebaseAuthProvider } from '../infrastructure/auth/LocalAuthProvider';
import { LoginService } from './services/LoginService';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { setupPushAfterLogin } from './services/notifications';


logger.info('EduClick - Cliente iniciado');

function logout() {
  logoutProfessor().finally(() => window.location.href = '/');
}

async function rotear() {
  const root = document.getElementById('root');
  if (!root) return;
  const path = window.location.pathname;

  // Rotas públicas
  if (path === '/login') return renderLoginPage(root);
  if (path === '/cadastro') return renderCadastroPage(root);
  if (path.startsWith('/professor/')) {
    const linkUnico = decodeURIComponent(path.split('/')[2]);
    return renderProfessorPublicoPage(root, linkUnico);
  }
  if (path.startsWith('/agendar/')) {
    const professorId = path.split('/')[2];
    return renderAgendamentoPage(root, professorId);
  }

  // Rotas protegidas (dashboard, editar perfil)
  if (path === '/dashboard' || path === '/editar-perfil') {
    const perfilRes = await getPerfilProfessor();
    if (!perfilRes.ok) {
      window.history.pushState({}, '', '/login');
      return renderLoginPage(root);
    }
    if (path === '/dashboard') return renderDashboardProfessorPage(root);
    if (path === '/editar-perfil') return renderEditarPerfilProfessorPage(root);
  }

  // Página inicial
  return renderHomePage(root);
}

const authProvider = new FirebaseAuthProvider();
CadastroService.setAuthProvider(authProvider);
LoginService.setAuthProvider(authProvider);


window.addEventListener('popstate', rotear);
window.addEventListener('DOMContentLoaded', rotear);

(window as any).logout = logout; 

// Se o usuário já estiver autenticado (ex.: após refresh), registra FCM automaticamente
try {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        // Tenta obter idToken e registrar token FCM
        const idToken = await user.getIdToken().catch(() => undefined);
        await setupPushAfterLogin(idToken);
      } catch (e) {
        console.warn('[FCM] Falha ao registrar push no onAuthStateChanged:', e);
      }
    }
  });
} catch {}


