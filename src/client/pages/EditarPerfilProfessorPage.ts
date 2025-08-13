import { EditarPerfilTemplate } from '../templates/EditarPerfilTemplate';
import { EditarPerfilService, PerfilFormData } from '../services/EditarPerfilService';
import { mostrarToast } from '../components/Toast';
import { uploadFotoPerfilAPI } from '../services/api';

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

  const fileInput = document.getElementById('foto') as HTMLInputElement | null;
  if (fileInput) {
    fileInput.onchange = handleFotoChange;
  }
}

async function handleEditarPerfilSubmit(event: Event) {
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  
  const getValue = (name: string) => {
    const el = form.querySelector(`[name="${name}"]`) as HTMLInputElement | null;
    return el ? el.value : undefined;
  };

  const formData: PerfilFormData = {
    nome: getValue('nome') ?? '',
    email: getValue('email') ?? '',
    telefone: getValue('telefone'),
    especialidade: getValue('especialidade'),
    formacao: getValue('formacao'),
    experiencia: getValue('experiencia'),
    linkUnico: getValue('linkUnico'),
    fotoUrl: (document.getElementById('foto-preview') as HTMLImageElement | null)?.src
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

async function handleFotoChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files && input.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    mostrarToast('Arquivo maior que 5MB.', 'warning');
    input.value = '';
    return;
  }
  try {
    mostrarToast('Enviando foto...', 'info');
    const res = await uploadFotoPerfilAPI(file);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Erro ao enviar foto' }));
      throw new Error(err.error || 'Erro ao enviar foto');
    }
    const data = await res.json();
    const url = data.fotoUrl as string;
    const preview = document.getElementById('foto-preview') as HTMLImageElement | null;
    if (preview) preview.src = url;
    mostrarToast('Foto atualizada!', 'success');
  } catch (error: any) {
    console.error('[UPLOAD FOTO] erro', error);
    mostrarToast(error?.message || 'Falha ao enviar foto', 'danger');
  }
}
