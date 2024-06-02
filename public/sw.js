importScripts('/javascripts/chat-idb-utility.js');

// Register the service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/sw.js')
            .then(registration => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    });
}

// Use the install event to pre-cache all initial resources.
console.log('Service Worker Called...');
self.addEventListener('install', event => {
    console.log('Service Worker: Installed...');
    event.waitUntil((async () => {

        console.log('Service Worker: Caching App Shell at the moment......');
        try {
            const cache = await caches.open("static");
            cache.addAll([
                '/',
                '/insert',
                '/manifest.json',
                '/javascripts/chat.js',
                '/javascripts/chat-idb-utility.js',
                '/stylesheets/style.css',
                '/images/image_icon.png',
            ]);
            console.log('Service Worker: App Shell Cached');
        } catch (error) {
            console.error('Service Worker: Caching App Shell failed:', error);
        }

    })());
});

//clear cache on reload
self.addEventListener('activate', event => {
    console.log('Service Worker activated');
// Remove old caches
    event.waitUntil(
        (async () => {
            const keys = await caches.keys();
            return keys.map(async (cache) => {
                if(cache !== "static") {
                    console.log('Service Worker: Removing old cache: '+cache);
                    return await caches.delete(cache);
                }
            })
        })()
    )
})

// Fetch event to fetch from cache first
self.addEventListener('fetch', event => {
    event.respondWith((async () => {
        const cache = await caches.open("static");
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
            console.log('Service Worker: Fetching from Cache: ', event.request.url);
            return cachedResponse;
        }
        console.log('Service Worker: Fetching from URL: ', event.request.url);
        return fetch(event.request);
    })());
});

//Sync event to sync the todos
self.addEventListener('sync', event => {
    console.log('Syncing:', event.request.url);
    if (event.tag === 'sync-chat') {
        console.log('Service Worker: Syncing new Chats');
        openSyncChatsIDB().then((syncPostDB) => {
            getAllSyncChats(syncPostDB).then((syncChats) => {
                for (const syncChat of syncChats) {
                    console.log('Service Worker: Syncing new Todo: ', syncChat);
                    console.log(syncChat.text)
                    // Create a FormData object
                    const formData = new URLSearchParams();

                    // Iterate over the properties of the JSON object and append them to FormData
                    formData.append("text", syncChat.text);

                    // Fetch with FormData instead of JSON
                    fetch('http://localhost:3000/chat', {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                    }).then(() => {
                        console.log('Service Worker: Syncing new Chat: ', syncChat, ' done');
                        deleteSyncChatFromIDB(syncPostDB,syncChat.id);
                        // Send a notification
                        self.registration.showNotification('Chat Synced', {
                            body: 'Chat synced successfully!',
                        });
                    }).catch((err) => {
                        console.error('Service Worker: Syncing new Chat: ', syncChat, ' failed');
                    });
                }
            });
        });
    }
});
