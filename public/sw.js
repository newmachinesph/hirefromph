// Hire From PH service worker. Runtime cache only — no precache manifest to drift out
// of sync with Next's hashed chunks.
//
// THREE strategies, because "is it a static file?" is the wrong question:
//
//   immutable  /_next/static/**            content-hashed by Next → cache-first, forever
//   revalidate /images/**, /kit/**, /icon…  stable URL, changeable bytes → stale-while-revalidate
//   document   everything else              → network-first, cache fallback, then "/"
//
// BUMP `CACHE` whenever a non-hashed asset under public/ changes shape — a redesign,
// a new photo set, a regenerated kit PDF. The activate handler deletes every other
// hfph-* cache, so a bump is a full purge for returning visitors.
const CACHE = "hfph-v2";

self.addEventListener("install", (e) => {
  // Warm the shell so the very first offline hit still renders something.
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(["/"]).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Hashed by the build. The URL changes when the bytes change, so it is safe forever.
function isImmutable(url) {
  return url.pathname.startsWith("/_next/static/");
}

// Stable URLs whose bytes we do replace: first-party imagery, the educator kit PDFs,
// the favicon and the manifest. Served from cache for speed, refreshed in the
// background, so a redesign lands on the second visit rather than never.
function isRevalidatable(url) {
  return (
    url.pathname.startsWith("/images/") ||
    url.pathname.startsWith("/kit/") ||
    url.pathname === "/icon.svg" ||
    url.pathname === "/manifest.webmanifest" ||
    /\.(?:png|jpe?g|webp|avif|svg|ico|woff2?)$/.test(url.pathname)
  );
}

function putInCache(request, response) {
  if (!response || !response.ok || response.type === "opaque") return response;
  const copy = response.clone();
  caches.open(CACHE).then((c) => c.put(request, copy));
  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  if (request.headers.has("range")) return; // let the network handle partial content
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // never touch analytics/CDN
  if (url.pathname === "/sw.js") return; // never cache the worker itself
  if (url.pathname.startsWith("/dev/")) return; // the dev gallery is not a shipped route

  if (isImmutable(url)) {
    event.respondWith(
      caches.match(request).then((hit) => hit || fetch(request).then((res) => putInCache(request, res))),
    );
    return;
  }

  if (isRevalidatable(url)) {
    // Stale-while-revalidate: answer from cache immediately, refresh in the background.
    event.respondWith(
      caches.match(request).then((hit) => {
        const network = fetch(request)
          .then((res) => putInCache(request, res))
          .catch(() => hit);
        return hit || network;
      }),
    );
    return;
  }

  // Documents and everything else: network-first, fall back to cache, then to "/".
  event.respondWith(
    fetch(request)
      .then((res) => putInCache(request, res))
      .catch(() => caches.match(request).then((hit) => hit || caches.match("/"))),
  );
});
