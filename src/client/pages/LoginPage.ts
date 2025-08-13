import { LoginTemplate } from '../templates/LoginTemplate';
import { LoginFormData } from '../types';
import { LoginService } from '../services/LoginService';
import { mostrarToast } from '../components/Toast';
import { Validators } from '../utils/validators';
import { auth, provider } from '../firebase';
import { signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';

export async function renderLoginPage(root: HTMLElement): Promise<void> {
  root.innerHTML = LoginTemplate.render();
  const form = document.getElementById('form-login') as HTMLFormElement;
  if (form) {
    form.onsubmit = handleLoginSubmit;
  }

  const btnGoogle = document.getElementById('btnGoogleLogin');
  if (btnGoogle) {
    btnGoogle.addEventListener('click', (e) => {
      e.preventDefault();
      handleGoogleLogin();
    });
  }

  const linkForgot = document.getElementById('linkForgotPassword');
  if (linkForgot) {
    linkForgot.addEventListener('click', (e) => {
      e.preventDefault();
      handleForgotPassword();
    });
  }
}

async function handleLoginSubmit(event: Event) {
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  const formData: LoginFormData = {
    email: (form.email as HTMLInputElement).value,
    senha: (form.senha as HTMLInputElement).value
  };

  const validation = Validators.validateLogin(formData);
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

async function handleGoogleLogin() {
  try {
    const cred = await signInWithPopup(auth, provider);
    const user = cred.user;
    if (!user) throw new Error('Falha ao autenticar com Google.');

    const uid = user.uid;
    const email = user.email || '';
    const nome = user.displayName || '';

    // Sincroniza usuário no backend (não bloqueante)
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

    mostrarToast('Login com Google realizado!', 'success');
    setTimeout(() => { window.location.href = '/dashboard'; }, 900);
  } catch (err: any) {
    console.error('[GoogleLogin] erro:', err);
    mostrarToast(err?.message || 'Erro no login com Google', 'danger');
  }
}

async function handleForgotPassword() {
  try {
    const emailInput = document.getElementById('email') as HTMLInputElement | null;
    const email = emailInput?.value?.trim();
    if (!email) {
      mostrarToast('Informe seu e-mail para recuperar a senha.', 'warning');
      return;
    }
    await sendPasswordResetEmail(auth, email);
    mostrarToast('E-mail de redefinição enviado! Verifique sua caixa de entrada.', 'success');
  } catch (err: any) {
    console.error('[ForgotPassword] erro:', err);
    const msg = err?.message || 'Erro ao enviar e-mail de redefinição.';
    mostrarToast(msg, 'danger');
  }
}
