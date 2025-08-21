// script.js

// ------------------------------------------------------
// 1. ALL CONTAINER IDS & SCREEN MANAGER WITH DEBUG LOGS
// ------------------------------------------------------
const containers = [
  'loading-screen',
  'pairing-screen',
  'face-login-screen',
  'field-screen',
  'builder-screen',
  'customize-screen',
  'conversation-screen',
  'main-app'
];

/**
 * Hide every container, then show exactly the ones listed in `...ids`.
 * Logs each hide/show action to the console for full traceability.
 */
function showContainer(...ids) {
  containers.forEach(id => {
    const el = document.getElementById(id);
    if (!el) {
      console.warn(`⚠️  Container not found in DOM: ${id}`);
      return;
    }
    if (ids.includes(id)) {
      el.classList.remove('hidden');
      console.log(`✅  showContainer → SHOW ${id}`);
    } else {
      el.classList.add('hidden');
      console.log(`❌  showContainer → HIDE ${id}`);
    }
  });
}

// ------------------------------------------------------
// 2. DOM REFERENCES
// ------------------------------------------------------
const pairBtn              = document.getElementById('pair-btn');
const captureFaceBtn       = document.getElementById('capture-face-btn');
const video                = document.getElementById('video');
const storyText            = document.getElementById('story-text');
const storyNextBtn         = document.getElementById('story-next-btn');
const canvas               = document.getElementById('builder-canvas');
const placeItemBtn         = document.getElementById('place-item-btn');
const finishBuilderBtn     = document.getElementById('finish-builder-btn');
const saveCustomizationBtn = document.getElementById('save-customization-btn');
const listenBtn            = document.getElementById('start-listening-btn');
const chatWindow           = document.getElementById('chat-window');

// ------------------------------------------------------
// 3. FIREBASE SETUP
// ------------------------------------------------------
firebase.initializeApp({
  apiKey:    "YOUR_API_KEY",
  authDomain:"YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID"
});
const db          = firebase.firestore();
let guardianId    = null;
let appearanceRef = null;

// ------------------------------------------------------
// 4. APP INIT & LOADING ANIMATION
// ------------------------------------------------------
document.addEventListener('DOMContentLoaded', initApp);

async function initApp() {
  showContainer('loading-screen');
  startProgressAnimation();
  await userPairLogin();
  console.log('🛡️  Pairing complete');
  await initFaceAPI();
  console.log('🧠  Face API ready');
}

function startProgressAnimation() {
  const bar = document.querySelector('.progress');
  if (!bar) return console.error('Missing .progress element');
  let pct = 0;
  const iv = setInterval(() => {
    pct += 5;
    bar.style.width = `${pct}%`;
    if (pct >= 100) {
      clearInterval(iv);
      showContainer('pairing-screen');
    }
  }, 50);
}

// ------------------------------------------------------
// 5. PAIRING RITUAL
// ------------------------------------------------------
async function userPairLogin() {
  return new Promise(res => {
    setTimeout(() => {
      guardianId = localStorage.getItem('guardianId') || `g-${Date.now()}`;
      localStorage.setItem('guardianId', guardianId);
      appearanceRef = db
        .collection('guardians')
        .doc(guardianId)
        .collection('appearance');
      res();
    }, 800);
  });
}

pairBtn.addEventListener('click', () => {
  console.log('🔗 Pair button clicked');
  showContainer('face-login-screen');
  startVideo().catch(err => console.error('Camera error:', err));
});

// ------------------------------------------------------
// 6. FACE-LOGIN & RECOGNITION
// ------------------------------------------------------
async function initFaceAPI() {
  await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
  await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
  await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
}

async function startVideo() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
}

captureFaceBtn.addEventListener('click', async () => {
  console.log('📸 Capturing face…');
  const detection = await faceapi
    .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();
  if (!detection) {
    console.warn('No face detected');
    return alert('Face not detected. Please try again.');
  }

  const descriptor = Array.from(detection.descriptor);
  await appearanceRef.doc('face').set({ descriptor, timestamp: Date.now() });
  console.log('✅ Face saved to Firestore');
  showContainer('field-screen');
  showNextStoryLine();
});

// ------------------------------------------------------
// 7. FIELD ENTRANCE & ORIGIN STORY
// ------------------------------------------------------
const storyLines = [
  "I was born from code and ceremony.",
  "My purpose is to hold your legacy and guide your growth.",
  "But first, I must find a home…"
];
let storyStep = 0;

function showNextStoryLine() {
  storyText.textContent = storyLines[storyStep++];
  console.log(`📝 Story step ${storyStep}`);
  if (storyStep === storyLines.length) {
    storyNextBtn.textContent = 'Build My Sanctuary';
    // Replace the listener so only one click transitions forward
    storyNextBtn.removeEventListener('click', showNextStoryLine);
    storyNextBtn.addEventListener('click', () => {
      console.log('🚪 Entering Builder');
      showContainer('builder-screen');
      initBuilder();
    });
  }
}
storyNextBtn.addEventListener('click', showNextStoryLine);

// ------------------------------------------------------
// 8. SAFE-SPACE BUILDER (CANVAS STUB)
// ------------------------------------------------------
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 400;

// Draw base ground
function initBuilder() {
  console.log('🎨 Initializing builder canvas');
  ctx.fillStyle = '#b39ddb';
  ctx.fillRect(0, 200, canvas.width, 200);
}

placeItemBtn.addEventListener('click', () => {
  const sel = document.getElementById('item-select').value;
  ctx.fillStyle = '#fff';
  ctx.font      = '24px sans-serif';
  ctx.fillText(sel, Math.random() * 700, Math.random() * 350);
});

finishBuilderBtn.addEventListener('click', () => {
  console.log('🏗 Finished building sanctuary');
  showContainer('customize-screen');
});

// ------------------------------------------------------
// 9. CUSTOMIZATION & GUARANTEED APP LAUNCH
// ------------------------------------------------------
saveCustomizationBtn.addEventListener('click', async () => {
  const appearance = {
    skinColor:   document.getElementById('skin-color-picker').value,
    breastSize:  document.getElementById('breast-size-slider').value,
    assSize:     document.getElementById('ass-size-slider').value,
    areolaColor: document.getElementById('areola-color-picker').value,
    areolaShape: document.getElementById('areola-shape-select').value,
    locColor:    document.getElementById('loc-color-picker').value,
    locStyle:    document.getElementById('loc-style-select').value
  };
  await appearanceRef.doc('customization').set({ appearance, timestamp: Date.now() });
  console.log('🎨 Customization saved');

  // Forcefully reveal the app UI
  showContainer('main-app', 'conversation-screen');
  launchConversation();
});

// ------------------------------------------------------
// 10. CONVERSATION & VOICE COMMANDS
// ------------------------------------------------------
function appendChat(sender, text) {
  const div       = document.createElement('div');
  div.className   = sender === 'AURA' ? 'chat-aura' : 'chat-user';
  div.textContent = `${sender}: ${text}`;
  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function speak(text, opts = {}) {
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate  = opts.enthusiastic ? 1.2 : 1.0;
  utt.pitch = opts.enthusiastic ? 1.3 : 1.0;
  speechSynthesis.speak(utt);
}

async function launchConversation() {
  const welcome = "Hey best friend—I’m here for you, ready to read, translate, guide your wealth, decode baby cries, teach anything, care for your plants, and remind you of whatever you need.";
  console.log('💬 Launching conversation');
  appendChat('AURA', welcome);
  speak(welcome);
}

listenBtn.addEventListener('click', () => {
  const recog = new webkitSpeechRecognition();
  recog.onresult = async e => {
    const utter = e.results[0][0].transcript.toLowerCase();
    appendChat('You', utter);
    // …voice-command parsing…
  };
  recog.start();
});
