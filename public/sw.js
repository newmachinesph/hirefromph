// DevUp service worker. Runtime cache only — no precache manifest to drift out
// of sync with Next's hashed chunks. Static assets are immutable (cache-first);
// pages go network-first so content stays fresh, with a cached fallback offline.
const CACHE = "devup-v1";

self.addEventListener("install", (e) => {
  // Warm the shell so the very first offline hit still renders something.
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(["/"]).catch(() => {})),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    /\.(?:css|js|woff2?|png|jpg|jpeg|svg|webp|avif|ico)$/.test(url.pathname)
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // never touch analytics/CDN

  if (isStaticAsset(url)) {
    // Cache-first: hashed assets never change under the same URL.
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(request, copy));
            return res;
          }),
      ),
    );
    return;
  }

  // Pages / everything else: network-first, fall back to cache, then to "/".
  event.respondWith(
    fetch(request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(request, copy));
        return res;
      })
      .catch(() =>
        caches
          .match(request)
          .then((hit) => hit || caches.match("/")),
      ),
  );
});
