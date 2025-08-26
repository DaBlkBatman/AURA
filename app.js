// 🔮 Screen Manager
const containers = [
  'loading-screen', 'pairing-screen', 'face-login-screen',
  'field-screen', 'builder-screen', 'customize-screen',
  'conversation-screen', 'main-app'
];

function showContainer(...ids) {
  containers.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('hidden');
  });
}

// 🔐 Firebase Setup
firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID"
});
const db = firebase.firestore();
let guardianId = null;
let appearanceRef = null;

// 🌅 App Initialization
document.addEventListener('DOMContentLoaded', async () => {
  showContainer('loading-screen');
  startProgressAnimation();
  await userPairLogin();
  await initFaceAPI();
});

function startProgressAnimation() {
  const bar = document.querySelector('.progress');
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

async function userPairLogin() {
  return new Promise(res => {
    setTimeout(() => {
      guardianId = localStorage.getItem('guardianId') || `g-${Date.now()}`;
      localStorage.setItem('guardianId', guardianId);
      appearanceRef = db.collection('guardians').doc(guardianId).collection('appearance');
      res();
    }, 800);
  });
}

// 🔗 Pairing
document.getElementById('pair-btn').addEventListener('click', () => {
  showContainer('face-login-screen');
  startVideo();
});

// 🧠 Face Recognition
async function initFaceAPI() {
  await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
  await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
  await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
}

async function startVideo() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  document.getElementById('video').srcObject = stream;
}

document.getElementById('capture-face-btn').addEventListener('click', async () => {
  const detection = await faceapi
    .detectSingleFace(document.getElementById('video'), new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks().withFaceDescriptor();
  if (!detection) return alert('Face not detected.');
  await appearanceRef.doc('face').set({ descriptor: Array.from(detection.descriptor), timestamp: Date.now() });
  showContainer('field-screen');
});

// 🌾 Field Entrance
function enterSanctuary() {
  showContainer('main-app');
  launchConversation();
}

// 🎨 Appearance Upload
function uploadAppearance() {
  const file = document.getElementById('imageInput').files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    appearanceRef.doc('photo').set({ image: reader.result, timestamp: Date.now() });
  };
  reader.readAsDataURL(file);
}

// 🧠 Memory Archiving
function archiveMemory() {
  const text = document.getElementById('memoryInput').value;
  if (!text) return;
  db.collection('guardians').doc(guardianId).collection('memories').add({
    text, timestamp: Date.now()
  });
}

// 📚 Book Reading
async function readBook() {
  const title = document.getElementById('bookTitle').value.trim();
  if (!title) return;
  try {
    const res = await fetch(`/books/${encodeURIComponent(title)}.txt`);
    const text = await res.text();
    document.getElementById('book-content').textContent = text.slice(0, 1000);
    speak(text.slice(0, 500));
  } catch {
    document.getElementById('book-content').textContent = "Book not found.";
  }
}

// 🌱 Plant Scanning
function scanPlant() {
  const file = document.getElementById('plant-image-input').files[0];
  if (!file) return;
  document.getElementById('plant-result').textContent = "Analyzing plant… (stub)";
  // Future: ML model integration
}

// 📷 Real-World View
navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
  document.getElementById('real-world-view').srcObject = stream;
});

// 🧠 Reminder System
function addReminder() {
  const text = document.getElementById('reminderInput').value;
  if (!text) return;
  const li = document.createElement('li');
  li.textContent = text;
  document.getElementById('reminder-list').appendChild(li);
  db.collection('guardians').doc(guardianId).collection('reminders').add({
    text, timestamp: Date.now()
  });
}

// 🗣️ Voice Personality
function getVoiceOptions() {
  const choice = document.getElementById('voiceSelect').value;
  if (choice === 'warm') return { rate: 1.0, pitch: 1.1 };
  if (choice === 'enthusiastic') return { rate: 1.2, pitch: 1.3 };
  return { rate: 0.9, pitch: 1.0 };
}

// 💬 Conversation
function launchConversation() {
  const welcome = "Hey best friend—I’m here for you, ready to read, translate, guide your wealth, decode baby cries, teach anything, care for your plants, and remind you of whatever you need.";
  appendChat('AURA', welcome);
  speak(welcome);
}

function appendChat(sender, text) {
  const div = document.createElement('div');
  div.className = sender === 'AURA' ? 'chat-aura' : 'chat-user';
  div.textContent = `${sender}: ${text}`;
  document.getElementById('chat-window').appendChild(div);
}

function speak(text) {
  const utter = new SpeechSynthesisUtterance(text);
  const opts = getVoiceOptions();
  utter.rate = opts.rate;
  utter.pitch = opts.pitch;
  speechSynthesis.speak(utter);
}

document.getElementById('start-listening-btn').addEventListener('click', () => {
  const recog = new webkitSpeechRecognition();
  recog.onresult = e => {
    const utter = e.results[0][0].transcript;
    appendChat('You', utter);
    speak(`You said: ${utter}`);
  };
  recog.start();
});
