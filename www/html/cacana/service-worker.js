const APP_NAME = "Cacana";
const APP_VERSION = "v3"; // bump when you change the app shell
const BASE = "/" + APP_NAME.toLowerCase() + "/";

// load local Workbox runtime
importScripts(BASE + "lib/workbox/workbox-sw.js");

// tell Workbox where the rest of its modules live
workbox.setConfig({
  modulePathPrefix: BASE + "lib/workbox/",
});

// turn off Workbox debug logs
workbox.setConfig({ debug: false });

workbox.core.skipWaiting();
workbox.core.clientsClaim();

const APP_SHELL = [
  "",
  "index.php",
  "app.js",
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/favicon.ico",
  "icons/apple-touch-icon.png",
  "db.js",
  "lib/dexie.mjs",
  "lib/pulltorefresh.esm.js",
  "lib/workbox/workbox-core.prod.js",
  "lib/workbox/workbox-precaching.prod.js",
  "lib/workbox/workbox-routing.prod.js",
  "lib/workbox/workbox-strategies.prod.js",
  "lib/workbox/workbox-cacheable-response.prod.js",
  "lib/workbox/workbox-expiration.prod.js",
].map((path) => ({
  url: BASE + path,
  revision: APP_VERSION,
}));

// precache app shell: everything that must exist for the app to load and work offline
workbox.precaching.precacheAndRoute(APP_SHELL);

// runtime caching: network-first for same-origin GET, but only if in the APP_SHELL
workbox.routing.registerRoute(
  ({ url, request }) =>
    request.method === "GET" && url.origin === self.location.origin,
  new workbox.strategies.NetworkFirst({
    cacheName: `${APP_NAME}-${APP_VERSION}-runtime`,
    plugins: [
      // cache only good responses
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [200],
      }),
      // avoid unbounded cache growth
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
      }),
    ],
  })
);

// friendly offline fallback if neither network nor cache works
workbox.routing.setCatchHandler(async ({ event }) => {
  return new Response(
    `${APP_NAME} is offline and the requested resource is not cached. ` +
      `Please try again when you are back online.`,
    {
      status: 503, // Service Unavailable
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    }
  );
});
