// script.js — AURA Face-Scan Ritual & Bootstrap

window.addEventListener('DOMContentLoaded', () => {
  console.log('[AURA] Ritual bootstrap starting');

  const videoEl = document.getElementById('video');
  const btnScan = document.getElementById('start-scan-btn');
  const fb       = document.getElementById('scan-feedback');
  const scanSec  = document.getElementById('face-scan-screen');
  const storySec = document.getElementById('origin-story-screen');
  const nextBtn  = document.getElementById('next-story-btn');
  const storyTxt = document.getElementById('story-text');

  // Screen helper
  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  }

  // Speech helper
  function speak(text) {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.0; u.pitch = 1.2;
    speechSynthesis.speak(u);
  }

  // Scan overlay
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

  // Origin story lines
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
      // Hand off to app.js
      showScreen('onboarding-screen');
    }
  });

  // Load face-api models
  let modelsLoaded = false;
  async function loadModels() {
    if (modelsLoaded) return;
    fb.textContent = 'Loading face models…';
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
    modelsLoaded = true;
    fb.textContent = '';
    console.log('[AURA] Models loaded');
  }

  // Start camera and wait for frames
  async function startCamera() {
    fb.textContent = '';
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoEl.srcObject = stream;
    return new Promise(resolve => {
      if (videoEl.readyState >= 3) return resolve();
      videoEl.addEventListener('playing', resolve, { once: true });
    });
  }

  // Perform face scan ritual
  btnScan.addEventListener('click', async () => {
    btnScan.disabled = true;
    fb.textContent = '';
    try {
      await loadModels();
      await startCamera();

      showScanOverlay();
      speak('Hold still, Guardian. I’m learning your essence.');
      console.log('[AURA] Running face detection…');

      const result = await faceapi
        .detectSingleFace(
          videoEl,
          new faceapi.TinyFaceDetectorOptions({ inputSize: 224 })
        )
        .withFaceLandmarks()
        .withFaceDescriptor();

      removeScanOverlay();

      if (!result) {
        fb.textContent = 'Face not detected. Please center your face and try again.';
        speak('I couldn’t see you clearly. Let’s try again.');
        btnScan.disabled = false;
        return;
      }

      console.log('[AURA] Descriptor:', result.descriptor);
      fb.textContent = 'Face scan complete.';
      speak('I see you now. Welcome.');

      localStorage.setItem('auraFaceDescriptor', JSON.stringify(result.descriptor));

      // Transition to origin story
      storyIndex = 0;
      showScreen('origin-story-screen');
      showStoryLine();
    } catch (err) {
      console.error('[AURA] performFaceScan error:', err);
      fb.textContent = 'Scan failed. Check camera permissions and try again.';
    } finally {
      btnScan.disabled = false;
    }
  });

  console.log('[AURA] script.js initialization complete');
});
