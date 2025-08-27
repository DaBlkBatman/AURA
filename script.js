// ==============================
// AURA Companion: script.js
// ==============================

// 1. Register Service Worker for Offline Support
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/service-worker.js')
    .then(() => console.log('[AURA] Service Worker registered successfully.'))
    .catch(err => console.error('[AURA] Service Worker registration failed:', err));
}

// 2. Request Notification Permission (optional expansion)
if ('Notification' in window && Notification.permission !== 'granted') {
  Notification.requestPermission().then(permission => {
    console.log(`[AURA] Notification permission: ${permission}`);
  });
}

// 3. Preload Audio (optional)
const lofi = document.getElementById('lofi-music');
if (lofi) {
  lofi.volume = 0.5;
  lofi.play().catch(() => {
    console.log('[AURA] Lo-fi music autoplay blocked. Will resume after user interaction.');
  });
}

// 4. Preload Models (optional if not handled in app.js)
async function preloadFaceModels() {
  if (!window.faceapi) return;
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models')
  ]);
  console.log('[AURA] Face models preloaded.');
}

// 5. Optional: Wake AURA with a greeting
window.addEventListener('DOMContentLoaded', () => {
  console.log('[AURA] Ritual initialized.');
  if ('speechSynthesis' in window) {
    const greeting = new SpeechSynthesisUtterance('Welcome, Guardian. AURA is ready.');
    greeting.rate = 1.0;
    greeting.pitch = 1.2;
    speechSynthesis.speak(greeting);
  }
});
