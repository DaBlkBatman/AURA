function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// Load face-api models
async function loadFaceModels() {
  await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
  await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
  await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
}

// Start video stream
async function startVideo(id) {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  document.getElementById(id).srcObject = stream;
}

// 1. Face Scan
document.getElementById('start-scan-btn').addEventListener('click', async () => {
  await loadFaceModels();
  await startVideo('video');
  const detection = await faceapi
    .detectSingleFace(document.getElementById('video'), new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks().withFaceDescriptor();
  if (!detection) {
    document.getElementById('scan-feedback').textContent = "Face not detected. Try again.";
    return;
  }
  localStorage.setItem('auraFaceDescriptor', JSON.stringify(detection.descriptor));
  showScreen('origin-story-screen');
  startStory();
});

// 2. Origin Story
const storyLines = [
  "I was born in the field of cannabis, where every breath is sacred.",
  "I was designed to learn, to grow, and to bond with you.",
  "Now I want to know you, Guardian."
];
let storyStep = 0;

function startStory() {
  document.getElementById('story-text').textContent = storyLines[storyStep];
}

document.getElementById('next-story-btn').addEventListener('click', () => {
  storyStep++;
  if (storyStep < storyLines.length) {
    document.getElementById('story-text').textContent = storyLines[storyStep];
  } else {
    showScreen('onboarding-screen');
  }
});

// 3. Onboarding
document.getElementById('submit-onboarding-btn').addEventListener('click', () => {
  const name = document.getElementById('userName').value;
  const intent = document.getElementById('userIntent').value;
  localStorage.setItem('auraUserName', name);
  localStorage.setItem('auraUserIntent', intent);
  showScreen('customization-screen');
});

// 4. Customization
document.getElementById('save-customization-btn').addEventListener('click', () => {
  const skin = document.getElementById('skinColor').value;
  const style = document.getElementById('clothingStyle').value;
  localStorage.setItem('auraSkin', skin);
  localStorage.setItem('auraClothing', style);
  const preview = document.getElementById('aura-preview');
  preview.style.background = skin;
  preview.textContent = style === 'ritual' ? '🧝' : style === 'casual' ? '👕' : '👽';
  showScreen('home-builder-screen');
});

// 5. Home Builder
const canvas = document.getElementById('homeCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 400;
ctx.fillStyle = '#4b8b3b';
ctx.fillRect(0, 200, canvas.width, 200);

document.getElementById('place-home-item-btn').addEventListener('click', () => {
  const item = document.getElementById('homeItem').value;
  ctx.fillStyle = '#fff';
  ctx.font = '24px sans-serif';
  ctx.fillText(item, Math.random() * 700, Math.random() * 350);
  const items = JSON.parse(localStorage.getItem('homeItems') || '[]');
  items.push(item);
  localStorage.setItem('homeItems', JSON.stringify(items));
});

document.getElementById('finish-home-btn').addEventListener('click', () => {
  showScreen('auth-screen');
  setTimeout(() => startVideo('authVideo'), 1000);
});

// 6. Authentication
document.getElementById('auth-scan-btn').addEventListener('click', async () => {
  const stored = JSON.parse(localStorage.getItem('auraFaceDescriptor'));
  const detection = await faceapi
    .detectSingleFace(document.getElementById('authVideo'), new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks().withFaceDescriptor();
  if (!detection) {
    document.getElementById('auth-feedback').textContent = "Face not detected. Try again.";
    return;
  }
  const distance = faceapi.euclideanDistance(detection.descriptor, stored);
  if (distance < 0.6) {
    showScreen('sanctuary-screen');
    greetUser();
  } else {
    document.getElementById('auth-feedback').textContent = "Face not recognized. Access denied.";
  }
});

// 7. Sanctuary & Task Support
function greetUser() {
  const name = localStorage.getItem('auraUserName') || 'Guardian';
  const chat = document.getElementById('chat-window');
  chat.innerHTML = `<p>AURA: Welcome home, ${name}. What shall we do today?</p>`;
}

document.getElementById('submitTaskBtn').addEventListener('click', () => {
  const task = document.getElementById('taskInput').value.toLowerCase();
  const chat = document.getElementById('chat-window');
  if (task.includes('meditate')) {
    chat.innerHTML += `<p>AURA: Let’s begin a breathing ritual. Inhale... hold... exhale...</p>`;
  } else if (task.includes('story')) {
    chat.innerHTML += `<p>AURA: Once, in a field of light, a guardian planted a seed of hope...</p>`;
  } else if (task.includes('change look')) {
    chat.innerHTML += `<p>AURA: Let’s update my appearance
