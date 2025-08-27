function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// 1. Face Scan
document.getElementById('start-scan-btn').addEventListener('click', async () => {
  await startVideo('video');
  await loadFaceModels();
  const detection = await faceapi
    .detectSingleFace(document.getElementById('video'), new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks().withFaceDescriptor();
  if (!detection) return alert('Face not detected.');
  localStorage.setItem('auraFaceDescriptor', JSON.stringify(detection.descriptor));
  showScreen('origin-story-screen');
  startStory();
});

async function loadFaceModels() {
  await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
  await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
  await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
}

async function startVideo(id) {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  document.getElementById(id).srcObject = stream;
}

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
});

document.getElementById('finish-home-btn').addEventListener('click', async () => {
 
