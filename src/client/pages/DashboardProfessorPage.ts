import { getMinhasAulas, getPerfilProfessor, criarAula } from '../services/api';
import { mostrarToast } from '../components/Toast';
import { renderFooter } from '../components/Footer';
import { DashboardProfessorPage as DashboardProfessorView } from '../../presentation/views/pages/DashboardProfessorPage';

export async function renderDashboardProfessorPage(root: HTMLElement) {
  // Buscar aulas e perfil do professor
  const [aulasRes, perfilRes] = await Promise.all([
    getMinhasAulas(),
    getPerfilProfessor()
  ]);
  const aulas = aulasRes.ok ? await aulasRes.json() : [];
  const perfil = perfilRes.ok ? await perfilRes.json() : {};

  // Renderizar dashboard sem header duplicado
  root.innerHTML = DashboardProfessorView.render(perfil, aulas);

  // Evento do botão Sair
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      if ((window as any).logout) (window as any).logout();
    });
  }

  // Configurar eventos após renderização
  configurarEventosDashboard(perfil, aulas, root);
}

function configurarEventosDashboard(perfil: any, aulas: any[], root: HTMLElement) {
  // Botão Nova Aula
  const formNovaAula = document.getElementById('formNovaAula') as HTMLFormElement | null;
  if (formNovaAula) {
    formNovaAula.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(formNovaAula);
      const data: any = Object.fromEntries(formData.entries());
      // Ajustar tipos manualmente para o JSON
      const payload = {
        ...data,
        valor: parseFloat(data.valor),
        duracao: parseInt(data.duracao, 10),
        maxAlunos: parseInt(data.maxAlunos, 10)
      };
      try {
        const res = await criarAula(payload);
        if (res.ok) {
          mostrarToast('Aula criada com sucesso!', 'success');
          // Fechar modal
          // @ts-ignore
          const modal = window.bootstrap.Modal.getOrCreateInstance(document.getElementById('modalNovaAula'));
          modal.hide();
          // Recarregar dashboard
          await renderDashboardProfessorPage(root);
        } else {
          const err = await res.json();
          mostrarToast('Erro ao criar aula: ' + (err.error || 'Erro desconhecido'), 'danger');
        }
      } catch (error) {
        mostrarToast('Erro ao conectar com o servidor.', 'danger');
      }
    });
  }

  // Botão copiar link público
  const btnCopiar = document.getElementById('btn-copiar-link');
  const inputLink = document.getElementById('input-link-publico') as HTMLInputElement;
  if (btnCopiar && inputLink) {
    btnCopiar.addEventListener('click', () => {
      inputLink.select();
      navigator.clipboard.writeText(inputLink.value);
      mostrarToast('Link público copiado!', 'success');
    });
  }

  // Configurar eventos das abas (exemplo simplificado)
  const calendarioTab = document.getElementById('calendario-tab');
  if (calendarioTab) {
    calendarioTab.addEventListener('click', () => {
      setTimeout(() => {
        // Aqui você pode modularizar o calendário depois
      }, 100);
    });
  }
  const agendamentosTab = document.getElementById('agendamentos-tab');
  if (agendamentosTab) {
    agendamentosTab.addEventListener('click', () => {
      setTimeout(() => {
        // Aqui você pode modularizar os agendamentos depois
      }, 100);
    });
  }
} 