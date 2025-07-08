import { cadastroProfessor } from '../services/api';
import { mostrarToast } from '../components/Toast';
import { renderHeader } from '../components/Header';
import { renderFooter } from '../components/Footer';

export function renderCadastroPage(root: HTMLElement) {
  root.innerHTML = `
    <div class="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div class="card p-5 shadow-lg border-0 text-center" style="max-width: 400px; width: 100%; border-radius: 18px;">
        <h2 class="mb-2" style="font-weight: 700;">Bem-vindo ao EduClick</h2>
        <p class="mb-4 text-muted" style="font-size: 1rem;">Sistema de gerenciamento educacional e agendamento de aulas</p>
        <form id="cadastroForm">
          <div class="mb-3 text-start">
            <input type="text" class="form-control" name="nome" placeholder="Nome completo" required />
          </div>
          <div class="mb-3 text-start">
            <input type="email" class="form-control" name="email" placeholder="Email" required />
          </div>
          <div class="mb-3 text-start">
            <input type="password" class="form-control" name="senha" placeholder="Senha" required />
          </div>
          <button type="submit" class="btn btn-success w-100 mb-2">Cadastrar</button>
        </form>
        <div class="mt-2">
          <a href="/login" style="font-size: 0.97rem;">Já tem conta? Entrar</a>
        </div>
      </div>
    </div>
  `;
  const form = document.getElementById('cadastroForm') as HTMLFormElement;
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data: any = Object.fromEntries(formData.entries());
      if (data.conteudosDominio) {
        data.conteudosDominio = data.conteudosDominio.split(',').map((s: string) => s.trim());
      }
      try {
        const response = await cadastroProfessor(data);
        if (response.ok) {
          mostrarToast('Cadastro realizado com sucesso!', 'success');
          setTimeout(() => {
            window.history.pushState({}, '', '/login');
            window.dispatchEvent(new PopStateEvent('popstate'));
          }, 1500);
        } else {
          const errorData = await response.json();
          mostrarToast('Erro ao cadastrar: ' + (errorData.error || 'Erro desconhecido'), 'danger');
        }
      } catch (error) {
        mostrarToast('Erro ao conectar com o servidor.', 'danger');
      }
    });
  }
} 