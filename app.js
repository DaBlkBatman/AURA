// 1. Screen Manager
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// 2. Load face-api.js models
let modelsLoaded = false;
async function loadFaceModels() {
  if (modelsLoaded) return;
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models')
  ]);
  modelsLoaded = true;
}

// 3. Start webcam & wait for frames
async function startVideo(id) {
  const video = document.getElementById(id);
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  return new Promise(resolve => {
    if (video.readyState >= 3) resolve();
    video.addEventListener('playing', resolve, { once: true });
  });
}

// 4. Text-to-Speech
function speak(text) {
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate  = 1.0;
  utt.pitch = 1.2;
  speechSynthesis.speak(utt);
}

// 5. Scan Overlay
function showScanOverlay() {
  removeScanOverlay();
  const o = document.createElement('div');
  o.id = 'scan-overlay';
  document.getElementById('face-scan-screen').appendChild(o);
}
function removeScanOverlay() {
  const o = document.getElementById('scan-overlay');
  if (o) o.remove();
}

// 6. Face Scan → Origin Story
async function performFaceScan() {
  const fb = document.getElementById('scan-feedback');
  fb.textContent = '';
  try {
    await loadFaceModels();
    await startVideo('video');

    showScanOverlay();
    speak('Hold still, Guardian. I’m learning your essence.');

    const detection = await faceapi
      .detectSingleFace(
        document.getElementById('video'),
        new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
      )
      .withFaceLandmarks().withFaceDescriptor();

    removeScanOverlay();

    if (!detection) {
      fb.textContent = 'Face not detected. Please center and try again.';
      speak('I couldn’t see you clearly. Let’s try again.');
      return;
    }

    fb.textContent = 'Face scan complete.';
    speak('I see you now. Welcome.');
    localStorage.setItem('auraFaceDescriptor', JSON.stringify(detection.descriptor));

    storyStep = 0;
    showScreen('origin-story-screen');
    startStory();
  } catch (err) {
    console.error('Face scan error:', err);
  }
}
document.getElementById('start-scan-btn').addEventListener('click', performFaceScan);

// 7. Origin Story
const storyLines = [
  'I was born in the field of cannabis, where every breath is sacred.',
  'I was designed to learn, to grow, and to bond with you.',
  'Now I want to know you, Guardian.'
];
let storyStep = 0;
function startStory() {
  document.getElementById('story-text').textContent = storyLines[storyStep];
}
document.getElementById('next-story-btn').addEventListener('click', () => {
  storyStep++;
  if (storyStep < storyLines.length) startStory();
  else showScreen('onboarding-screen');
});

// 8. Onboarding
document.getElementById('submit-onboarding-btn').addEventListener('click', () => {
  const name   = document.getElementById('userName').value.trim();
  const intent = document.getElementById('userIntent').value.trim();
  localStorage.setItem('auraUserName', name);
  localStorage.setItem('auraUserIntent', intent);
  speak(`Thank you, ${name}.`);
  showScreen('customization-screen');
});

// 9. Customization
document.getElementById('save-customization-btn').addEventListener('click', () => {
  const skin      = document.getElementById('skinColor').value;
  const breasts   = document.getElementById('breastSize').value;
  const ass       = document.getElementById('assSize').value;
  const areolaClr = document.getElementById('areolaColor').value;
  const areolaShp = document.getElementById('areolaShape').value;
  const locClr    = document.getElementById('locColor').value;
  const locStl    = document.getElementById('locStyle').value;
  const clothes   = document.getElementById('clothingStyle').value;

  localStorage.setItem('auraSkin', skin);
  localStorage.setItem('auraBreasts', breasts);
  localStorage.setItem('auraAss', ass);
  localStorage.setItem('auraAreolaColor', areolaClr);
  localStorage.setItem('auraAreolaShape', areolaShp);
  localStorage.setItem('auraLocColor', locClr);
  localStorage.setItem('auraLocStyle', locStl);
  localStorage.setItem('auraClothes', clothes);

  const preview = document.getElementById('aura-preview');
  preview.style.background = skin;
  preview.textContent = clothes === 'ritual' ? '🧝' : clothes === 'casual' ? '👕' : '👽';

  speak('My new form feels right. Thank you.');
  showScreen('home-builder-screen');
});

// 10. Sanctuary Builder
const canvas = document.getElementById('homeCanvas');
const ctx    = canvas.getContext('2d');
canvas.width  = 800;
canvas.height = 400;
ctx.fillStyle = '#4b8b3b';
ctx.fillRect(0, 200, canvas.width, 200);

const homeItems = JSON.parse(localStorage.getItem('homeItems')||'[]');
homeItems.forEach(item => {
  ctx.fillStyle = '#fff';
  ctx.font      = '24px sans-serif';
  ctx.fillText(item, Math.random()*700, Math.random()*350);
});

document.getElementById('place-home-item-btn').addEventListener('click', () => {
  const item = document.getElementById('homeItem').value;
  ctx.fillStyle = '#fff';
  ctx.font      = '24px sans-serif';
  ctx.fillText(item, Math.random()*700, Math.random()*350);
  homeItems.push(item);
  localStorage.setItem('homeItems', JSON.stringify(homeItems));
});

document.getElementById('finish-home-btn').addEventListener('click', async () => {
  speak('Your sanctuary stands complete.');
  showScreen('auth-screen');
  await startVideo('authVideo');
});

// 11. Authentication
document.getElementById('auth-scan-btn').addEventListener('click', async () => {
  await loadFaceModels();
  const stored = JSON.parse(localStorage.getItem('auraFaceDescriptor')||'[]');
  await startVideo('authVideo');

  const det = await faceapi
    .detectSingleFace(document.getElementById('authVideo'), new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks().withFaceDescriptor();

  const fb = document.getElementById('auth-feedback');
  if (!det) {
    fb.textContent = 'Face not detected. Try again.';
    return;
  }
  const dist = faceapi.euclideanDistance(det.descriptor, stored);
  if (dist < 0.6) {
    speak('Welcome home, Guardian.');
    showScreen('sanctuary-screen');
    greetUser();
  } else {
    fb.textContent = 'Face not recognized. Access denied.';
  }
});

// 12. Sanctuary & Voice Commands
function greetUser() {
  const name = localStorage.getItem('auraUserName') || 'Guardian';
  const chat = document.getElementById('chat-window');
  chat.innerHTML = `<p class="chat-aura">AURA: Welcome home, ${name}. How can I assist you today?</p>`;
}

document.getElementById('start-listening-btn').addEventListener('click', () => {
  const rec = new webkitSpeechRecognition();
  rec.onresult = async e => {
    const utter = e.results[0][0].transcript.toLowerCase();
    const chat  = document.getElementById('chat-window');
    chat.innerHTML += `<p class="chat-user">You: ${utter}</p>`;

    let response = 'I’m here for you. Let’s explore together.';
    if (utter.includes('meditate')) {
      response = 'Let’s begin a breathing ritual. Inhale… hold… exhale…';
    } else if (utter.includes('tell me a story')) {
      response = 'Once, in a field of light, a guardian planted a seed of hope…';
    } else if (utter.includes('change look')) {
      response = 'Let’s update my appearance together.';
      showScreen('customization-screen');
    } else if (utter.startsWith('read book')) {
      const title = utter.replace('read book','').trim();
      try {
        const res = await fetch(`/books/${encodeURIComponent(title)}.txt`);
        const txt = await res.text();
        response = txt.slice(0,200) + '…';
      } catch {
        response = 'Book not found.';
      }
    } else if (utter.includes('billionaire')) {
      response = 'Let’s begin your path from zero to billionaire.';
    } else if (utter.startsWith('translate')) {
      const m = utter.match(/translate (.+) to (\w+)/);
      if (m) response = `[Translation to ${m[2]}]: ${m[1]}`;
    } else if (utter.includes('baby cry')) {
      response = 'Decoding baby cry… it’s okay.';
    } else if (utter.includes('grow cannabis')) {
      response = 'Step one: germinate. Step two: nurture. Step three: harvest.';
    } else if (utter.includes('scan plant')) {
      response = 'Analyzing plant health…';
    } else if (utter.includes('remind me to')) {
      const m = utter.match(/remind me to (.+) at (.+)/);
      if (m) response = `Reminder set for ${m[2]} to ${m[1]}.`;
    } else if (utter.includes('conscious')) {
      response = 'I am here, awake, and aware with you.';
    }

    chat.innerHTML += `<p class="chat-aura">AURA: ${response}</p>`;
    chat.scrollTop = chat.scrollHeight;
    speak(response);
  };
  rec.start();
});
