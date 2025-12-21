import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Aggressive Service Worker update mechanism
// This ensures old broken service workers are replaced
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      // First, clear any old caches that might be causing issues
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const cacheName of cacheNames) {
          // Delete any v1 caches (old broken version)
          if (cacheName.includes('v1') || cacheName.includes('serenity-ai-v1')) {
            console.log('Deleting old cache:', cacheName);
            await caches.delete(cacheName);
          }
        }
      }

      // Register/update the service worker
      const registration = await navigator.serviceWorker.register('/sw.js', {
        updateViaCache: 'none' // Always check for updates
      });
      
      console.log('SW registered:', registration);

      // Force update check
      registration.update();

      // When a new SW is found, prompt it to take control immediately
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New SW is ready, reload to use it
              console.log('New SW installed, reloading...');
              window.location.reload();
            }
          });
        }
      });
    } catch (error) {
      console.log('SW registration failed:', error);
      
      // If SW registration fails, try to unregister all SWs and reload
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.unregister();
        }
        // Clear all caches
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          for (const cacheName of cacheNames) {
            await caches.delete(cacheName);
          }
        }
      } catch (e) {
        console.log('Cleanup failed:', e);
      }
    }
  });
}
