import { FormField } from '../components/forms/FormField';
import { Button } from '../components/ui/Button';

export interface LoginTemplateParams {
  onSubmit?: string;
  errorMessage?: string;
}

export class LoginTemplate {
  static render(params: LoginTemplateParams = {}): string {
    return `
      <div class="login-container">
        <div class="login-card">
          <div class="login-header">
            <h2 class="login-title">Entrar</h2>
            <p class="login-subtitle">Acesse sua conta EduClick</p>
          </div>
          
          ${params.errorMessage ? `<div class='alert alert-danger'>${params.errorMessage}</div>` : ''}
          
          <form id="form-login" class="login-form" onsubmit="${params.onSubmit || 'handleLoginSubmit'}(event)">
            <div class="form-group">
              <label for="email" class="form-label">E-MAIL</label>
              <input type="email" class="form-control" id="email" name="email" required>
            </div>
            <div class="form-group">
              <label for="senha" class="form-label">SENHA</label>
              <input type="password" class="form-control" id="senha" name="senha" required>
            </div>
            <button type="submit" class="login-btn">Entrar</button>
          </form>
          
          <div class="login-links">
            <button id="btnGoogleLogin" class="btn btn-secondary">
              <i class="bi bi-google me-1"></i> Continuar com Google
            </button>
            <div class="mt-3">
              <a href="/cadastro">Não tem conta? Cadastre-se</a>
            </div>
            <div class="mt-2">
              <a href="#" id="linkForgotPassword">Esqueci minha senha</a>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
 