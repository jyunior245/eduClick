import { EditarPerfilTemplate } from '../templates/EditarPerfilTemplate';
import { EditarPerfilService, PerfilFormData } from '../services/EditarPerfilService';
import { mostrarToast } from '../components/Toast';

export async function renderEditarPerfilProfessorPage(root: HTMLElement): Promise<void> {
  try {
    const usuario = await EditarPerfilService.carregarPerfil();
    root.innerHTML = EditarPerfilTemplate.render({ usuario });
    setupEditarPerfilHandler();
  } catch (error) {
    root.innerHTML = EditarPerfilTemplate.render({ 
      errorMessage: 'Erro ao carregar dados do perfil.' 
    });
  }
}

function setupEditarPerfilHandler() {
  const form = document.getElementById('form-editar-perfil') as HTMLFormElement;
  if (form) {
    form.onsubmit = handleEditarPerfilSubmit;
  }
  (window as any).handleEditarPerfilSubmit = handleEditarPerfilSubmit;
}

async function handleEditarPerfilSubmit(event: Event) {
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  
  const formData: PerfilFormData = {
    nome: (form.nome as HTMLInputElement).value,
    email: (form.email as HTMLInputElement).value,
    telefone: (form.telefone as HTMLInputElement).value || undefined,
    especialidade: (form.especialidade as HTMLInputElement).value || undefined,
    bio: (form.bio as HTMLTextAreaElement).value || undefined,
    linkUnico: (form.linkUnico as HTMLInputElement).value || undefined,
    observacoes: (form.observacoes as HTMLTextAreaElement).value || undefined,
    formacao: (form.formacao as HTMLInputElement).value || undefined,
    experiencia: (form.experiencia as HTMLInputElement).value || undefined
  };

  const validation = EditarPerfilService.validate(formData);
  if (!validation.isValid) {
    validation.errors.forEach(e => mostrarToast(e, 'danger'));
    return;
  }

  const result = await EditarPerfilService.salvarPerfil(formData);
  if (result.success) {
    setTimeout(() => {
      window.history.pushState({}, '', '/dashboard');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }, 1500);
  } else {
    mostrarToast(result.error || 'Erro ao salvar perfil', 'danger');
  }
} 