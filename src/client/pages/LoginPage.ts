import { loginProfessor } from '../services/api';
import { mostrarToast } from '../components/Toast';
import { renderHeader } from '../components/Header';
import { renderFooter } from '../components/Footer';

export function renderLoginPage(root: HTMLElement) {
  root.innerHTML = `
    <div class="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div class="card p-5 shadow-lg border-0 text-center" style="max-width: 370px; width: 100%; border-radius: 18px;">
        <h2 class="mb-2" style="font-weight: 700;">Bem-vindo ao EduClick</h2>
        <p class="mb-4 text-muted" style="font-size: 1rem;">Sistema de gerenciamento educacional e agendamento de aulas</p>
        <form id="loginForm">
          <div class="mb-3 text-start">
            <input type="email" class="form-control" name="email" placeholder="Email" required />
          </div>
          <div class="mb-3 text-start">
            <input type="password" class="form-control" name="senha" placeholder="Senha" required />
          </div>
          <button type="submit" class="btn btn-primary w-100 mb-2">Entrar</button>
        </form>
        <div class="mt-2">
          <a href="/cadastro" style="font-size: 0.97rem;">Não tem conta? Cadastre-se</a>
        </div>
      </div>
    </div>
  `;
  const form = document.getElementById('loginForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form as HTMLFormElement);
      const email = formData.get('email') as string;
      const senha = formData.get('senha') as string;
      try {
        const response = await loginProfessor(email, senha);
        if (response.ok) {
          window.location.href = '/dashboard';
        } else {
          mostrarToast('Erro no login. Verifique suas credenciais.', 'danger');
        }
      } catch (error) {
        mostrarToast('Erro ao conectar com o servidor.', 'danger');
      }
    });
  }
} 