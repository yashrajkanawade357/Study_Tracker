import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// ── Auto-update: when a new deploy's service worker takes control, reload
// once so users always get the latest version (no manual hard-refresh).
// Guarded by `reloaded` so it can never loop. The PWA SW uses skipWaiting +
// clientsClaim (registerType: 'autoUpdate'), so a new build activates and
// fires `controllerchange`; we also poll every few minutes so a long-open
// tab (e.g. a judge's) picks up updates without navigating.
if ('serviceWorker' in navigator) {
  let reloaded = false
  const hadController = !!navigator.serviceWorker.controller
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloaded || !hadController) return // skip the very first install claim
    reloaded = true
    window.location.reload()
  })
  navigator.serviceWorker.ready.then((reg) => {
    setInterval(() => { reg.update().catch(() => {}) }, 5 * 60 * 1000)
  }).catch(() => {})
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
