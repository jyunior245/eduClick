export function renderHeader(options?: { usuario?: any }) {
  const usuario = options?.usuario;
  return `
    <header class="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
      <div class="container">
        <a class="navbar-brand fw-bold" href="/">EduClick</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
            <li class="nav-item"><a class="nav-link" href="/">Início</a></li>
            ${usuario ? `<li class="nav-item"><a class="nav-link" href="/dashboard">Dashboard</a></li>` : ''}
            ${!usuario ? `<li class="nav-item"><a class="nav-link" href="/login">Login</a></li>` : ''}
            ${!usuario ? `<li class="nav-item"><a class="nav-link" href="/cadastro">Cadastro</a></li>` : ''}
            ${usuario ? `<li class="nav-item"><a class="nav-link" href="#" id="logout-link">Sair</a></li>` : ''}
          </ul>
        </div>
      </div>
    </header>
    <script>
      document.addEventListener('DOMContentLoaded', function() {
        const logoutLink = document.getElementById('logout-link');
        if (logoutLink) {
          logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            if (window.logout) window.logout();
          });
        }
      });
    </script>
  `;
}