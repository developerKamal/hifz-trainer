const CACHE = 'hifz-v1'
const PRECACHE = ['/', '/manifest.json', '/icon.svg']

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE).catch(() => {}))
  )
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return
  if (e.request.url.includes('/_next/webpack-hmr')) return

  e.respondWith(
    caches.open(CACHE).then(async cache => {
      const cached = await cache.match(e.request)
      const fetchPromise = fetch(e.request)
        .then(resp => {
          if (resp.ok) cache.put(e.request, resp.clone())
          return resp
        })
        .catch(() => cached)

      // Network first for navigation; cache first for assets
      if (e.request.mode === 'navigate') return fetchPromise.catch(() => cached)
      return cached || fetchPromise
    })
  )
})
