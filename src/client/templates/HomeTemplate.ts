export class HomeTemplate {
  static render(): string {
    return `
      <div class="container py-5">
        <div class="row align-items-center justify-content-center">
          <div class="col-lg-6 text-center text-lg-start mb-4 mb-lg-0">
            <h1 class="display-4 fw-bold mb-3">Bem-vindo ao <span class="text-primary">EduClick</span></h1>
            <p class="lead mb-4">Plataforma moderna para agendamento de aulas, gestão de professores e alunos. Simples, rápida e eficiente para sua rotina educacional.</p>
            <div class="d-flex flex-column flex-md-row gap-3 justify-content-center justify-content-lg-start">
              <a href="/login" class="btn btn-primary btn-lg px-4">Entrar</a>
              <a href="/cadastro" class="btn btn-outline-primary btn-lg px-4">Criar Conta</a>
            </div>
          </div>
          <div class="col-lg-6 text-center">
            <img src="https://cdn.pixabay.com/photo/2017/01/31/13/14/online-2025987_1280.png" alt="Educação Online" class="img-fluid rounded shadow" style="max-height: 340px;">
          </div>
        </div>
        <div class="row mt-5">
          <div class="col-12 text-center">
            <h2 class="h4 fw-bold mb-3">Funcionalidades</h2>
          </div>
          <div class="col-md-4 mb-4">
            <div class="card h-100 border-0 shadow-sm">
              <div class="card-body text-center">
                <i class="bi bi-calendar3 display-5 text-primary mb-3"></i>
                <h5 class="card-title">Agendamento Online</h5>
                <p class="card-text">Permita que alunos reservem aulas facilmente com poucos cliques, visualizando horários disponíveis em tempo real.</p>
              </div>
            </div>
          </div>
          <div class="col-md-4 mb-4">
            <div class="card h-100 border-0 shadow-sm">
              <div class="card-body text-center">
                <i class="bi bi-person-badge display-5 text-primary mb-3"></i>
                <h5 class="card-title">Gestão de Professores</h5>
                <p class="card-text">Professores podem personalizar seus perfis, gerenciar aulas, horários e acompanhar reservas de forma intuitiva.</p>
              </div>
            </div>
          </div>
          <div class="col-md-4 mb-4">
            <div class="card h-100 border-0 shadow-sm">
              <div class="card-body text-center">
                <i class="bi bi-people display-5 text-primary mb-3"></i>
                <h5 class="card-title">Experiência do Aluno</h5>
                <p class="card-text">Alunos têm acesso fácil ao histórico de agendamentos, notificações e comunicação direta com professores.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
} 