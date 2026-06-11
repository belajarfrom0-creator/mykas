'use client'

import { useEffect } from 'react'

export function ServiceWorkerCleanup() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      void navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => void registration.unregister())
      })
    }

    if ('caches' in window) {
      void caches.keys().then((cacheNames) => {
        cacheNames.forEach((cacheName) => {
          if (cacheName.includes('workbox') || cacheName.includes('api-cache')) {
            void caches.delete(cacheName)
          }
        })
      })
    }
  }, [])

  return null
}
