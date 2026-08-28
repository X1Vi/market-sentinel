// Market Sentinel Service Worker
// Caches all static assets on first load for instant repeat visits.
// Cache name includes timestamp — bumps on each deploy to refresh cache.

const CACHE = "market-sentinel-v1";
const ASSETS = [
  "/market-sentinel/",
  "/market-sentinel/index.html",
];

// Install: pre-cache the app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll(ASSETS).catch(() => {
        // Partial failure is OK — runtime cache will fill gaps
      });
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: serve from cache first, fall back to network
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Only cache same-origin GET requests
  if (event.request.method !== "GET" || url.origin !== self.location.origin) return;

  // Don't cache API calls (they have their own cache layer)
  if (url.pathname.includes("/api/")) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      // Return cached immediately, then update in background
      const fetchPromise = fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
