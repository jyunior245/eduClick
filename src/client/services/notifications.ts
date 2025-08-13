// src/client/services/notifications.ts
import { messaging, getFcmToken, onMessage } from '../firebase';
import { auth } from '../firebase';
import { mostrarToast } from '../components/Toast';

// Parcel: importar URL do service worker com '?url' garante caminho correto (hash) no dev/build
// @ts-ignore
import swUrl from '../firebase-messaging-sw.js?url';

// Resolve VAPID key de várias fontes (env, window, meta, localStorage)
function resolveVapidKey(): string | undefined {
  try {
    const fromEnv = process.env.FIREBASE_VAPID_KEY as string | undefined;
    if (fromEnv && fromEnv.trim()) return fromEnv.trim();
  } catch {}
  try {
    const w: any = window as any;
    const win = w || {};
    if (win.__VAPID_KEY && typeof win.__VAPID_KEY === 'string' && win.__VAPID_KEY.trim()) return win.__VAPID_KEY.trim();
  } catch {}
  try {
    const meta = document.querySelector('meta[name="vapid-key"]') as HTMLMetaElement | null;
    if (meta && meta.content && meta.content.trim()) return meta.content.trim();
  } catch {}
  try {
    const ls = localStorage.getItem('FIREBASE_VAPID_KEY');
    if (ls && ls.trim()) return ls.trim();
  } catch {}
  // Prompt opcional em dev: permite colar a VAPID e salvar em localStorage
  try {
    const promptedKeyOnce = sessionStorage.getItem('__vapid_prompted');
    if (!promptedKeyOnce) {
      sessionStorage.setItem('__vapid_prompted', '1');
      const provided = window.prompt('Informe a FIREBASE VAPID PUBLIC KEY para habilitar notificações (será salva localmente):');
      if (provided && provided.trim()) {
        try { localStorage.setItem('FIREBASE_VAPID_KEY', provided.trim()); } catch {}
        return provided.trim();
      }
    }
  } catch {}
  return undefined;
}

// Registra o Service Worker para FCM e retorna a Registration
async function ensureServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  try {
    // Se já existe um SW ativo, reutiliza
    const existing = await navigator.serviceWorker.getRegistration('/');
    if (existing) {
      console.log('[FCM] Usando Service Worker já registrado', existing);
      return existing;
    }
  } catch {}
  const candidates = [
    // 1) URL construída pelo Parcel (inclui no bundle)
    // @ts-ignore
    new URL('../firebase-messaging-sw.js', import.meta.url).toString(),
    // 2) URL via ?url
    swUrl as unknown as string,
    // 3) Caminhos estáticos
    './firebase-messaging-sw.js',
    '/firebase-messaging-sw.js',
    '/dist/firebase-messaging-sw.js',
    '/dist/firebase-messaging-sw.min.js',
  ];
  console.log('[FCM] SW candidates:', candidates);
  for (const path of candidates) {
    try {
      console.log('[FCM] Tentando registrar Service Worker em', path);
      const reg = await navigator.serviceWorker.register(path as any, { scope: '/' });
      console.log('[FCM] Service Worker registrado em', path);
      return reg;
    } catch (_) {
      try {
        // Se falhou, checa se o recurso está realmente servindo JS para depurar
        const res = await fetch(path, { method: 'GET' });
        const ct = (res.headers.get('content-type') || '').toLowerCase();
        console.warn('[FCM] Falha ao registrar SW em', path, 'status', res.status, 'content-type', ct);
      } catch (e) {
        console.warn('[FCM] Falha ao buscar SW em', path, e);
      }
      // tenta próximo caminho
    }
  }
  // sem fallback import.meta: confiamos nos caminhos absolutos acima para evitar warnings do Parcel e erros TS
  return null;
}

// Configura onMessage para páginas públicas (aluno) sem exigir login
export function setupPublicOnMessage(): void {
  try {
    if (!messaging) return;
    // Evitar múltiplos handlers
    const anyWin = window as any;
    if (anyWin.__publicOnMessageSet) return;
    anyWin.__publicOnMessageSet = true;
    onMessage(messaging, (payload) => {
      try {
        const tipo = (payload as any)?.data?.type || (payload as any)?.data?.tipo;
        const title = payload.notification?.title || 'Notificação';
        const body = payload.notification?.body || '';
        if (title || body) {
          mostrarToast(`${title}: ${body}`);
        }
        if (tipo === 'AULA_REAGENDADA' || tipo === 'AULAS_UPDATED') {
          window.dispatchEvent(new CustomEvent('aulas-updated', { detail: (payload as any).data }));
        }
      } catch {}
    });
  } catch {}
}

// Obtém o FCM token no fluxo público (sem registrar no backend)
export async function getPublicFcmToken(): Promise<string | null> {
  try {
    if (!messaging) return null;
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') return null;
    let swReg = await ensureServiceWorker();
    try {
      if (!swReg && 'serviceWorker' in navigator) {
        swReg = await navigator.serviceWorker.ready;
      }
    } catch {}
    const vapidKey = resolveVapidKey();
    try {
      const token = await getFcmToken(messaging, {
        vapidKey,
        // se não houver SW, NÃO deixe undefined para evitar registerDefaultSw. Só passa se existir
        serviceWorkerRegistration: swReg || undefined,
      } as any);
      return token || null;
    } catch {
      // silencioso no público
      return null;
    }
  } catch {
    // silencioso no público
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
      return;
    }

    // Registrar SW
    const swReg = await ensureServiceWorker();
    if (!swReg) {
      console.warn('[FCM] Service Worker não registrado');
    }

    // Obter token com VAPID key
    const vapidKey = resolveVapidKey();
    if (!vapidKey) {
      console.warn('[FCM] FIREBASE_VAPID_KEY ausente no .env');
    }
    let token: string | null = null;
    try {
      if (swReg) {
        token = await getFcmToken(messaging, {
          vapidKey,
          serviceWorkerRegistration: swReg,
        } as any);
      } else {
        const registration = await navigator.serviceWorker.ready;
        token = await getFcmToken(messaging, {
          vapidKey,
          serviceWorkerRegistration: registration,
        } as any);
      }
      console.log('[FCM] Token obtido?', !!token);
      if (token) console.log('[FCM] Token:', token);
    } catch (e) {
      console.warn('[FCM] Erro ao obter token:', e);
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

    // Enviar token para backend (só com ID token válido). Evita chamadas sem Authorization.
    const anyWin = window as any;
    if (!anyWin.__fcmRegisterInProgress) anyWin.__fcmRegisterInProgress = false;
    const doRegister = async (jwt: string) => {
      if (anyWin.__fcmRegisterInProgress) return;
      anyWin.__fcmRegisterInProgress = true;
      try {
        console.log('[FCM] Enviando token ao backend...');
        const resp = await fetch('http://localhost:3000/api/notifications/register-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
          credentials: 'include',
          body: JSON.stringify({ token })
        });
        if (!resp.ok) {
          const txt = await resp.text().catch(() => '');
          console.warn('Falha ao registrar FCM token no backend:', txt);
        } else {
          console.log('FCM token registrado no backend');
        }
      } finally {
        anyWin.__fcmRegisterInProgress = false;
      }
    };

    // Tenta obter ID token atual; se não houver, aguarda mudança de autenticação
    let jwt = idToken;
    if (!jwt) {
      try {
        const user = auth?.currentUser;
        if (user) jwt = await user.getIdToken();
      } catch (e) {
        console.warn('[FCM] Falha ao obter ID token automaticamente:', e);
      }
    }

    if (jwt) {
      await doRegister(jwt);
    } else {
      // Sem Firebase ID token: tenta fallback via sessão (mantém compatibilidade com login por sessão)
      console.warn('[FCM] Usuário não autenticado. Tentando registrar token via sessão…');
      try {
        const respSess = await fetch('http://localhost:3000/api/notifications/register-token-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ token })
        });
        if (!respSess.ok) {
          const txt = await respSess.text().catch(() => '');
          console.warn('[FCM] Fallback via sessão falhou:', txt);
        } else {
          console.log('[FCM] Token registrado via sessão com sucesso');
        }
      } catch (e) {
        console.warn('[FCM] Erro no fallback via sessão:', e);
      }

      // Ainda assim, aguardamos login para registrar com UID quando disponível
      console.warn('[FCM] Aguardando login para registro com UID…');
      try {
        const unsubscribe = (auth as any)?.onIdTokenChanged?.(async (user: any) => {
          if (!user) return; // ainda não logado
          try {
            const newJwt = await user.getIdToken();
            await doRegister(newJwt);
            unsubscribe && unsubscribe();
          } catch (e) {
            console.warn('[FCM] onIdTokenChanged: falha ao registrar FCM token:', e);
          }
        });
      } catch {}
    }

    // Listener para mensagens em primeiro plano
    console.log('[FCM] Registrando listener onMessage');
    onMessage(messaging, (payload) => {
      const title = payload.notification?.title || 'Notificação';
      const body = payload.notification?.body || '';
      mostrarToast(`${title}: ${body}`, 'success');
      try {
        const tipo = (payload as any)?.data?.type || (payload as any)?.data?.tipo;
        if (tipo === 'AULA_REAGENDADA' || tipo === 'AULAS_UPDATED') {
          // Dispara evento global para que telas se atualizem automaticamente
          window.dispatchEvent(new CustomEvent('aulas-updated', { detail: (payload as any).data }));
        }
      } catch {}
    });
  } catch (e) {
    console.warn('Erro ao configurar push:', e);
  }
}
