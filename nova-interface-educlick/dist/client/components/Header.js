"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderHeader = renderHeader;
function renderHeader(opcoes) {
    const usuario = opcoes === null || opcoes === void 0 ? void 0 : opcoes.usuario;
    return `
    <header class="header">
      <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <div class="container-fluid">
          <a class="navbar-brand" href="/">EduClick</a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ms-auto">
              <li class="nav-item"><a class="nav-link" href="/">Início</a></li>
              <li class="nav-item"><a class="nav-link" href="/dashboard">Dashboard</a></li>
              <li class="nav-item"><a class="nav-link" href="/dashboard-aluno">Painel do Aluno</a></li>
              <li class="nav-item"><a class="nav-link" href="/meus-agendamentos">Meus Agendamentos</a></li>
              ${usuario ? `
                <li class="nav-item"><span class="nav-link">Olá, ${usuario.nome}</span></li>
                <li class="nav-item"><a class="nav-link" href="#" onclick="logout()">Sair</a></li>
              ` : `
                <li class="nav-item"><a class="nav-link" href="/login">Login</a></li>
                <li class="nav-item"><a class="nav-link" href="/cadastro">Cadastro</a></li>
              `}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  `;
}
