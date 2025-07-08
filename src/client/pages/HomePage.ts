import { renderHeader } from '../components/Header';
import { renderFooter } from '../components/Footer';

export function renderHomePage(root: HTMLElement) {
  root.innerHTML = `
    <div class="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div class="card p-5 shadow-lg border-0" style="max-width: 370px; width: 100%; border-radius: 18px;">
        <div class="d-flex flex-column gap-3">
          <a href="/login" class="btn btn-primary btn-lg w-100" style="border-radius: 8px; font-size: 1.15rem;">Login</a>
          <a href="/cadastro" class="btn btn-success btn-lg w-100" style="border-radius: 8px; font-size: 1.15rem;">Cadastro</a>
        </div>
      </div>
    </div>
  `;
} 