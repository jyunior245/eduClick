// src/client/services/notifications.ts
import { messaging, getFcmToken, onMessage } from '../firebase';
import { auth } from '../firebase';
import { mostrarToast } from '../components/Toast';

// Registra o Service Worker para FCM e retorna a Registration
async function ensureServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const swUrl = new URL('../firebase-messaging-sw.js', import.meta.url);
    console.log('[FCM] Registrando Service Worker em', String(swUrl));
    const reg = await navigator.serviceWorker.register(swUrl);
    console.log('[FCM] Service Worker registrado');
    return reg;
  } catch (e) {
    console.warn('Falha ao registrar service worker de messaging:', e);
    return null;
  }
}

// Obtém o FCM token no fluxo público (sem registrar no backend)
export async function getPublicFcmToken(): Promise<string | null> {
  try {
    if (!messaging) return null;
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') return null;
    const swReg = await ensureServiceWorker();
    const vapidKey = process.env.FIREBASE_VAPID_KEY as string | undefined;
    try {
      const token = await getFcmToken(messaging, {
        vapidKey,
        serviceWorkerRegistration: swReg ?? undefined,
      } as any);
      return token || null;
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}

// Debug helper: expose manual trigger in the browser console
try {
  if (typeof window !== 'undefined') {
    (window as any).setupPushAfterLogin = setupPushAfterLogin;
    // Small hint so users know this exists
    // eslint-disable-next-line no-console
    console.log('[FCM][debug] window.setupPushAfterLogin(idToken?) disponível para testes manuais');

    (window as any).sendTestNotification = async () => {
      try {
        let idToken: string | undefined;
        const user = auth?.currentUser;
        if (user) {
          idToken = await user.getIdToken();
        } else {
          console.warn('[FCM][debug] Usuário não autenticado; teste pode falhar (401).');
        }
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (idToken) headers['Authorization'] = `Bearer ${idToken}`;
        const resp = await fetch('http://localhost:3000/api/notifications/test', {
          method: 'POST',
          headers,
          credentials: 'include'
        });
        const txt = await resp.text();
        console.log('[FCM][debug] /api/notifications/test status:', resp.status, txt);
      } catch (e) {
        console.error('[FCM][debug] Erro ao chamar /api/notifications/test:', e);
      }
    };
    console.log('[FCM][debug] window.sendTestNotification() disponível para enviar push de teste');
  }
} catch {}

export async function setupPushAfterLogin(idToken?: string): Promise<void> {
  try {
    console.log('[FCM] setupPushAfterLogin iniciado');
    if (!messaging) {
      console.warn('Messaging indisponível neste ambiente.');
      return;
    }

    // Solicitar permissão
    const perm = await Notification.requestPermission();
    console.log('[FCM] Permissão de notificação:', perm);
    if (perm !== 'granted') {
      console.warn('Permissão de notificação negada.');
      mostrarToast('Permissão de notificação negada.', 'warning');
      return;
    }

    // Registrar SW
    const swReg = await ensureServiceWorker();
    if (!swReg) {
      console.warn('[FCM] Service Worker não registrado');
    }

    // Obter token com VAPID key
    const vapidKey = process.env.FIREBASE_VAPID_KEY as string | undefined;
    if (!vapidKey) {
      console.warn('[FCM] FIREBASE_VAPID_KEY ausente no .env');
    }
    let token: string | null = null;
    try {
      token = await getFcmToken(messaging, {
        vapidKey,
        serviceWorkerRegistration: swReg ?? undefined,
      } as any);
      console.log('[FCM] Token obtido?', !!token);
      if (token) console.log('[FCM] Token:', token);
    } catch (e) {
      console.warn('[FCM] Erro ao obter token:', e);
      mostrarToast('Erro ao obter token de notificação.', 'danger');
      token = null;
    }

    if (!token) {
      console.warn('Não foi possível obter FCM token.');
      // Ainda assim ouvimos mensagens em primeiro plano, caso cheguem via SW
      try {
        onMessage(messaging, (payload) => {
          const title = payload.notification?.title || 'Notificação';
          const body = payload.notification?.body || '';
          mostrarToast(`${title}: ${body}`, 'success');
        });
      } catch {}
      return;
    }

    // Enviar token para backend (garante ID token do usuário logado)
    if (!idToken) {
      try {
        const user = auth?.currentUser;
        if (user) {
          idToken = await user.getIdToken();
          console.log('[FCM] ID token obtido automaticamente para registro');
        } else {
          console.warn('[FCM] Usuário não autenticado, enviando registro sem Authorization');
        }
      } catch (e) {
        console.warn('[FCM] Falha ao obter ID token automaticamente:', e);
      }
    }
    const authHeader: Record<string, string> = idToken ? { Authorization: `Bearer ${idToken}` } : {};
    console.log('[FCM] Enviando token ao backend...');
    const resp = await fetch('http://localhost:3000/api/notifications/register-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      credentials: 'include',
      body: JSON.stringify({ token })
    });
    if (!resp.ok) {
      const txt = await resp.text().catch(() => '');
      console.warn('Falha ao registrar FCM token no backend:', txt);
    } else {
      console.log('FCM token registrado no backend');
    }

    // Listener para mensagens em primeiro plano
    console.log('[FCM] Registrando listener onMessage');
    onMessage(messaging, (payload) => {
      const title = payload.notification?.title || 'Notificação';
      const body = payload.notification?.body || '';
      mostrarToast(`${title}: ${body}`, 'success');
    });
  } catch (e) {
    console.warn('Erro ao configurar push:', e);
  }
}
