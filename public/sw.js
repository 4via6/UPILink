const CACHE_NAME = 'upi2qr-v1';
const DYNAMIC_CACHE = 'upi2qr-dynamic-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/icon-192.png',
  '/icon-512.png',
  '/preview.png'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

// Enhanced fetch event with different strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Strategy for API calls
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request));
  }
  // Strategy for static assets
  else if (request.destination === 'image' || request.destination === 'style' || request.destination === 'script') {
    event.respondWith(cacheFirstStrategy(request));
  }
  // Strategy for HTML pages
  else {
    event.respondWith(staleWhileRevalidateStrategy(request));
  }
});

// Cache-first strategy
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(DYNAMIC_CACHE);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    return new Response('Network error happened', {
      status: 408,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

// Network-first strategy
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(DYNAMIC_CACHE);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response('Network error happened', {
      status: 408,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidateStrategy(request) {
  const cachedResponse = await caches.match(request);
  const networkResponsePromise = fetch(request).then(async (response) => {
    const cache = await caches.open(DYNAMIC_CACHE);
    cache.put(request, response.clone());
    return response;
  });
  return cachedResponse || networkResponsePromise;
}

// Check for sync support
const hasSyncSupport = 'sync' in ServiceWorkerRegistration.prototype;

// Modified background sync
if (hasSyncSupport) {
  self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-payments') {
      event.waitUntil(syncPayments());
    }
  });
}

// Periodic sync fallback for browsers without sync support
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-pending-payments') {
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