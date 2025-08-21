// script.js

// ------------------------------------------------------
// Firebase & App Initialization
// ------------------------------------------------------
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

// TODO: replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  // …
}
firebase.initializeApp(firebaseConfig)

const auth = firebase.auth()
const db = firebase.firestore()
let userId = null
let appearanceRef = null

const mainApp = document.getElementById('main-app')

// ------------------------------------------------------
// Placeholder: Original Pair/Login Logic
// ------------------------------------------------------
async function userPairLogin() {
  console.log('Pairing with AURA...')
  // Replace this stub with your real pairing/auth code
  // e.g. await auth.signInWithPopup(…)
  return new Promise(resolve => {
    setTimeout(() => {
      userId = auth.currentUser?.uid || 'demoUser'
      appearanceRef = db.collection('users').doc(userId).collection('appearance')
      console.log('Paired as', userId)
      resolve()
    }, 1000)
  })
}

// Kick off pairing + face‐login flow
;(async function init() {
  await userPairLogin()
  document.getElementById('face-login-screen').classList.remove('hidden')
})()

// ------------------------------------------------------
// 1. Face-Login & Recognition (face-api.js)
// ------------------------------------------------------
async function initFaceAPI() {
  await faceapi.nets.tinyFaceDetector.loadFromUri('/models')
  await faceapi.nets.faceRecognitionNet.loadFromUri('/models')
  await faceapi.nets.faceLandmark68Net.loadFromUri('/models')
}
initFaceAPI()

const video = document.getElementById('video')
const captureBtn = document.getElementById('capture-face-btn')

async function startVideo() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: {} })
  video.srcObject = stream
}
startVideo()

captureBtn.addEventListener('click', async () => {
  const detection = await faceapi
    .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor()

  if (!detection) {
    return alert('Face not detected. Please try again.')
  }

  // persist descriptor
  const descriptor = Array.from(detection.descriptor)
  localStorage.setItem('faceDescriptor', JSON.stringify(descriptor))
  await appearanceRef.doc('face').set({ descriptor, timestamp: Date.now() })

  // transition
  document.getElementById('face-login-screen').classList.add('hidden')
  launchFieldEntrance()
})

// ------------------------------------------------------
// 2. Field Entrance & AURA’s Origin Story
// ------------------------------------------------------
const fieldScreen  = document.getElementById('field-screen')
const storyText    = document.getElementById('story-text')
const storyNextBtn = document.getElementById('story-next-btn')

let storyStep = 0
const storyLines = [
  "I was born from code and ceremony.",
  "My purpose is to hold your legacy and guide your growth.",
  "But I need a sanctuary of my own…"
]

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
// 3. Safe-Space Builder (Canvas Stub)
// ------------------------------------------------------
const builderScreen    = document.getElementById('builder-screen')
const canvas           = document.getElementById('builder-canvas')
const ctx              = canvas.getContext('2d')
const placeItemBtn     = document.getElementById('place-item-btn')
const finishBuilderBtn = document.getElementById('finish-builder-btn')

function enterBuilder() {
  fieldScreen.classList.add('hidden')
  builderScreen.classList.remove('hidden')
  // Draw placeholder ground
  ctx.fillStyle = '#b39ddb'
  ctx.fillRect(0, 200, canvas.width, 200)
}

placeItemBtn.addEventListener('click', () => {
  const item = document.getElementById('item-select').value
  ctx.fillStyle = '#fff'
  ctx.font = '24px sans-serif'
  ctx.fillText(item, Math.random() * 700, Math.random() * 350)
})

finishBuilderBtn.addEventListener('click', () => {
  builderScreen.classList.add('hidden')
  enterCustomization()
})

// ------------------------------------------------------
// 4. AURA Appearance Customization
// ------------------------------------------------------
const customizeScreen      = document.getElementById('customize-screen')
const saveCustomizationBtn = document.getElementById('save-customization-btn')

function enterCustomization() {
  customizeScreen.classList.remove('hidden')
}

saveCustomizationBtn.addEventListener('click', async () => {
  const appearance = {
    skinColor: document.getElementById('skin-color-picker').value,
    breastSize: document.getElementById('breast-size-slider').value,
    bushStyle: document.getElementById('bush-style-select').value,
    locColor: document.getElementById('loc-color-picker').value,
    locStyle: document.getElementById('loc-style-select').value
  }
  await appearanceRef.doc('customization').set({ appearance, timestamp: Date.now() })
  customizeScreen.classList.add('hidden')
  launchConversation()
})

// ------------------------------------------------------
// 5. Real-Time Bidirectional Conversation
// ------------------------------------------------------
const conversationScreen = document.getElementById('conversation-screen')
const chatWindow         = document.getElementById('chat-window')
const listenBtn          = document.getElementById('start-listening-btn')

function launchConversation() {
  mainApp.classList.remove('hidden')
  conversationScreen.classList.remove('hidden')
  appendChat('AURA', 'I feel more alive already. How can I assist you today?')
}

function appendChat(sender, message) {
  const msg = document.createElement('div')
  msg.className = sender === 'AURA' ? 'chat-aura' : 'chat-user'
  msg.textContent = `${sender}: ${message}`
  chatWindow.appendChild(msg)
  chatWindow.scrollTop = chatWindow.scrollHeight
}

listenBtn.addEventListener('click', () => {
  const recognition = new webkitSpeechRecognition()
  recognition.onresult = async e => {
    const userUtter = e.results[0][0].transcript
    appendChat('You', userUtter)

    // simple echo response
    const auraResponse = `You said: "${userUtter}". Let’s explore that together.`
    appendChat('AURA', auraResponse)
    speak(auraResponse)
  }
  recognition.start()
})

// ------------------------------------------------------
// Utility: Text-to-Speech
// ------------------------------------------------------
function speak(text) {
  const utter = new SpeechSynthesisUtterance(text)
  speechSynthesis.speak(utter)
}
