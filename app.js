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
  document.getElementById('aura-preview').style.background = skin;
  showScreen('home-builder-screen');
});

// 5. Home
