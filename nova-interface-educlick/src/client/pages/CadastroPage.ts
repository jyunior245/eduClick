import { CadastroTemplate } from '../templates/CadastroTemplate';
import { CadastroService } from '../services/CadastroService';
import { CadastroFormData } from '../types';
import { mostrarToast } from '../components/Toast';
import { auth, provider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';

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

  const btnGoogle = document.getElementById('btnGoogleCadastro');
  if (btnGoogle) {
    btnGoogle.addEventListener('click', async (e) => {
      e.preventDefault();
      await handleCadastroComGoogle();
    });
  }
}

async function handleCadastroComGoogle() {
  try {
    const cred = await signInWithPopup(auth, provider);
    const user = cred.user;
    if (!user) throw new Error('Falha ao autenticar com Google.');

    const uid = user.uid;
    const email = user.email || '';
    const nome = user.displayName || '';

    // Sincroniza/cria usuário no backend
    try {
      await fetch('http://localhost:3000/api/auth/sincronizar-usuario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, email, nome })
      });
    } catch (e) {
      console.warn('Sync backend falhou (continuando):', e);
    }

    // Cria sessão no backend
    const sess = await fetch('http://localhost:3000/api/auth/firebase-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ uid })
    });
    if (!sess.ok) {
      let msg = 'Falha ao criar sessão no backend.';
      try { const j = await sess.json(); msg = j.error || msg; } catch {}
      throw new Error(msg);
    }

    mostrarToast('Cadastro com Google realizado!', 'success');
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 900);
  } catch (err: any) {
    console.error('[CadastroGoogle] erro:', err);
    mostrarToast(err?.message || 'Erro no cadastro com Google', 'danger');
  }
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