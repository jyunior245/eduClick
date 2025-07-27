import { AgendamentoTemplate } from '../templates/AgendamentoTemplate';
import { AgendamentoService, AgendamentoFormData } from '../services/AgendamentoService'
import { mostrarToast } from '../components/Toast';

export async function renderAgendamentoPage(root: HTMLElement, professorId: string): Promise<void> {
  try {
    const professor = await AgendamentoService.carregarProfessor(professorId);
    root.innerHTML = AgendamentoTemplate.render({ professor });
    setupAgendamentoHandler(professorId);
  } catch (error) {
    root.innerHTML = AgendamentoTemplate.render({ errorMessage: 'Erro ao carregar dados do professor.' });
  }
}

function setupAgendamentoHandler(professorId: string) {
  const form = document.getElementById('form-agendamento') as HTMLFormElement;
  if (form) {
    form.onsubmit = (event) => handleAgendamentoSubmit(event, professorId);
  }
  (window as any).handleAgendamentoSubmit = (event: Event) => handleAgendamentoSubmit(event, professorId);
}

async function handleAgendamentoSubmit(event: Event, professorId: string) {
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  const formData: AgendamentoFormData = {
    nome: (form.nome as HTMLInputElement).value,
    telefone: (form.telefone as HTMLInputElement).value,
    dataHora: (form.dataHora as HTMLInputElement).value
  };

  const validation = AgendamentoService.validate(formData);
  if (!validation.isValid) {
    validation.errors.forEach(e => mostrarToast(e, 'danger'));
    return;
  }

  const result = await AgendamentoService.agendar(professorId, formData);
  if (result.success) {
    form.reset();
    mostrarToast('Agendamento realizado com sucesso!', 'success');
  } else {
    mostrarToast(result.error || 'Erro ao agendar', 'danger');
  }
} 