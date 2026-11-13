const CACHE = "mensajes-v7";
const ASSETS = [
  "./", "./index.html", "./assets/css/styles.css", "./assets/js/app.js", "./assets/js/core.mjs", "./manifest.webmanifest",
  "./assets/images/cash-bustamante-logo.png",
  "./assets/fonts/montserrat-latin.woff2", "./assets/fonts/montserrat-italic-latin.woff2", "./assets/fonts/archivo-latin.woff2",
  "./assets/icons/icon.svg", "./assets/icons/icon-192.png", "./assets/icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key.startsWith("mensajes-") && key !== CACHE)
        .map((key) => caches.delete(key))
    ))
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  if (event.request.mode === "navigate") {
    event.respondWith(caches.match("./index.html").then((cached) => cached || fetch(event.request)));
    return;
  }
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});
