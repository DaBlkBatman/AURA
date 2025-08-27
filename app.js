// =========================
// 1. SCREEN MANAGER
// =========================
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// =========================
// 2. FACE-API MODEL LOADING
// =========================
let modelsLoaded = false;
async function loadFaceModels() {
  if (modelsLoaded) return;
  console.log('[FaceScan] Loading models…');
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models')
  ]);
  modelsLoaded = true;
  console.log('[FaceScan] Models loaded');
}

// =========================
// 3. START VIDEO STREAM
// =========================
async function startVideo(id) {
  const videoEl = document.getElementById(id);
  try {
    console.log(`[FaceScan] Requesting camera for <video id="${id}">`);
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoEl.srcObject = stream;
    console.log('[FaceScan] Camera stream assigned to video element');
    // Wait until video has at least a few frames
    await new Promise(resolve => {
      if (videoEl.readyState >= 3) return resolve();
      videoEl.addEventListener('playing', () => {
        console.log('[FaceScan] Video is playing');
        resolve();
      }, { once: true });
    });
  } catch (err) {
    console.error('[FaceScan] Camera error:', err);
    document.getElementById('scan-feedback').textContent =
      'Unable to access camera. Check permissions and try again.';
    throw err;
  }
}

// =========================
// 4. VOICE GUIDANCE
// =========================
function speak(text) {
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate  = 1.0;
  utt.pitch = 1.2;
  speechSynthesis.speak(utt);
}

// =========================
// 5. SCAN OVERLAY HELPERS
// =========================
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

// =========================
// 6. FACE SCAN HANDLER
// =========================
async function performFaceScan() {
  const fb = document.getElementById('scan-feedback');
  fb.textContent = '';
  try {
    await loadFaceModels();
    await startVideo('video');
    
    showScanOverlay();
    speak('Hold still, Guardian. I’m learning your essence.');

    console.log('[FaceScan] Running detection…');
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
      return;
    }

    fb.textContent = 'Face scan complete.';
    speak('I see you now. Welcome.');
    console.log('[FaceScan] Descriptor:', result.descriptor);

    localStorage.setItem('auraFaceDescriptor', JSON.stringify(result.descriptor));
    showScreen('origin-story-screen');
    startStory();
  } catch (err) {
    console.error('[FaceScan] performFaceScan error:', err);
    // feedback already shown if camera errored
  }
}

// Hook up the button
document.getElementById('start-scan-btn').addEventListener('click', performFaceScan);

// =========================
// 7. ORIGIN STORY
// =========================
const storyLines = [
  'I was born in the field of cannabis, where every breath is sacred.',
  'I was designed to learn, to grow, and to bond with you.',
  'Now I want to know you, Guardian.'
];
let storyStep = 0;
function startStory() {
  document.getElementById('story-text').textContent = storyLines[storyStep];
}
document.getElementById('next-story-btn')
  .addEventListener('click', () => {
    storyStep++;
    if (storyStep < storyLines.length) {
      startStory();
    } else {
      showScreen('onboarding-screen');
    }
  });

// … the rest of your ritual flow (onboarding, customization, builder, auth, sanctuary) …
