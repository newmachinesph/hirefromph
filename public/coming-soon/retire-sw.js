// Replace the old learning worker on hirefrom.ph at its ORIGINAL /sw.js URL.
// Leave other applications' caches alone when this domain becomes the jobs app.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key.startsWith("hfph-")).map((key) => caches.delete(key)),
      ))
      .then(() => self.clients.claim())
      .then(() => self.registration.unregister()),
  );
});
