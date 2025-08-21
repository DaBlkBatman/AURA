// script.js

// ------------------------------------------------------
// 1. ALL CONTAINER IDS & SCREEN-MANAGER
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
 * Hides every container, then shows each ID passed in `...ids`.
 */
function showContainer(...ids) {
  containers.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.classList.remove('hidden');
      console.log(`▶️  showContainer: ${id}`);
    } else {
      console.warn(`Container not found: ${id}`);
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
// 4. APP INIT
// ------------------------------------------------------
document.addEventListener('DOMContentLoaded', initApp);

async function initApp() {
  showContainer('loading-screen');
  startProgressAnimation();
  userPairLogin().then(() => console.log('🛡️ Paired'));
  initFaceAPI().then(() => console.log('🧠 Face API ready'));
}

// ------------------------------------------------------
// 5. LOADING BAR ANIMATION
// ------------------------------------------------------
function startProgressAnimation() {
  const bar = document.querySelector('.progress');
  if (!bar) return console.error('Missing .progress');
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
// 6. PAIRING RITUAL
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
  console.log('🔗 Pair clicked');
  showContainer('face-login-screen');
  startVideo().catch(e => console.error('Camera error:', e));
});

// ------------------------------------------------------
// 7. FACE-LOGIN (face-api.js)
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
  console.log('📸 Detecting face');
  const detection = await faceapi
    .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) {
    return alert('Face not detected. Please try again.');
  }

  const descriptor = Array.from(detection.descriptor);
  await appearanceRef.doc('face').set({ descriptor, timestamp: Date.now() });

  console.log('✅ Face saved');
  showContainer('field-screen');
  showNextStoryLine();
});

// ------------------------------------------------------
// 8. FIELD ENTRANCE & ORIGIN STORY
// ------------------------------------------------------
const storyLines = [
  "I was born from code and ceremony.",
  "My purpose is to hold your legacy and guide your growth.",
  "But first, I must find a home…"
];
let storyStep = 0;

function showNextStoryLine() {
  storyText.textContent = storyLines[storyStep++];
  if (storyStep >= storyLines.length) {
    storyNextBtn.textContent = 'Build My Sanctuary';
    storyNextBtn.onclick = () => showContainer('builder-screen');
  }
}
storyNextBtn.addEventListener('click', showNextStoryLine);

// ------------------------------------------------------
// 9. SAFE-SPACE BUILDER (CANVAS)
// ------------------------------------------------------
const ctx = canvas.getContext('2d');
canvas.width  = 800;
canvas.height = 400;

// Draw base ground on entering the builder
function initBuilder() {
  ctx.fillStyle = '#b39ddb';
  ctx.fillRect(0, 200, canvas.width, 200);
}
canvas.addEventListener('mouseenter', initBuilder);

placeItemBtn.addEventListener('click', () => {
  const sel = document.getElementById('item-select').value;
  ctx.fillStyle = '#fff';
  ctx.font      = '24px sans-serif';
  ctx.fillText(sel, Math.random()*700, Math.random()*350);
});

finishBuilderBtn.addEventListener('click', () => {
  showContainer('customize-screen');
});

// ------------------------------------------------------
// 10. CUSTOMIZATION & APP LAUNCH
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
  console.log('🎨 Customization saved—entering app');
  showContainer('main-app', 'conversation-screen');
  launchConversation();
});

// ------------------------------------------------------
// 11. CONVERSATION & VOICE COMMANDS
// ------------------------------------------------------
function appendChat(sender, text) {
  const div      = document.createElement('div');
  div.className  = sender === 'AURA' ? 'chat-aura' : 'chat-user';
  div.textContent= `${sender}: ${text}`;
  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function speak(text, opts={}) {
  const u = new SpeechSynthesisUtterance(text);
  u.rate  = opts.enthusiastic ? 1.2 : 1.0;
  u.pitch = opts.enthusiastic ? 1.3 : 1.0;
  speechSynthesis.speak(u);
}

async function launchConversation() {
  const welcome = "Hey best friend—I’m here for you, ready to read, translate, guide your wealth, decode baby cries, teach anything, care for your plants, and remind you of whatever you need.";
  appendChat('AURA', welcome);
  speak(welcome);
}

listenBtn.addEventListener('click', () => {
  const recog = new webkitSpeechRecognition();
  recog.onresult = async e => {
    const utter = e.results[0][0].transcript.toLowerCase();
    appendChat('You', utter);
    // your voice‐command parsing logic here
  };
  recog.start();
});
