// sw.js — Service Worker for নিকাহ রেজিস্ট্রি PWA

const CACHE_NAME = "nikah-registry-v1";

// ফাইলগুলো অফলাইনেও কাজ করবে
const ASSETS = [
  "/index.html",
  "/css/style.css",
  "/js/app.js",
  "/js/firebase.js",
  "/js/cloudinary.js",
  "/js/ui.js",
  "/manifest.json",
  "https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&display=swap"
];

// ── Install: ক্যাশে সেভ করো ──────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// ── Activate: পুরনো ক্যাশ মুছো ───────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: ক্যাশ থেকে দাও, না থাকলে নেটওয়ার্ক থেকে ─────────
self.addEventListener("fetch", (event) => {
  // Firebase ও Cloudinary API কল ক্যাশ করবো না
  const url = event.request.url;
  if (
    url.includes("firebaseio.com") ||
    url.includes("googleapis.com/identitytoolkit") ||
    url.includes("cloudinary.com/v1_1")
  ) {
    return; // নেটওয়ার্ক থেকে সরাসরি নাও
  }

  event.respondWith(
    caches.match(event.request).then(
      (cached) => cached || fetch(event.request)
    )
  );
});
