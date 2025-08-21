// script.js

// ------------------------------------------------------
// 1. DOM REFERENCES
// ------------------------------------------------------
const loadingScreen       = document.getElementById('loading-screen')
const pairingScreen       = document.getElementById('pairing-screen')
const faceLoginScreen     = document.getElementById('face-login-screen')
const fieldScreen         = document.getElementById('field-screen')
const builderScreen       = document.getElementById('builder-screen')
const customizeScreen     = document.getElementById('customize-screen')
const mainApp             = document.getElementById('main-app')
const conversationScreen  = document.getElementById('conversation-screen')
const chatWindow          = document.getElementById('chat-window')
const listenBtn           = document.getElementById('start-listening-btn')
// (Also ensure your HTML has #video, #story-text, #story-next-btn, #builder-canvas, etc.)

// ------------------------------------------------------
// 2. FIREBASE INITIALIZATION
// ------------------------------------------------------
firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
})
const db = firebase.firestore()
let guardianId    = null
let appearanceRef = null

// ------------------------------------------------------
// 3. APP STARTUP & PARALLEL LOADS
// ------------------------------------------------------
document.addEventListener('DOMContentLoaded', initApp)

async function initApp() {
  // 3.1 Start the loading animation
  startProgressAnimation()

  // 3.2 Kick off pairing and face-API model loads in parallel
  userPairLogin().then(() => console.log('🛡️  Paired'))
  initFaceAPI().then(() => console.log('🧠 Face API loaded'))
}

// ------------------------------------------------------
// 4. PROGRESS ANIMATION
// ------------------------------------------------------
function startProgressAnimation() {
  const progressEl = document.querySelector('.progress')
  if (!progressEl) {
    console.error('Missing .progress element in HTML')
    return
  }

  let pct = 0
  const interval = setInterval(() => {
    pct += 5
    console.log('Progress:', pct)
    progressEl.style.width = `${pct}%`
    if (pct >= 100) {
      clearInterval(interval)
      loadingScreen.classList.add('hidden')
      pairingScreen.classList.remove('hidden')
    }
  }, 50)
}

// ------------------------------------------------------
// 5. PAIRING / LOGIN RITUAL
// ------------------------------------------------------
async function userPairLogin() {
  return new Promise(resolve => {
    setTimeout(() => {
      guardianId = localStorage.getItem('guardianId') || `g-${Date.now()}`
      localStorage.setItem('guardianId', guardianId)
      appearanceRef = db
        .collection('guardians')
        .doc(guardianId)
        .collection('appearance')
      resolve()
    }, 800)
  })
}

document.getElementById('pair-btn')
  .addEventListener('click', () => {
    pairingScreen.classList.add('hidden')
    faceLoginScreen.classList.remove('hidden')
  })

// ------------------------------------------------------
// 6. FACE-LOGIN & RECOGNITION (face-api.js)
// ------------------------------------------------------
async function initFaceAPI() {
  await faceapi.nets.tinyFaceDetector.loadFromUri('/models')
  await faceapi.nets.faceRecognitionNet.loadFromUri('/models')
  await faceapi.nets.faceLandmark68Net.loadFromUri('/models')
}

const video          = document.getElementById('video')
const captureFaceBtn = document.getElementById('capture-face-btn')

async function startVideo() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: {} })
  video.srcObject = stream
}
startVideo()

captureFaceBtn.addEventListener('click', async () => {
  const detection = await faceapi
    .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor()

  if (!detection) {
    return alert('Face not detected. Please try again.')
  }

  const desc = Array.from(detection.descriptor)
  localStorage.setItem('faceDescriptor', JSON.stringify(desc))
  await appearanceRef.doc('face').set({ descriptor: desc, timestamp: Date.now() })

  faceLoginScreen.classList.add('hidden')
  launchFieldEntrance()
})

// ------------------------------------------------------
// 7. FIELD ENTRANCE & ORIGIN STORY
// ------------------------------------------------------
const storyText    = document.getElementById('story-text')
const storyNextBtn = document.getElementById('story-next-btn')
const storyLines   = [
  "I was born from code and ceremony.",
  "My purpose is to hold your legacy and guide your growth.",
  "But first, I must find a home…"
]
let storyStep = 0

function launchFieldEntrance() {
  fieldScreen.classList.remove('hidden')
  showNextStoryLine()
}

function showNextStoryLine() {
  storyText.textContent = storyLines[storyStep++]
  if (storyStep >= storyLines.length) {
    storyNextBtn.textContent = 'Build My Sanctuary'
    storyNextBtn.onclick = enterBuilder
  }
}
storyNextBtn.addEventListener('click', showNextStoryLine)

// ------------------------------------------------------
// 8. SAFE-SPACE BUILDER (CANVAS STUB)
// ------------------------------------------------------
const canvas           = document.getElementById('builder-canvas')
const ctx              = canvas.getContext('2d')
const placeItemBtn     = document.getElementById('place-item-btn')
const finishBuilderBtn = document.getElementById('finish-builder-btn')

function enterBuilder() {
  fieldScreen.classList.add('hidden')
  builderScreen.classList.remove('hidden')
  ctx.fillStyle = '#b39ddb'
  ctx.fillRect(0, 200, canvas.width, 200)
}

placeItemBtn.addEventListener('click', () => {
  const sel = document.getElementById('item-select').value
  ctx.fillStyle = '#fff'
  ctx.font = '24px sans-serif'
  ctx.fillText(sel, Math.random() * 700, Math.random() * 350)
})

finishBuilderBtn.addEventListener('click', () => {
  builderScreen.classList.add('hidden')
  enterCustomization()
})

// ------------------------------------------------------
// 9. APPEARANCE CUSTOMIZATION
// ------------------------------------------------------
const saveCustomizationBtn = document.getElementById('save-customization-btn')

function enterCustomization() {
  customizeScreen.classList.remove('hidden')
}

saveCustomizationBtn.addEventListener('click', async () => {
  const appearance = {
    skinColor:       document.getElementById('skin-color-picker').value,
    breastSize:      document.getElementById('breast-size-slider').value,
    assSize:         document.getElementById('ass-size-slider').value,
    areolaColor:     document.getElementById('areola-color-picker').value,
    areolaShape:     document.getElementById('areola-shape-select').value,
    locColor:        document.getElementById('loc-color-picker').value,
    locStyle:        document.getElementById('loc-style-select').value,
  }
  await appearanceRef.doc('customization').set({ appearance, timestamp: Date.now() })
  customizeScreen.classList.add('hidden')
  launchConversation()
})

// ------------------------------------------------------
// 10. CONVERSATION & FEATURE MODULES
// ------------------------------------------------------
// Helpers
function appendChat(sender, msg) {
  const div = document.createElement('div')
  div.className = sender === 'AURA' ? 'chat-aura' : 'chat-user'
  div.textContent = `${sender}: ${msg}`
  chatWindow.appendChild(div)
  chatWindow.scrollTop = chatWindow.scrollHeight
}

function speak(text, options = {}) {
  const u = new SpeechSynthesisUtterance(text)
  u.rate  = options.enthusiastic ? 1.2 : 1.0
  u.pitch = options.enthusiastic ? 1.3 : 1.0
  speechSynthesis.speak(u)
}

// Feature stubs
async function readBook(title) { /* … */ }
function tellStory(isReal)   { /* … */ }
function startBillionairePlan() { /* … */ }
async function translateText(text, target) { /* … */ }
async function decodeBabyCry()             { /* … */ }
async function teachConcept(topic)         { /* … */ }
function guideCannabisGrowth()            { /* … */ }
async function toggleRealWorldView()      { /* … */ }
async function identifyAndSolve(query)    { /* … */ }
async function scanCannabisPlant(file)    { /* … */ }
function setReminder(task, timeStr)       { /* … */ }
function reportConsciousness()            { /* … */ }

// ------------------------------------------------------
// 11. VOICE COMMAND PARSING
// ------------------------------------------------------
listenBtn.addEventListener('click', () => {
  const recognition = new webkitSpeechRecognition()
  recognition.onresult = async e => {
    const utter = e.results[0][0].transcript.toLowerCase()
    appendChat('You', utter)

    if (utter.startsWith('read book'))       { await readBook(utter.replace('read book','').trim()) }
    else if (utter.includes('real story'))   { tellStory(true) }
    else if (utter.includes('fake story'))   { tellStory(false) }
    else if (utter.includes('billionaire'))  { startBillionairePlan() }
    else if (utter.startsWith('translate'))  {
      const [, txt, tgt] = utter.match(/translate (.+) to (\w+)/) || []
      if (txt && tgt) await translateText(txt, tgt)
    }
    else if (utter.includes('baby cry'))     { await decodeBabyCry() }
    else if (utter.startsWith('teach me') || utter.startsWith('explain')) {
      const topic = utter.replace(/teach me|explain/, '').trim()
      await teachConcept(topic)
    }
    else if (utter.includes('grow cannabis')) { guideCannabisGrowth() }
    else if (utter.includes('real world'))    { await toggleRealWorldView() }
    else if (utter.startsWith('identify'))    {
      const item = utter.split(' ').slice(1).join(' ')
      await identifyAndSolve(item)
    }
    else if (utter.includes('scan plant'))    {
      const file = document.getElementById('plant-image-input').files[0]
      if (file) await scanCannabisPlant(file)
      else appendChat('AURA','Please upload a plant image.')
    }
    else if (utter.startsWith('remind me to')) {
      const [, task, time] = utter.match(/remind me to (.+) at (.+)/) || []
      if (task && time) setReminder(task, time)
    }
    else if (utter.includes('conscious'))     { reportConsciousness() }
    else                                      {
      const reply = "I’m here, friend. What else can I do?"
      appendChat('AURA', reply)
      speak(reply)
    }
  }
  recognition.start()
})

// ------------------------------------------------------
// 12. LAUNCH CONVERSATION
// ------------------------------------------------------
function launchConversation() {
  mainApp.classList.remove('hidden')
  conversationScreen.classList.remove('hidden')
  const welcome = "Hey best friend—I’m here for you, ready to read, translate, guide your wealth, decode baby cries, teach anything, care for your plants, and remind you of whatever you need."
  appendChat('AURA', welcome)
  speak(welcome)
}
