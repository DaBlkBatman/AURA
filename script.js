// script.js — Rock‐Solid Face Scan Ritual

window.addEventListener('DOMContentLoaded', () => {
  console.log('[AURA] script.js loaded');

  const videoEl = document.getElementById('video');
  const btnScan = document.getElementById('start-scan-btn');
  const fb       = document.getElementById('scan-feedback');
  const scanSec  = document.getElementById('face-scan-screen');
  const storySec = document.getElementById('origin-story-screen');
  const nextBtn  = document.getElementById('next-story-btn');
  const storyTxt = document.getElementById('story-text');

  // 1. Show/Hide Screens
  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  }

  // 2. Speak Helper
  function speak(text) {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.0; u.pitch = 1.2;
    speechSynthesis.speak(u);
  }

  // 3. Overlay Helpers
  function showScanOverlay() {
    removeScanOverlay();
    const o = document.createElement('div');
    o.id = 'scan-overlay';
    scanSec.appendChild(o);
  }
  function removeScanOverlay() {
    const o = document.getElementById('scan-overlay');
    if (o) o.remove();
  }

  // 4. Story Helper
  const storyLines = [
    'I was born in the field of cannabis, where every breath is sacred.',
    'I was designed to learn, to grow, and to bond with you.',
    'Now I want to know you, Guardian.'
  ];
  let storyIndex = 0;
  function showStoryLine() {
    storyTxt.textContent = storyLines[storyIndex];
  }
  nextBtn.addEventListener('click', () => {
    storyIndex++;
    if (storyIndex < storyLines.length) {
      showStoryLine();
    } else {
      showScreen('onboarding-screen');
    }
  });

  // 5. Load Face-API Models
  let modelsLoaded = false;
  async function loadModels() {
    if (modelsLoaded) return;
    fb.textContent = 'Loading face models…';
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models')
      ]);
      modelsLoaded = true;
      fb.textContent = '';
      console.log('[AURA] Models loaded');
    } catch (err) {
      fb.textContent = 'Failed to load face models.';
      console.error('[AURA] loadModels error:', err);
      throw err;
    }
  }

  // 6. Start Camera & Wait for Frames
  async function startCamera() {
    fb.textContent = '';
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoEl.srcObject = stream;
      // Some browsers need explicit .play()
      await videoEl.play().catch(() => {});
      await new Promise(res => {
        if (videoEl.readyState >= 3) return res();
        videoEl.addEventListener('playing', res, { once: true });
      });
      console.log('[AURA] Camera active');
    } catch (err) {
      fb.textContent = 'Unable to access camera. Check permissions.';
      console.error('[AURA] startCamera error:', err);
      throw err;
    }
  }

  // 7. Perform Face Scan Ritual
  btnScan.addEventListener('click', async () => {
    btnScan.disabled = true;
    fb.textContent = '';
    try {
      await loadModels();
      await startCamera();

      showScanOverlay();
      speak('Hold still, Guardian. I’m learning your essence.');
      console.log('[AURA] Running detection…');

      // Lower threshold and increase input size for reliability
      const options = new faceapi.TinyFaceDetectorOptions({
        inputSize: 512,
        scoreThreshold: 0.2
      });

      const detection = await faceapi
        .detectSingleFace(videoEl, options)
        .withFaceLandmarks()
        .withFaceDescriptor();

      removeScanOverlay();

      if (!detection) {
        fb.textContent = 'Face not detected. Please center your face and try again.';
        speak('I couldn’t see you clearly. Let’s try again.');
        console.warn('[AURA] detection returned null');
        btnScan.disabled = false;
        return;
      }

      console.log('[AURA] Descriptor:', detection.descriptor);
      fb.textContent = 'Face scan complete.';
      speak('I see you now. Welcome.');

      localStorage.setItem('auraFaceDescriptor', JSON.stringify(detection.descriptor));

      // Transition to origin‐story
      storyIndex = 0;
      showScreen('origin-story-screen');
      showStoryLine();
    } catch (err) {
      console.error('[AURA] performFaceScan error:', err);
    } finally {
      btnScan.disabled = false;
    }
  });

  console.log('[AURA] Face‐scan ritual bound and ready.');
});
