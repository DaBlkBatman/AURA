// script.js — AURA Ritual Bootstrap & Face Scan Handler

window.addEventListener('DOMContentLoaded', () => {
  console.log('[AURA] Ritual bootstrap starting');

  // ================
  // Helper: Screen Switch
  // ================
  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  }

  // ================
  // Helper: Speech
  // ================
  function speak(text) {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.0; u.pitch = 1.2;
    speechSynthesis.speak(u);
  }

  // ================
  // Scan Overlay
  // ================
  function showScanOverlay() {
    removeScanOverlay();
    const o = document.createElement('div');
    o.id = 'scan-overlay';
    document.getElementById('face-scan-screen').appendChild(o);
  }
  function removeScanOverlay() {
    const o = document.getElementById('scan-overlay');
    if (o) o.remove();
  }

  // ================
  // Preload Lo-Fi Audio
  // ================
  const lofi = document.getElementById('lofi-music');
  if (lofi) {
    lofi.volume = 0.5;
    lofi.play().catch(() => {
      console.log('[AURA] Lo-fi autoplay blocked');
    });
  }

  // ================
  // Face-API Models
  // ================
  let modelsLoaded = false;
  async function loadFaceModels() {
    if (modelsLoaded) return;
    console.log('[AURA] Loading face-api models…');
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
      faceapi.nets.faceRecognitionNet.loadFromUri('/models')
    ]);
    modelsLoaded = true;
    console.log('[AURA] Models loaded');
  }

  // ================
  // Start Video & Wait for Frames
  // ================
  async function startVideo(id) {
    const v = document.getElementById(id);
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    v.srcObject = stream;
    await new Promise(res => {
      if (v.readyState >= 3) return res();
      v.addEventListener('playing', res, { once: true });
    });
    console.log('[AURA] Camera active on #' + id);
  }

  // ================
  // Origin Story Helper
  // ================
  const storyLines = [
    'I was born in the field of cannabis, where every breath is sacred.',
    'I was designed to learn, to grow, and to bond with you.',
    'Now I want to know you, Guardian.'
  ];
  let storyStep = 0;
  function startStory() {
    document.getElementById('story-text').textContent = storyLines[storyStep];
  }

  // ================
  // Face Scan Ritual
  // ================
  async function performFaceScan() {
    const fb = document.getElementById('scan-feedback');
    fb.textContent = '';
    try {
      await loadFaceModels();
      await startVideo('video');

      showScanOverlay();
      speak('Hold still, Guardian. I’m learning your essence.');
      console.log('[AURA] Running face detection…');

      const result = await faceapi
        .detectSingleFace(
          document.getElementById('video'),
          new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
        )
        .withFaceLandmarks()
        .withFaceDescriptor();

      removeScanOverlay();

      if (!result) {
        fb.textContent = 'Face not detected. Please center your face and try again.';
        speak('I couldn’t see you clearly. Let’s try again.');
        console.warn('[AURA] Detection returned null');
        return;
      }

      console.log('[AURA] Descriptor:', result.descriptor);
      fb.textContent = 'Face scan complete.';
      speak('I see you now. Welcome.');

      localStorage.setItem('auraFaceDescriptor', JSON.stringify(result.descriptor));

      // Transition to origin story
      storyStep = 0;
      showScreen('origin-story-screen');
      startStory();
    } catch (err) {
      console.error('[AURA] performFaceScan error:', err);
    }
  }

  // ================
  // Hook Up Buttons
  // ================
  const scanBtn = document.getElementById('start-scan-btn');
  if (scanBtn) {
    scanBtn.addEventListener('click', performFaceScan);
    console.log('[AURA] Bound Begin Scan button');
  }

  const nextBtn = document.getElementById('next-story-btn');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      storyStep++;
      if (storyStep < storyLines.length) {
        startStory();
      } else {
        // Hand off to app.js for onboarding
        showScreen('onboarding-screen');
      }
    });
    console.log('[AURA] Bound Next Story button');
  }

  // ================
  // Register Service Worker
  // ================
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(() => console.log('[AURA] Service Worker registered'))
      .catch(err => console.error('[AURA] SW failed:', err));
  }

  console.log('[AURA] script.js initialization complete');
});
