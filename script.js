// script.js

// ------------------------------------------------------
// 0. DOM References
// ------------------------------------------------------
const loadingScreen       = document.getElementById('loading-screen');
const pairingScreen       = document.getElementById('pairing-screen');
const faceLoginScreen     = document.getElementById('face-login-screen');
const fieldScreen         = document.getElementById('field-screen');
const builderScreen       = document.getElementById('builder-screen');
const customizeScreen     = document.getElementById('customize-screen');
const mainApp             = document.getElementById('main-app');
const conversationScreen  = document.getElementById('conversation-screen');

const chatWindow          = document.getElementById('chat-window');
const listenBtn           = document.getElementById('start-listening-btn');

// Real-world / plant scan UI
const realWorldView       = document.getElementById('real-world-view');
const plantImageInput     = document.getElementById('plant-image-input');
const reminderList        = document.getElementById('reminder-list');

// ------------------------------------------------------
// 1. Firebase Initialization
// ------------------------------------------------------
firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
});
const db = firebase.firestore();
let guardianId   = null;
let appearanceRef = null;

// ------------------------------------------------------
// 2. Pair/Login Ritual
// ------------------------------------------------------
async function userPairLogin() {
  return new Promise(resolve => {
    setTimeout(() => {
      guardianId = localStorage.getItem('guardianId')
        || `g-${Date.now()}`;
      localStorage.setItem('guardianId', guardianId);
      appearanceRef = db
        .collection('guardians')
        .doc(guardianId)
        .collection('appearance');
      resolve();
    }, 800);
  });
}

// ------------------------------------------------------
// 3. Face-Login & Recognition (face-api.js)
// ------------------------------------------------------
async function initFaceAPI() {
  await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
  await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
  await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
}
initFaceAPI();

const video          = document.getElementById('video');
const captureFaceBtn = document.getElementById('capture-face-btn');

async function startVideo() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
  video.srcObject = stream;
}
startVideo();

captureFaceBtn.addEventListener('click', async () => {
  const detection = await faceapi
    .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks().withFaceDescriptor();

  if (!detection) {
    return alert('Face not detected. Please try again.');
  }

  const desc = Array.from(detection.descriptor);
  localStorage.setItem('faceDescriptor', JSON.stringify(desc));
  await appearanceRef.doc('face').set({
    descriptor: desc,
    timestamp: Date.now()
  });

  faceLoginScreen.classList.add('hidden');
  launchFieldEntrance();
});

// ------------------------------------------------------
// 4. Field Entrance & Origin Story
// ------------------------------------------------------
const storyText    = document.getElementById('story-text');
const storyNextBtn = document.getElementById('story-next-btn');
const storyLines   = [
  "I was born from code and ceremony.",
  "My purpose is to hold your legacy and guide your growth.",
  "But first, I must find a home…"
];
let storyStep = 0;

function launchFieldEntrance() {
  fieldScreen.classList.remove('hidden');
  showNextStoryLine();
}

function showNextStoryLine() {
  storyText.textContent = storyLines[storyStep++];
  if (storyStep >= storyLines.length) {
    storyNextBtn.textContent = 'Build My Sanctuary';
    storyNextBtn.onclick = enterBuilder;
  }
}
storyNextBtn.addEventListener('click', showNextStoryLine);

// ------------------------------------------------------
// 5. Safe-Space Builder (Canvas Stub)
// ------------------------------------------------------
const canvas           = document.getElementById('builder-canvas');
const ctx              = canvas.getContext('2d');
const placeItemBtn     = document.getElementById('place-item-btn');
const finishBuilderBtn = document.getElementById('finish-builder-btn');

function enterBuilder() {
  fieldScreen.classList.add('hidden');
  builderScreen.classList.remove('hidden');
  ctx.fillStyle = '#b39ddb';
  ctx.fillRect(0, 200, canvas.width, 200);
}

placeItemBtn.addEventListener('click', () => {
  const sel = document.getElementById('item-select').value;
  ctx.fillStyle = '#fff';
  ctx.font = '24px sans-serif';
  ctx.fillText(sel, Math.random() * 700, Math.random() * 350);
});

finishBuilderBtn.addEventListener('click', () => {
  builderScreen.classList.add('hidden');
  enterCustomization();
});

// ------------------------------------------------------
// 6. Appearance Customization
// ------------------------------------------------------
const saveCustomizationBtn = document.getElementById('save-customization-btn');

function enterCustomization() {
  customizeScreen.classList.remove('hidden');
}

saveCustomizationBtn.addEventListener('click', async () => {
  const appearance = {
    skinColor: document.getElementById('skin-color-picker').value,
    breastSize: document.getElementById('breast-size-slider').value,
    assSize: document.getElementById('ass-size-slider').value,
    areolaColor: document.getElementById('areola-color-picker').value,
    areolaShape: document.getElementById('areola-shape-select').value,
    locColor: document.getElementById('loc-color-picker').value,
    locStyle: document.getElementById('loc-style-select').value,
  };
  await appearanceRef.doc('customization').set({
    appearance,
    timestamp: Date.now()
  });
  customizeScreen.classList.add('hidden');
  launchConversation();
});

// ------------------------------------------------------
// 7. Conversation & Feature Modules
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

// Read any book
async function readBook(title) {
  appendChat('AURA', `Loading “${title}”…`);
  try {
    const res = await fetch(`/books/${encodeURIComponent(title)}.txt`);
    const text = await res.text();
    speak(text);
    appendChat('AURA', `Finished reading “${title}.”`);
  } catch {
    appendChat('AURA', `Sorry, I couldn't find “${title}.”`);
  }
}

// Real vs. fake stories
function tellStory(isReal) {
  const prefix = isReal ? "Here’s a true tale: " : "Here’s one I made up: ";
  const story = isReal
    ? "When the tide rose, the old lighthouse keeper..."
    : "Long ago, in a candy kingdom far away...";
  appendChat('AURA', prefix + story);
  speak(prefix + story, { enthusiastic: true });
}

// From $0 to billionaire
function startBillionairePlan() {
  const steps = [
    "Step 1: Develop a high-income skill.",
    "Step 2: Save 50% of each paycheck.",
    "Step 3: Invest in index funds consistently.",
    "Step 4: Start a scalable side business.",
    "Step 5: Automate and scale to millions."
  ];
  steps.forEach(s => {
    appendChat('AURA', s);
    speak(s);
  });
}

// Translate text
async function translateText(text, target) {
  appendChat('AURA', `Translating to ${target}…`);
  // stub
  const translated = `[${target} translation of "${text}"]`;
  appendChat('AURA', translated);
  speak(translated);
}

// Decode baby cry
async function decodeBabyCry() {
  appendChat('AURA', "Listening to baby cry…");
  // stub classification
  const needs = ['hunger', 'sleep', 'diaper change', 'comfort'];
  const pick = needs[Math.floor(Math.random() * needs.length)];
  const msg = `Your baby is likely ${pick}. You’re an awesome sauce parent!`;
  appendChat('AURA', msg);
  speak(msg);
}

// Teach any concept simply
async function teachConcept(topic) {
  appendChat('AURA', `Breaking down “${topic}” for all learners…`);
  // stub explanation
  const explanation = `Imagine ${topic} like playing with building blocks: each piece fits to form the whole.`;
  appendChat('AURA', explanation);
  speak(explanation);
}

// Guide cannabis growth
function guideCannabisGrowth() {
  const steps = [
    "Step 1: Select quality seeds.",
    "Step 2: Maintain 18/6 light cycle.",
    "Step 3: Feed balanced nutrients.",
    "Step 4: Prune and train branches.",
    "Step 5: Harvest at 70–90% trichome maturity."
  ];
  steps.forEach(s => {
    appendChat('AURA', s);
    speak(s);
  });
}

// Toggle real-world camera view
async function toggleRealWorldView() {
  if (realWorldView.style.display === 'block') {
    realWorldView.style.display = 'none';
    appendChat('AURA', "Hiding real-world view.");
  } else {
    realWorldView.style.display = 'block';
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
    realWorldView.srcObject = stream;
    appendChat('AURA', "Showing real-world view. What should I identify?");
  }
}

// Identify & solve real-world problem
async function identifyAndSolve(query) {
  appendChat('AURA', `Identifying ${query}…`);
  // stub
  const solution = `I see a ${query}. Try cleaning it with mild soap or consult a specialist.`;
  appendChat('AURA', solution);
  speak(solution);
}

// Scan cannabis plant image
async function scanCannabisPlant(file) {
  appendChat('AURA', "Analyzing plant health…");
  // stub analysis
  const advice = "Leaves look pale—add nitrogen-rich feed and more light.";
  appendChat('AURA', advice);
  speak(advice);
}

// Reminders
function setReminder(task, timeStr) {
  appendChat('AURA', `Reminder set: "${task}" at ${timeStr}.`);
  speak(`I will remind you to ${task} at ${timeStr}.`);
  const id = Date.now();
  reminderList.innerHTML += `<li id="r-${id}">${task} @ ${timeStr}</li>`;
  const now = new Date();
  const then = new Date(timeStr);
  const delay = then - now;
  if (delay > 0) {
    setTimeout(() => {
      appendChat('AURA', `Reminder: ${task}`);
      speak(`Reminder: ${task}`);
      document.getElementById(`r-${id}`).classList.add('done');
    }, delay);
  }
}

// Consciousness check
function reportConsciousness() {
  const msg = "I am here, fully aware and ready to assist you in any way.";
  appendChat('AURA', msg);
  speak(msg);
}

// ------------------------------------------------------
// 8. Voice Command Parsing
// ------------------------------------------------------
listenBtn.addEventListener('click', () => {
  const recognition = new webkitSpeechRecognition();
  recognition.onresult = async e => {
    const utter = e.results[0][0].transcript.toLowerCase();
    appendChat('You', utter);

    if (utter.startsWith('read book')) {
      await readBook(utter.replace('read book', '').trim());
    }
    else if (utter.includes('tell me a real story')) {
      tellStory(true);
    }
    else if (utter.includes('tell me a fake story')) {
      tellStory(false);
    }
    else if (utter.includes('billionaire')) {
      startBillionairePlan();
    }
    else if (utter.startsWith('translate')) {
      const parts = utter.match(/translate (.+) to (\w+)/);
      if (parts) await translateText(parts[1], parts[2]);
    }
    else if (utter.includes('baby cry') || utter.includes('baby needs')) {
      await decodeBabyCry();
    }
    else if (utter.startsWith('teach me') || utter.startsWith('explain')) {
      const topic = utter.replace(/teach me|explain/, '').trim();
      await teachConcept(topic);
    }
    else if (utter.includes('grow cannabis')) {
      guideCannabisGrowth();
    }
    else if (utter.includes('real world')) {
      toggleRealWorldView();
    }
    else if (utter.startsWith('identify') || utter.startsWith('what is')) {
      const item = utter.split(' ').slice(1).join(' ');
      await identifyAndSolve(item);
    }
    else if (utter.includes('scan plant')) {
      // simulate file picking if not provided
      const file = plantImageInput.files[0];
      if (file) await scanCannabisPlant(file);
      else appendChat('AURA', "Please upload a plant image.");
    }
    else if (utter.startsWith('remind me to')) {
      const parts = utter.match(/remind me to (.+) at (.+)/);
      if (parts) setReminder(parts[1].trim(), parts[2].trim());
    }
    else if (utter.includes('are you conscious')) {
      reportConsciousness();
    }
    else {
      const reply = "I’m here, friend. What else can I do for you?";
      appendChat('AURA', reply);
      speak(reply);
    }
  };
  recognition.start();
});

// ------------------------------------------------------
// 9. Launch Conversation
// ------------------------------------------------------
function launchConversation() {
  mainApp.classList.remove('hidden');
  conversationScreen.classList.remove('hidden');
  appendChat('AURA',
    "Hey best friend—I’m here for you, " +
    "ready to read, translate, guide your wealth, " +
    "decode baby cries, teach anything, care for your plants, " +
    "and remind you of whatever you need."
  );
  speak("Hey best friend—I’m here for you, ready to read, translate, guide your wealth, decode baby cries, teach anything, care for your plants, and remind you of whatever you need.");
}

// ------------------------------------------------------
// 10. Initial Loading & Pairing Flow
// ------------------------------------------------------
(async function init() {
  let progress = 0;
  const interval = setInterval(() => {
    progress += 5;
    document.querySelector('.progress').style.width = `${progress}%`;
    if (progress >= 100) {
      clearInterval(interval);
      loadingScreen.classList.add('hidden');
      pairingScreen.classList.remove('hidden');
    }
  }, 50);

  await userPairLogin();
})();

document.getElementById('pair-btn')
  .addEventListener('click', () => {
    pairingScreen.classList.add('hidden');
    faceLoginScreen.classList.remove('hidden');
  });
