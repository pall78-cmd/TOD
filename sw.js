self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", () => {
  self.clients.claim();
});

self.addEventListener("message", event => {
  if (event.data?.type === "SHOW_NOTIFICATION") {
    const { title, body } = event.data.payload;

    self.registration.showNotification(title, {
      body: body,
      icon: "/TOD/favicon.png", // opsional
      badge: "/TOD/favicon.png"
    });
  }
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then(clients => {
      if (clients.length) {
        clients[0].focus();
      } else {
        self.clients.openWindow("/TOD/");
      }
    })
  );
});
