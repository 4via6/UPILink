const CACHE_NAME = 'upi2qr-v1';
const DYNAMIC_CACHE = 'upi2qr-dynamic-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/create',
  '/manifest.json',
  '/offline.html',
  '/icon-192.png',
  '/icon-512.png',
  '/preview.png',
  // Add all your critical CSS and JS files
  '/assets/index.css',
  '/assets/index.js'
];

// Routes that should serve index.html for SPA
const ROUTES = [
  '/',
  '/create',
  '/pay'
];

// Install event - Cache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting(); // Ensure new service worker takes over immediately
});

// Enhanced fetch event with better routing
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle navigation requests
  if (request.mode === 'navigate' || (request.method === 'GET' && request.headers.get('accept').includes('text/html'))) {
    event.respondWith(
      fetch(request)
        .catch(() => {
          // Check if it's a known route
          if (ROUTES.some(route => url.pathname === route)) {
            return caches.match('/index.html');
          }
          // Fallback to offline page
          return caches.match('/offline.html');
        })
    );
    return;
  }

  // Handle static assets
  if (request.destination === 'style' || 
      request.destination === 'script' || 
      request.destination === 'image') {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(request)
            .then((networkResponse) => {
              const responseToCache = networkResponse.clone();
              caches.open(DYNAMIC_CACHE)
                .then((cache) => {
                  cache.put(request, responseToCache);
                });
              return networkResponse;
            })
            .catch(() => {
              // Return a fallback for images
              if (request.destination === 'image') {
                return caches.match('/icon-192.png');
              }
              return new Response('Not available offline');
            });
        })
    );
    return;
  }

  // Default fetch behavior
  event.respondWith(
    fetch(request)
      .catch(() => caches.match(request))
  );
});

// Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName.startsWith('upi2qr-') && 
                     cacheName !== CACHE_NAME && 
                     cacheName !== DYNAMIC_CACHE;
            })
            .map((cacheName) => caches.delete(cacheName))
        );
      })
  );
});

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-payments') {
    event.waitUntil(syncPayments());
  }
});

// Function to handle payment syncing
async function syncPayments() {
  try {
    const db = await openDB();
    const pendingPayments = await db.getAll('pendingPayments');
    
    for (const payment of pendingPayments) {
      try {
        // Process payment
        await processPayment(payment);
        // Remove from pending queue
        await db.delete('pendingPayments', payment.id);
      } catch (error) {
        console.error('Failed to process payment:', error);
      }
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
} 