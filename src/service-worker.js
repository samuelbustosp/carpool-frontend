import { clientsClaim } from 'workbox-core';
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';

// 1. Configuración de PWA (Workbox)
self.skipWaiting();
clientsClaim();

// Esta línea es CRÍTICA: aquí next-pwa inyecta los assets generados
precacheAndRoute(self.__WB_MANIFEST);

// Ejemplo de cacheo de runtime (opcional, ajusta según necesidad de Carpool)
registerRoute(
  ({ url }) => url.origin === self.location.origin && url.pathname.startsWith('/static/'),
  new StaleWhileRevalidate()
);

// 2. Configuración de Firebase Cloud Messaging
// Importamos los scripts directamente desde el CDN dentro del worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyCjk0C-SPasb8ffO4BxCvDrf8huw1g1U-U",
  authDomain: "carpool-app-2025.firebaseapp.com",
  projectId: "carpool-app-2025",
  storageBucket: "carpool-app-2025.firebasestorage.app",
  messagingSenderId: "1065960729977",
  appId: "1:1065960729977:web:eaf3eace7f098206b953a8",
  measurementId: "G-RT4MT19BY7"
};

try {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    // Si Firebase ya la mostró, no hacemos nada
    if (payload.notification) return;

    const title = payload.data?.title;
    if (!title) return;

    return self.registration.showNotification(title, {
      body: payload.data?.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: payload.data,
    });
  });

} catch (error) {
  console.error('[SW] Error inicializando Firebase:', error);
}

// 3. Manejo de clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Lógica para abrir la app o enfocar la ventana existente
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Intentar enfocar una ventana existente
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Si no hay ventana abierta, abrir una nueva en el home
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Listener para mensajes internos (opcional, para comunicación Client-SW)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

