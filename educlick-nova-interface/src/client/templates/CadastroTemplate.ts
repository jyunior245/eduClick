import { FormField } from '../components/forms/FormField';
import { Button } from '../components/ui/Button';

export interface CadastroTemplateParams {
  onSubmit?: string; // nome da função global para submit
  errorMessage?: string;
}

export class CadastroTemplate {
  static render(params: CadastroTemplateParams = {}): string {
    return `
      <div class="cadastro-container">
        <div class="cadastro-card">
          <div class="cadastro-header">
            <h2 class="cadastro-title">Criar Conta</h2>
            <p class="cadastro-subtitle">Junte-se ao EduClick</p>
          </div>
          
          ${params.errorMessage ? `<div class='alert alert-danger'>${params.errorMessage}</div>` : ''}
          
          <form id="form-cadastro" class="cadastro-form" onsubmit="${params.onSubmit || 'handleCadastroSubmit'}(event)">
            <div class="form-group">
              <label for="nome" class="form-label">NOME</label>
              <input type="text" class="form-control" id="nome" name="nome" required>
            </div>
            <div class="form-group">
              <label for="email" class="form-label">E-MAIL</label>
              <input type="email" class="form-control" id="email" name="email" required>
            </div>
            <div class="form-group">
              <label for="senha" class="form-label">SENHA</label>
              <input type="password" class="form-control" id="senha" name="senha" required minlength="6">
            </div>
            <div class="form-group">
              <label for="confirmarSenha" class="form-label">CONFIRMAR SENHA</label>
              <input type="password" class="form-control" id="confirmarSenha" name="confirmarSenha" required minlength="6">
            </div>
            <button type="submit" class="cadastro-btn">Cadastrar</button>
          </form>
          
          <div class="cadastro-links">
            <button id="btnGoogleCadastro" class="btn btn-secondary">
              <i class="bi bi-google me-1"></i> Cadastrar com Google
            </button>
            <div class="mt-3">
              <a href="/login">Já tem conta? Entrar</a>
            </div>
          </div>
        </div>
      </div>
    `;
  }
} 