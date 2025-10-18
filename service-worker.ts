// service-worker.ts

const CACHE_NAME = 'saferoot-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx',
  // Since the actual bundle name is unknown, I'll cache the source. In a real build, I'd cache the bundled JS file.
  // Add other static assets like icons
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/apple-touch-icon.png',
  'https://cdn.tailwindcss.com' // Cache tailwind CSS
];

// Install a service worker
self.addEventListener('install', (event: any) => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // Use a no-cache request to ensure we get the latest version from the network upon installation.
        const cachePromises = urlsToCache.map(urlToCache => {
            return cache.add(new Request(urlToCache, {cache: 'no-cache'}));
        });
        return Promise.all(cachePromises);
      })
  );
});

// Cache and return requests
self.addEventListener('fetch', (event: any) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Not in cache, fetch it from the network
        return fetch(event.request).then(
          (response) => {
            // Check if we received a valid response to cache
            if (!response || response.status !== 200) {
              return response;
            }
            // Opaque responses (from cross-origin requests like CDNs) should not be cached unless necessary,
            // as we can't verify their content. TailwindCSS is an exception here.
            if (response.type === 'opaque' && !event.request.url.startsWith('https://cdn.tailwindcss.com')) {
                return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// Update a service worker
self.addEventListener('activate', (event: any) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});