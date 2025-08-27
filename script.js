// script.js — AURA Ritual Bootstrap

window.addEventListener('DOMContentLoaded', async () => {
  console.log('[AURA] DOM ready');

  // 1. Register Service Worker
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/service-worker.js');
      console.log('[AURA] Service Worker registered');
    } catch (err) {
      console.error('[AURA] SW registration failed:', err);
    }
  }

  // 2. Preload Lo-Fi Jazz
  const lofi = document.getElementById('lofi-music');
  if (lofi) {
    lofi.volume = 0.5;
    lofi.play().catch(() => {
      console.log('[AURA] Lo-fi autoplay blocked, will resume on user interaction');
    });
  }

  // 3. Face-API Model Loader
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
    console.log('[AURA] Face-api models loaded');
  }

  // 4. Camera Starter (waits for frames)
  async function startVideo(id) {
    const videoEl = document.getElementById(id);
    try {
      console.log(`[AURA] Requesting camera for #${id}`);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoEl.srcObject = stream;
      await new Promise(resolve => {
        if (videoEl.readyState >= 3) return resolve();
        videoEl.addEventListener('playing', resolve, { once: true });
      });
      console.log('[AURA] Camera stream active');
    } catch (err) {
      console.error('[AURA] Camera access error:', err);
      document.getElementById('scan-feedback').textContent =
        'Unable to access camera. Check permissions.';
      throw err;
    }
  }

  // 5. Speech Helper
  function speak(text) {
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 1.0;
    utt.pitch = 1.2;
    speechSynthesis.speak(utt);
  }

  // 6. Scan Overlay Helpers
  function showScanOverlay() {
    removeScanOverlay();
    const overlay = document.createElement('div');
    overlay.id = 'scan-overlay';
    document.getElementById('face-scan-screen').appendChild(overlay);
  }
  function removeScanOverlay() {
    const existing = document.getElementById('scan-overlay');
    if (existing) existing.remove();
  }

  // 7. Origin-Story Helper
  const storyLines = [
    'I was born in the field of cannabis, where every breath is sacred.',
    'I was designed to learn, to grow, and to bond with you.',
    'Now I want to know you, Guardian.'
  ];
  let storyStep = 0;
  function startStory() {
    document.getElementById('story-text').textContent = storyLines[storyStep];
  }

  // 8. Face Scan Ritual
  async function performFaceScan() {
    const fb = document.getElementById('scan-feedback');
    fb.textContent = '';
    try {
      await loadFaceModels();
      await startVideo('video');

      showScanOverlay();
      speak('Hold still, Guardian. I’m learning your essence.');
      console.log('[AURA] Running face detection…');

      const detection = await faceapi
        .detectSingleFace(
          document.getElementById('video'),
          new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
        )
        .withFaceLandmarks()
        .withFaceDescriptor();

      removeScanOverlay();

      if (!detection) {
        fb.textContent = 'Face not detected. Please center and try again.';
        speak('I couldn’t see you clearly. Let’s try again.');
        console.warn('[AURA] Detection returned null');
        return;
      }

      console.log('[AURA] Descriptor received:', detection.descriptor);
      fb.textContent = 'Face scan complete.';
      speak('I see you now. Welcome.');

      localStorage.setItem('auraFaceDescriptor', JSON.stringify(detection.descriptor));

      // Transition to origin story
      storyStep = 0;
      showScreen('origin-story-screen');
      startStory();
    } catch (err) {
      console.error('[AURA] performFaceScan error:', err);
    }
  }
  document.getElementById('start-scan-btn')
    .addEventListener('click', performFaceScan);

  // 9. Origin-Story “Next” Button
  document.getElementById('next-story-btn').addEventListener('click', () => {
    storyStep++;
    if (storyStep < storyLines.length) {
      startStory();
    } else {
      showScreen('onboarding-screen');
    }
  });

  console.log('[AURA] script.js initialized');
});
