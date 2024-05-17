self.addEventListener('install', event => {
    console.log('Service Worker: Installing....');
    event.waitUntil((async () => {
        console.log('Service Worker: Caching App Shell at the moment......');
        try {
            const cache = await caches.open("static");
            await cache.addAll([
                '/',
                '/insert',
                '/manifest.json',
                '/javascripts/chat.js',
                '/javascripts/chat-idb-utility.js',
                '/stylesheets/style.css',
                '/images/image_icon.png',
            ]);
            console.log('Service Worker: App Shell Cached');
        } catch(error) {
            console.error('Service Worker: Caching failed:', error);
        }
    })());
});

// Fetch event to fetch from cache first
self.addEventListener('fetch', event => {
    event.respondWith((async () => {
        const cache = await caches.open("static");
        try {
            const cachedResponse = await cache.match(event.request);
            if (cachedResponse) {
                console.log('Service Worker: Fetching from Cache: ', event.request.url);
                return cachedResponse;
            }
            console.log('Service Worker: Fetching from URL: ', event.request.url);
            return fetch(event.request);
        } catch(error) {
            console.error('Service Worker: Fetching failed:', error);
            throw error;
        }
    })());
});

// Sync event to sync the todos
self.addEventListener('sync', event => {
    if (event.tag === 'sync-chat') {
        console.log('Service Worker: Syncing new Chats');
        event.waitUntil((async () => {
            try {
                const syncPostDB = await openSyncChatsIDB();
                const syncChats = await getAllSyncChats(syncPostDB);
                for (const syncChat of syncChats) {
                    console.log('Service Worker: Syncing new Todo: ', syncChat);
                    console.log(syncChat.text);
                    const formData = new URLSearchParams();
                    formData.append("text", syncChat.text);
                    await fetch('http://localhost:3000/chat', {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                    });
                    console.log('Service Worker: Syncing new Chat: ', syncChat, ' done');
                    await deleteSyncChatFromIDB(syncPostDB, syncChat.id);
                    await self.registration.showNotification('Chat Synced', {
                        body: 'Chat synced successfully!',
                    });
                }
            } catch(error) {
                console.error('Service Worker: Syncing failed:', error);
            }
        })());
    }
});
