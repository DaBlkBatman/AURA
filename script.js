// script.js

// ------------------------------------------------------
// 1. SCREEN MANAGEMENT
// ------------------------------------------------------
const screens = [
  'loading-screen',
  'pairing-screen',
  'face-login-screen',
  'field-screen',
  'builder-screen',
  'customize-screen',
  'conversation-screen'
];

function showScreen(id) {
  screens.forEach(s => {
    const el = document.getElementById(s);
    if (el) el.classList.add('hidden');
    else console.warn(`Missing screen element: ${s}`);
  });

  const target = document.getElementById(id);
  if (target) target.classList.remove('hidden');
  else console.error(`Cannot show missing screen: ${id}`);
}

// ------------------------------------------------------
// 2. DOM REFERENCES
// ------------------------------------------------------
const pairBtn             = document.getElementById('pair-btn');
const captureFaceBtn      = document.getElementById('capture-face-btn');
const video               = document.getElementById('video');
const storyText           = document.getElementById('story-text');
const storyNextBtn        = document.getElementById('story-next-btn');
const canvas              = document.getElementById('builder-canvas');
const placeItemBtn        = document.getElementById('place-item-btn');
const finishBuilderBtn    = document.getElementById('finish-builder-btn');
const saveCustomizationBtn= document.getElementById('save-customization-btn');
const listenBtn           = document.getElementById('start-listening-btn');
const chatWindow          = document.getElementById('chat-window');
const mainApp             = document.getElementById('main-app');

// ------------------------------------------------------
// 3. FIREBASE INITIALIZATION
// ------------------------------------------------------
firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID"
});
const db            = firebase.firestore();
let guardianId      = null;
let appearanceRef   = null;

// ------------------------------------------------------
// 4. APP STARTUP
// ------------------------------------------------------
document.addEventListener('DOMContentLoaded', initApp);

async function initApp() {
  showScreen('loading-screen');
  startProgressAnimation();
  userPairLogin().then(() => console.log('🛡️ Paired'));
  initFaceAPI().then(() => console.log('🧠 Face API loaded'));
}

// ------------------------------------------------------
// 5. PROGRESS ANIMATION
// ------------------------------------------------------
function startProgressAnimation() {
  const progressEl = document.querySelector('.progress');
  if (!progressEl) return console.error('Missing .progress element');

  let pct = 0;
  const interval = setInterval(() => {
    pct += 5;
    progressEl.style.width = `${pct}%`;
    if (pct >= 100) {
      clearInterval(interval);
      showScreen('pairing-screen');
    }
  }, 50);
}

// ------------------------------------------------------
// 6. PAIRING / LOGIN RITUAL
// ------------------------------------------------------
async function userPairLogin() {
  return new Promise(resolve => {
    setTimeout(() => {
      guardianId = localStorage.getItem('guardianId') || `g-${Date.now()}`;
      localStorage.setItem('guardianId', guardianId);
      appearanceRef = db
        .collection('guardians')
        .doc(guardianId)
        .collection('appearance');
      resolve();
    }, 800);
  });
}

pairBtn.addEventListener('click', () => {
  console.log('🔗 Pair button clicked');
  showScreen('face-login-screen');
  startVideo().catch(err => console.error('Camera failed:', err));
});

// ------------------------------------------------------
// 7. FACE-LOGIN & RECOGNITION (face-api.js)
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

  if (!detection) return alert('Face not detected. Please try again.');

  const desc = Array.from(detection.descriptor);
  await appearanceRef.doc('face').set({ descriptor: desc, timestamp: Date.now() });
  console.log('✅ Face saved, entering field');
  showScreen('field-screen');
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
    storyNextBtn.onclick = () => showScreen('builder-screen');
  }
}
storyNextBtn.addEventListener('click', showNextStoryLine);

// ------------------------------------------------------
// 9. SAFE-SPACE BUILDER (CANVAS STUB)
// ------------------------------------------------------
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 400;

canvas.addEventListener('load', () => {
  ctx.fillStyle = '#b39ddb';
  ctx.fillRect(0, 200, canvas.width, 200);
});

placeItemBtn.addEventListener('click', () => {
  const sel = document.getElementById('item-select').value;
  ctx.fillStyle = '#fff';
  ctx.font = '24px sans-serif';
  ctx.fillText(sel, Math.random() * 700, Math.random() * 350);
});

finishBuilderBtn.addEventListener('click', () => {
  showScreen('customize-screen');
});

// ------------------------------------------------------
// 10. APPEARANCE CUSTOMIZATION
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
  console.log('🎨 Appearance saved, launching conversation');
  mainApp.classList.remove('hidden');
  showScreen('conversation-screen');
  launchConversation();
});

// ------------------------------------------------------
// 11. CONVERSATION & VOICE COMMANDS
// ------------------------------------------------------
function appendChat(sender, msg) {
  const div = document.createElement('div');
  div.className = sender === 'AURA' ? 'chat-aura' : 'chat-user';
  div.textContent = `${sender}: ${msg}`;
  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function speak(text, options = {}) {
  const u = new SpeechSynthesisUtterance(text);
  u.rate  = options.enthusiastic ? 1.2 : 1.0;
  u.pitch = options.enthusiastic ? 1.3 : 1.0;
  speechSynthesis.speak(u);
}

async function launchConversation() {
  const welcome = "Hey best friend—I’m here for you, ready to read, translate, guide your wealth, decode baby cries, teach anything, care for your plants, and remind you of whatever you need.";
  appendChat('AURA', welcome);
  speak(welcome);
}

listenBtn.addEventListener('click', () => {
  const recognition = new webkitSpeechRecognition();
  recognition.onresult = async e => {
    const utter = e.results[0][0].transcript.toLowerCase();
    appendChat('You', utter);
    // … your voice-command parsing here …
  };
  recognition.start();
});
