"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CadastroTemplate = void 0;
class CadastroTemplate {
    static render(params = {}) {
        return `
      <div class="container py-5">
        <div class="row justify-content-center">
          <div class="col-md-6 col-lg-5">
            <div class="card shadow-sm">
              <div class="card-body p-4">
                <h2 class="mb-4 fw-bold text-center">Criar Conta</h2>
                ${params.errorMessage ? `<div class='alert alert-danger'>${params.errorMessage}</div>` : ''}
                <form id="form-cadastro" onsubmit="${params.onSubmit || 'handleCadastroSubmit'}(event)">
                  <div class="mb-3">
                    <label for="nome" class="form-label">Nome</label>
                    <input type="text" class="form-control" id="nome" name="nome" required>
                  </div>
                  <div class="mb-3">
                    <label for="email" class="form-label">E-mail</label>
                    <input type="email" class="form-control" id="email" name="email" required>
                  </div>
                  <div class="mb-3">
                    <label for="senha" class="form-label">Senha</label>
                    <input type="password" class="form-control" id="senha" name="senha" required minlength="6">
                  </div>
                  <div class="mb-3">
                    <label for="confirmarSenha" class="form-label">Confirmar Senha</label>
                    <input type="password" class="form-control" id="confirmarSenha" name="confirmarSenha" required minlength="6">
                  </div>
                  <button type="submit" class="btn btn-primary w-100">Cadastrar</button>
                </form>
                <div class="mt-3 text-center">
                  <a href="/login">Já tem conta? Entrar</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    }
}
exports.CadastroTemplate = CadastroTemplate;
