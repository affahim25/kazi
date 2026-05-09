// sw.js — Service Worker for নিকাহ রেজিস্ট্রি PWA
// GitHub Pages base: /kazi/

const CACHE_NAME = "nikah-registry-v2";

const ASSETS = [
  "/kazi/",
  "/kazi/index.html",
  "/kazi/css/style.css",
  "/kazi/js/app.js",
  "/kazi/js/firebase.js",
  "/kazi/js/cloudinary.js",
  "/kazi/js/ui.js",
  "/kazi/manifest.json",
  "https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&display=swap"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = event.request.url;
  if (
    url.includes("firebaseio.com") ||
    url.includes("googleapis.com/identitytoolkit") ||
    url.includes("cloudinary.com/v1_1")
  ) {
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
