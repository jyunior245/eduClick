// Basic Service Worker to show notifications for FCM push
self.addEventListener('push', function (event) {
  try {
    const data = event.data ? event.data.json() : {};
    const title = (data.notification && data.notification.title) || 'EduClick';
    const body = (data.notification && data.notification.body) || '';
    const options = {
      body,
      data: data.data || {},
      icon: '/icons/icon-192.png'
    };
    // Mostrar notificação e também avisar clientes para atualizarem UI
    event.waitUntil((async () => {
      try { await self.registration.showNotification(title, options); } catch {}
      try {
        const allClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });
        for (const client of allClients) {
          try { client.postMessage({ type: 'AULAS_UPDATED', payload: data.data || {} }); } catch {}
        }
      } catch {}
    })());
  } catch (e) {
    // fallback
    event.waitUntil(self.registration.showNotification('EduClick', { body: 'Nova notificação' }));
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const url = '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (let client of windowClients) {
        if (client.url.includes(url) && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
