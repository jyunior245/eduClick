import { LoginTemplate } from '../templates/LoginTemplate';
import { LoginService } from '../services/LoginService';
import { mostrarToast } from '../components/Toast';
import { LoginFormData } from '../types';

export async function renderLoginPage(root: HTMLElement): Promise<void> {
  root.innerHTML = LoginTemplate.render();
  setupLoginHandler();
}

function setupLoginHandler() {
  const form = document.getElementById('form-login') as HTMLFormElement;
  if (form) {
    form.onsubmit = handleLoginSubmit;
  }
  (window as any).handleLoginSubmit = handleLoginSubmit;
}

async function handleLoginSubmit(event: Event) {
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  const formData: LoginFormData = {
    email: (form.email as HTMLInputElement).value,
    senha: (form.senha as HTMLInputElement).value
  };

  const validation = LoginService.validate(formData);
  if (!validation.isValid) {
    validation.errors.forEach(e => mostrarToast(e, 'danger'));
    return;
  }

  const result = await LoginService.login(formData);
  if (result.success) {
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 1200);
  } else {
    mostrarToast(result.error || 'Erro no login', 'danger');
  }
} 