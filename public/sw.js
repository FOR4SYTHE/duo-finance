// This is a dummy service worker to prevent 404 errors in the terminal.
// It is likely that your browser has a stale service worker registered for localhost:3000
// from another project. This empty file will quiet the warnings!

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  // Unregister the stale service worker
  self.registration.unregister();
});
