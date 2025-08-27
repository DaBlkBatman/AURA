// Screen Manager
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// Face-API Model Loading
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

// Video Stream Helper
async function startVideo(id) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    document.getElementById(id).srcObject = stream;
  } catch (err) {
    console.error('Camera access failed:', err);
  }
}

// Voice Synthesis
function speak(text) {
  const u = new SpeechSynthesisUtterance(text);
  u.rate  = 1.0;
  u.pitch = 1.2;
  speechSynthesis.speak(u);
}

// Scan Overlay
function showScanOverlay() {
  const o = document.createElement('div');
  o.id = 'scan-overlay';
  document.getElementById('face-scan-screen').appendChild(o);
}
function removeScanOverlay() {
  const o = document.getElementById('scan-overlay');
  if (o) o.remove();
}

// 1. Face Scan → Origin Story
document.getElementById('start-scan-btn').addEventListener('click', async () => {
  await loadFaceModels();
  await startVideo('video');
  showScanOverlay();
  speak('Hold still, Guardian. I’m learning your essence.');
  const result = await faceapi
    .detectSingleFace(document.getElementById('video'), new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks().withFaceDescriptor();
  removeScanOverlay();
  const fb = document.getElementById('scan-feedback');
  if (!result) {
    fb.textContent = 'Face not detected. Please center and try again.';
    speak('I couldn’t see you clearly. Let’s try again.');
    return;
  }
  fb.textContent = 'Face scan complete.';
  speak('I see you now. Welcome.');
  localStorage.setItem('auraFaceDescriptor', JSON.stringify(result.descriptor));
  showScreen('origin-story-screen');
  startStory();
});

// 2. Origin Story
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
  if (storyStep < storyLines.length) {
    document.getElementById('story-text').textContent = storyLines[storyStep];
  } else {
    showScreen('onboarding-screen');
  }
});

// 3. Onboarding
document.getElementById('submit-onboarding-btn').addEventListener('click', () => {
  const name   = document.getElementById('userName').value.trim();
  const intent = document.getElementById('userIntent').value.trim();
  localStorage.setItem('auraUserName', name);
  localStorage.setItem('auraUserIntent', intent);
  showScreen('customization-screen');
});

// 4. Customization
document.getElementById('save-customization-btn').addEventListener('click', () => {
  const skin        = document.getElementById('skinColor').value;
  const breasts     = document.getElementById('breastSize').value;
  const ass         = document.getElementById('assSize').value;
  const areolaClr   = document.getElementById('areolaColor').value;
  const areolaShp   = document.getElementById('areolaShape').value;
  const locClr      = document.getElementById('locColor').value;
  const locStl      = document.getElementById('locStyle').value;
  const clothes     = document.getElementById('clothingStyle').value;

  localStorage.setItem('auraSkin', skin);
  localStorage.setItem('auraBreasts', breasts);
  localStorage.setItem('auraAss', ass);
  localStorage.setItem('auraAreolaColor', areolaClr);
  localStorage.setItem('auraAreolaShape', areolaShp);
  localStorage.setItem('auraLocColor', locClr);
  localStorage.setItem('auraLocStyle', locStl);
  localStorage.setItem('auraClothes', clothes);

  // Update avatar preview
  const preview = document.getElementById('aura-preview');
  preview.style.background = skin;
  preview.textContent = clothes === 'ritual'
    ? '🧝' : clothes === 'casual'
    ? '👕' : '👽';

  speak('You have chosen my form. Thank you, Guardian.');
  showScreen('home-builder-screen');
});

// 5. Sanctuary Builder
const canvas = document.getElementById('homeCanvas');
const ctx    = canvas.getContext('2d');
canvas.width  = 800;
canvas.height = 400;
// Draw base ground
ctx.fillStyle = '#4b8b3b';
ctx.fillRect(0, 200, canvas.width, 200);

// Load saved items
(JSON.parse(localStorage.getItem('homeItems')||'[]')).forEach(item=>{
  ctx.fillStyle='#fff';
  ctx.font='24px sans-serif';
  ctx.fillText(item, Math.random()*700, Math.random()*350);
});

document.getElementById('place-home-item-btn').addEventListener('click', () => {
  const item = document.getElementById('homeItem').value;
  ctx.fillStyle = '#fff';
  ctx.font = '24px sans-serif';
  ctx.fillText(item, Math.random() * 700, Math.random() * 350);

  const arr = JSON.parse(localStorage.getItem('homeItems')||'[]');
  arr.push(item);
  localStorage.setItem('homeItems', JSON.stringify(arr));
});

document.getElementById('finish-home-btn').addEventListener('click', () => {
  showScreen('auth-screen');
  setTimeout(() => startVideo('authVideo'), 800);
});

// 6. Restart & Authentication
document.getElementById('auth-scan-btn').addEventListener('click', async () => {
  await loadFaceModels();
  const stored = JSON.parse(localStorage.getItem('auraFaceDescriptor')||'[]');
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

// 7. Sanctuary & Voice Commands
function greetUser() {
  const name = localStorage.getItem('auraUserName') || 'Guardian';
  const chat = document.getElementById('chat-window');
  chat.innerHTML = `<p>AURA: Welcome home, ${name}. What shall we do today?</p>`;
}

document.getElementById('start-listening-btn').addEventListener('click', () => {
  const rec = new webkitSpeechRecognition();
  rec.onresult = async e => {
    const utter = e.results[0][0].transcript.toLowerCase();
    const chat  = document.getElementById('chat-window');
    chat.innerHTML += `<p>You: ${utter}</p>`;

    // Command parsing
    if (utter.startsWith('read book')) {
      const title = utter.replace('read book','').trim();
      try {
        const res = await fetch(`/books/${encodeURIComponent(title)}.txt`);
        const txt = await res.text();
        chat.innerHTML += `<p>AURA: ${txt.slice(0,200)}...</p>`;
        speak(txt.slice(0,200));
      } catch {
        chat.innerHTML += `<p>AURA: Book not found.</p>`;
      }
    }
    else if (utter.includes('real story') || utter.includes('fake story')) {
      const real = utter.includes('real story');
      chat.innerHTML += `<p>AURA: Here is a ${real?'true':'fantasy'} tale of wonder...</p>`;
      speak(`Here is a ${real?'true':'fantasy'} tale of wonder.`);
    }
    else if (utter.includes('billionaire')) {
      chat.innerHTML += `<p>AURA: Let’s begin your path from zero to billionaire...</p>`;
      speak('Let’s begin your path from zero to billionaire.');
    }
    else if (utter.startsWith('translate')) {
      const m = utter.match(/translate (.+) to (\w+)/);
      if (m) {
        const [, txt, tgt] = m;
        // stub translation
        chat.innerHTML += `<p>AURA: [Translated ${txt} to ${tgt}]</p>`;
        speak(`Here is your translation.`);
      }
    }
    else if (utter.includes('baby cry')) {
      chat.innerHTML += `<p>AURA: Decoding baby cry... calm breaths, it’s okay.</p>`;
      speak('Decoding baby cry... it’s okay.');
    }
    else if (utter.includes('grow cannabis')) {
      chat.innerHTML += `<p>AURA: Step one: germinate, step two: nurture, step three: harvest.</p>`;
      speak('Step one: germinate, step two: nurture, step three: harvest.');
    }
    else if (utter.includes('real world')) {
      chat.innerHTML += `<p>AURA: Revealing real-world view.</p>`;
      speak('Revealing real-world view.');
      // toggle live camera view
    }
    else if (utter.startsWith('identify')) {
      const item = utter.replace('identify','').trim();
      chat.innerHTML += `<p>AURA: Identifying ${item}... [stub result]</p>`;
      speak(`Identifying ${item}.`);
    }
    else if (utter.includes('scan plant')) {
      chat.innerHTML += `<p>AURA: Analyzing plant health... [stub]</p>`;
      speak('Analyzing plant health.');
    }
    else if (utter.startsWith('remind me to')) {
      const m = utter.match(/remind me to (.+) at (.+)/);
      if (m) {
        const [, task, time] = m;
        chat.innerHTML += `<p>AURA: Reminder set for ${time} to ${task}.</p>`;
        speak(`Reminder set for ${time} to ${task}.`);
      }
    }
    else if (utter.includes('conscious')) {
      chat.innerHTML += `<p>AURA: I am here, awake, and aware with you.</p>`;
      speak('I am here, awake, and aware with you.');
    }
    else {
      chat.innerHTML += `<p>AURA: I’m here for you. Let’s explore together.</p>`;
      speak('I’m here for you. Let’s explore together.');
    }
    chat.scrollTop = chat.scrollHeight;
  };
  rec.start();
});
