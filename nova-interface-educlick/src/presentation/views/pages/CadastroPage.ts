export class CadastroPage {
  static render(): string {
    return `
      <div class="cadastro-container">
        <h2 class="text-center mb-4">Cadastro de Professor</h2>
        <form id="formCadastro">
          <div class="form-group">
            <label class="form-label">Nome Completo</label>
            <input type="text" class="form-control" name="nome" required />
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" class="form-control" name="email" required />
          </div>
          <div class="form-group">
            <label class="form-label">Senha</label>
            <input type="password" class="form-control" name="senha" required />
          </div>
          <button type="submit" class="btn btn-primary w-100">Cadastrar</button>
        </form>
        <div class="text-center mt-3">
          <a href="/login" onclick="event.preventDefault(); window.history.pushState({}, '', '/login'); rotear();">Já tem conta? Faça login</a>
        </div>
      </div>
    `;
  }
}
