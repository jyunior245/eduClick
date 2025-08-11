import { FormField } from '../components/forms/FormField';
import { Button } from '../components/ui/Button';

export interface LoginTemplateParams {
  onSubmit?: string;
  errorMessage?: string;
}

export class LoginTemplate {
  static render(params: LoginTemplateParams = {}): string {
    return `
      <div class="container py-5">
        <div class="row justify-content-center">
          <div class="col-md-6 col-lg-5">
            <div class="card shadow-sm">
              <div class="card-body p-4">
                <h2 class="mb-4 fw-bold text-center">Entrar</h2>
                ${params.errorMessage ? `<div class='alert alert-danger'>${params.errorMessage}</div>` : ''}
                <form id="form-login" onsubmit="${params.onSubmit || 'handleLoginSubmit'}(event)">
                  <div class="mb-3">
                    <label for="email" class="form-label">E-mail</label>
                    <input type="email" class="form-control" id="email" name="email" required>
                  </div>
                  <div class="mb-3">
                    <label for="senha" class="form-label">Senha</label>
                    <input type="password" class="form-control" id="senha" name="senha" required>
                  </div>
                  <button type="submit" class="btn btn-primary w-100">Entrar</button>
                </form>
                <div class="mt-3">
                  <button id="btnGoogleLogin" class="btn btn-outline-danger w-100">
                    <i class="bi bi-google me-1"></i> Continuar com Google
                  </button>
                </div>
                <div class="mt-3 text-center">
                  <a href="/cadastro">Não tem conta? Cadastre-se</a>
                </div>
                <div class="mt-2 text-center">
                  <a href="#" id="linkForgotPassword">Esqueci minha senha</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
 