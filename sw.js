self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// Listener untuk pesan dari index.html
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
        const payload = event.data.payload;
        
        // Memunculkan Notifikasi Sistem
        self.registration.showNotification(payload.title, {
            body: payload.body,
            icon: 'https://cdn-icons-png.flaticon.com/512/3062/3062634.png', // Icon Oracle
            tag: 'oracle-universe-chat', // Tag agar notifikasi menumpuk (tidak spam)
            renotify: true, // Getar ulang saat ada update baru
            data: { url: self.location.origin } // Data untuk event klik
        });
    }
});

// Saat notifikasi diklik, buka/fokus ke tab chat
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
            // Jika ada tab terbuka, fokus ke sana
            for (let client of windowClients) {
                if (client.url.includes('index.html') || client.url === self.location.origin + '/') {
                    return client.focus();
                }
            }
            // Jika tidak ada, buka baru (opsional)
            if (clients.openWindow) return clients.openWindow('/');
        })
    );
});
