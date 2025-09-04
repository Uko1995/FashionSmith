// Service Worker for FashionSmith PWA
const CACHE_NAME = "fashionsmith-v1";
const STATIC_CACHE = "fashionsmith-static-v1";
const DYNAMIC_CACHE = "fashionsmith-dynamic-v1";

// Files to cache immediately
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/src/main.jsx",
  "/src/App.jsx",
  "/src/index.css",
  "/public/logo.png",
  "/public/FashionSmith.png",
  "/public/vite.svg",
  // Add other critical assets
];

// API endpoints to cache with network-first strategy
const API_ENDPOINTS = ["/api/products", "/api/user/profile", "/api/dashboard"];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...");

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("Service Worker: Caching static assets");
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log("Service Worker: Static assets cached successfully");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("Service Worker: Failed to cache static assets", error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log("Service Worker: Deleting old cache", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("Service Worker: Activated successfully");
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Handle static assets with cache-first strategy
  if (STATIC_ASSETS.some((asset) => url.pathname.endsWith(asset))) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Handle images with cache-first strategy
  if (request.destination === "image") {
    event.respondWith(cacheFirstStrategy(request, DYNAMIC_CACHE));
    return;
  }

  // Handle navigation requests with network-first, fallback to cache
  if (request.mode === "navigate") {
    event.respondWith(navigationStrategy(request));
    return;
  }

  // Default: network-first strategy
  event.respondWith(networkFirstStrategy(request));
});

// Cache-first strategy (for static assets and images)
async function cacheFirstStrategy(request, cacheName = STATIC_CACHE) {
  try {
    // Skip caching for chrome-extension URLs and unsupported schemes
    if (
      request.url.startsWith("chrome-extension:") ||
      request.url.startsWith("moz-extension:") ||
      request.url.startsWith("safari-extension:")
    ) {
      return fetch(request);
    }

    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      // Only cache HTTP/HTTPS requests
      if (request.url.startsWith("http")) {
        cache.put(request, networkResponse.clone());
      }
    }
    return networkResponse;
  } catch (error) {
    console.error("Cache-first strategy failed:", error);
    throw error;
  }
}

// Network-first strategy (for API calls and dynamic content)
async function networkFirstStrategy(request, cacheName = DYNAMIC_CACHE) {
  try {
    // Skip caching for chrome-extension URLs and unsupported schemes
    if (
      request.url.startsWith("chrome-extension:") ||
      request.url.startsWith("moz-extension:") ||
      request.url.startsWith("safari-extension:")
    ) {
      return fetch(request);
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      // Only cache HTTP/HTTPS requests
      if (request.url.startsWith("http")) {
        cache.put(request, networkResponse.clone());
      }
    }
    return networkResponse;
  } catch (error) {
    console.log("Network failed, trying cache:", error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Navigation strategy (for page navigation)
async function navigationStrategy(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch {
    // Fallback to cached index.html for SPA routing
    const cachedResponse = await caches.match("/index.html");
    if (cachedResponse) {
      return cachedResponse;
    }

    // Ultimate fallback
    return new Response("App is offline", {
      status: 503,
      statusText: "Service Unavailable",
      headers: { "Content-Type": "text/html" },
    });
  }
}

// Background sync for failed API requests
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle background synchronization
  console.log("Service Worker: Background sync triggered");

  // Example: Retry failed API requests stored in IndexedDB
  try {
    // Implementation would depend on your specific needs
    console.log("Service Worker: Background sync completed");
  } catch (error) {
    console.error("Service Worker: Background sync failed", error);
  }
}

// Push notification handler
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: "/public/logo.png",
      badge: "/public/logo.png",
      tag: data.tag || "notification",
      data: data.data || {},
      actions: [
        {
          action: "view",
          title: "View",
          icon: "/public/logo.png",
        },
        {
          action: "dismiss",
          title: "Dismiss",
        },
      ],
    };

    event.waitUntil(
      self.registration.showNotification(data.title || "FashionSmith", options)
    );
  }
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "view") {
    // Open the app or navigate to specific page
    event.waitUntil(
      self.clients.matchAll({ type: "window" }).then((clientList) => {
        for (const client of clientList) {
          if (client.url === self.location.origin && "focus" in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow("/");
        }
      })
    );
  }
});

// Message handler for communication with main thread
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Performance monitoring in service worker
self.addEventListener("fetch", (event) => {
  // Track cache hit rates
  if (event.request.method === "GET") {
    caches.match(event.request).then((response) => {
      const cacheStatus = response ? "hit" : "miss";
      // Send cache performance data back to main thread
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: "CACHE_PERFORMANCE",
            url: event.request.url,
            status: cacheStatus,
            timestamp: Date.now(),
          });
        });
      });
    });
  }
});
