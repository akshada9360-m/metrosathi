const CACHE_NAME = 'metro-saathi-static-v3'
const APP_SHELL = ['/', '/index.html', '/favicon.svg', '/metro-illustration.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(async () => {
        const cache = await caches.open(CACHE_NAME)
        const response = await cache.match('/index.html')
        if (!response) throw new Error('The offline app shell could not be cached.')

        const html = await response.text()
        const assets = [...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g)]
          .map((match) => match[1])
          .filter((url) => url.startsWith('/'))
        await cache.addAll(assets)
      })
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names
        .filter((name) => name.startsWith('metro-saathi-') && name !== CACHE_NAME)
        .map((name) => caches.delete(name))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
        }
        return response
      }).catch(() => {
        if (request.mode === 'navigate') return caches.match('/index.html')
        throw new Error('Offline resource is not cached.')
      })
    }),
  )
})
