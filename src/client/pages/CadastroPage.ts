import { CadastroTemplate } from '../templates/CadastroTemplate';
import { CadastroService } from '../services/CadastroService';
import { CadastroFormData } from '../types';
import { mostrarToast } from '../components/Toast';

export async function renderCadastroPage(root: HTMLElement): Promise<void> {
  root.innerHTML = CadastroTemplate.render();
  setupCadastroHandler();
}

function setupCadastroHandler() {
  const form = document.getElementById('form-cadastro') as HTMLFormElement;
  if (form) {
    form.onsubmit = handleCadastroSubmit;
  }
  (window as any).handleCadastroSubmit = handleCadastroSubmit;
}

async function handleCadastroSubmit(event: Event) {
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  const formData: CadastroFormData = {
    nome: (form.nome as HTMLInputElement).value,
    email: (form.email as HTMLInputElement).value,
    senha: (form.senha as HTMLInputElement).value,
    confirmarSenha: (form.confirmarSenha as HTMLInputElement).value
  };

  const validation = CadastroService.validate(formData);
  if (!validation.isValid) {
    validation.errors.forEach(e => mostrarToast(e, 'danger'));
    return;
  }

  const result = await CadastroService.cadastrar(formData);
  if (result.success) {
    setTimeout(() => {
      window.history.pushState({}, '', '/login');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }, 1200);
  } else {
    mostrarToast(result.error || 'Erro ao cadastrar', 'danger');
  }
} 