const OFFLINE_CACHE = 'modumanjok-offline-v1'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(OFFLINE_CACHE)
      .then((cache) => cache.addAll(['/offline.html', '/assets/modumanjok-icon-192.png']))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith('modumanjok-offline-') && key !== OFFLINE_CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.mode !== 'navigate') return
  event.respondWith(fetch(event.request).catch(() => caches.match('/offline.html')))
})
