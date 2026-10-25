// Asteroid Dash — Service Worker
// No caching: every load always goes to the network for the latest files,
// so changes you make show up immediately the next time the app runs.

const CACHE = 'asteroid-dash-v2';

// Install: activate immediately, no pre-caching.
self.addEventListener('install', event => {
    self.skipWaiting();
});

// Activate: wipe out any old caches left over from previous versions
// of this service worker (including the old asset cache), then take
// control of open pages right away.
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.map(k => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

// Fetch: always go to the network, never read or write the cache.
// This is what makes "always load the latest version" work — the
// service worker just gets out of the way.
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request, { cache: 'no-store' })
    );
});
