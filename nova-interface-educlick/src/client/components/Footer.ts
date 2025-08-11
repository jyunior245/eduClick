export function renderFooter() {
  return `
    <footer class="footer bg-light text-center py-3 mt-5">
      <div class="container">
        <span class="text-muted">&copy; ${new Date().getFullYear()} EduClick. Todos os direitos reservados.</span>
        <span class="ms-3"><a href="/" class="text-muted">Início</a></span>
        <span class="ms-3"><a href="/contato" class="text-muted">Contato</a></span>
        <span class="ms-3"><a href="/sobre" class="text-muted">Sobre</a></span>
      </div>
    </footer>
  `;
} 