const APP_NAME = "Cacana";
const APP_VERSION = "v1"; // update this after any changes to the app shell
const CACHE_NAME = APP_NAME + "-" + APP_VERSION;
const APP_SHELL = [
  "",
  "index.php",
  "app.js",
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/favicon.ico",
  "icons/apple-touch-icon.png",
].map((path) => "/" + APP_NAME.toLowerCase() + "/" + path);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // only handle same-origin GET requests
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // use network-first strategy
  event.respondWith(networkFirst(event.request));
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    // try network first
    const fresh = await fetch(request);

    // only cache successful responses.
    if (fresh && fresh.ok) {
      cache.put(request, fresh.clone());
    }

    return fresh;
  } catch (err) {
    // network failed (e.g. offline), try cache
    const cached = await cache.match(request);
    if (cached) return cached;

    // if not in cache, fallback to a user-friendly error response
    return new Response(
`${APP_NAME} is offline and the requested resource is not cached.
Please try again when you are back online.`
    , {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
