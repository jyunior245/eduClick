import { getProfessorPublico, getAulasPublicas, reservarAulaPublica } from '../services/api';
import { mostrarToast } from '../components/Toast';
import { renderFooter } from '../components/Footer';
import { ProfessorPublicoPage as ProfessorPublicoView } from '../../presentation/views/pages/ProfessorPublicoPage';

export async function renderProfessorPublicoPage(root: HTMLElement, linkUnico: string) {
  try {
    // Buscar dados do professor e aulas usando linkUnico
    const [profRes, aulasRes] = await Promise.all([
      getProfessorPublico(linkUnico),
      getAulasPublicas(linkUnico)
    ]);
    if (!profRes.ok) {
      root.innerHTML = `
        <main class="container my-5">
          <div class="container-fluid bg-light min-vh-100">
            <div class="container py-4">
              <div class="text-center">
                <h2 class="text-danger">Professor não encontrado</h2>
                <p>O link pode estar incorreto ou o professor pode ter removido seu perfil.</p>
                <a href="/" class="btn btn-primary">Voltar ao início</a>
              </div>
            </div>
          </div>
        </main>
        ${renderFooter()}
      `;
      return;
    }
    const professor = await profRes.json();
    const aulas = aulasRes.ok ? await aulasRes.json() : [];
    root.innerHTML = `
      <main class="container my-5">
        ${ProfessorPublicoView.render(professor, aulas)}
      </main>
      ${renderFooter()}
    `;

    // Conectar botões de reservar
    document.querySelectorAll('.reservar-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const aulaId = (e.target as HTMLElement).getAttribute('data-aula-id');
        const inputAulaId = document.getElementById('reservaAulaId') as HTMLInputElement;
        if (inputAulaId) inputAulaId.value = aulaId || '';
        // @ts-ignore
        window.bootstrap.Modal.getOrCreateInstance(document.getElementById('modalReserva')).show();
      });
    });

    // Submissão do formulário de reserva
    const formReserva = document.getElementById('formReserva') as HTMLFormElement | null;
    if (formReserva) {
      formReserva.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(formReserva);
        const aulaId = formData.get('aulaId') as string;
        const alunoNome = formData.get('alunoNome') as string;
        const alunoTelefone = formData.get('alunoTelefone') as string;
        try {
          const res = await reservarAulaPublica(linkUnico, aulaId, alunoNome, alunoTelefone);
          if (res.ok) {
            mostrarToast('Reserva realizada com sucesso!', 'success');
            // Fechar modal
            // @ts-ignore
            window.bootstrap.Modal.getOrCreateInstance(document.getElementById('modalReserva')).hide();
            // Recarregar a lista de aulas para atualizar vagas
            await renderProfessorPublicoPage(root, linkUnico);
          } else {
            const err = await res.json();
            mostrarToast('Erro ao reservar: ' + (err.error || 'Erro desconhecido'), 'danger');
          }
        } catch (error) {
          mostrarToast('Erro ao conectar com o servidor.', 'danger');
        }
      });
    }
  } catch (error) {
    root.innerHTML = `
      <main class="container my-5">
        <div class="container-fluid bg-light min-vh-100">
          <div class="container py-4">
            <div class="text-center">
              <h2 class="text-danger">Erro ao carregar página</h2>
              <p>Ocorreu um erro ao carregar as informações do professor.</p>
              <a href="/" class="btn btn-primary">Voltar ao início</a>
            </div>
          </div>
        </div>
      </main>
      ${renderFooter()}
    `;
  }
} 