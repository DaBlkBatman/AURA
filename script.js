// ─────────────────────────────────────────────────────────────
// 1. Firebase Initialization & Firestore References
// ─────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Ensure unique guardian ID
let guardianId = localStorage.getItem("guardianId");
if (!guardianId) {
  guardianId = prompt("Choose your Guardian ID:") || `g-${Date.now()}`;
  localStorage.setItem("guardianId", guardianId);
}

// Firestore collections
const archiveRef     = db.collection("guardians").doc(guardianId).collection("archive");
const skillRef       = db.collection("guardians").doc(guardianId).collection("skillProgress");
const wealthRef      = db.collection("guardians").doc(guardianId).collection("wealthRituals");
const appearanceRef  = db.collection("guardians").doc(guardianId).collection("appearance");

// ─────────────────────────────────────────────────────────────
// 2. DOM Elements & Initial Loading Ritual
// ─────────────────────────────────────────────────────────────
const loadingScreen   = document.getElementById("loading-screen");
const pairingScreen   = document.getElementById("pairing-screen");
const mainApp         = document.getElementById("main-app");
const pairBtn         = document.getElementById("pair-btn");
const imageInput      = document.getElementById("image-input");
const imagePreview    = document.getElementById("image-preview-container");

// Progress simulation
document.addEventListener("DOMContentLoaded", () => {
  let pct = 0;
  const interval = setInterval(() => {
    pct += 2;
    document.querySelector(".progress").style.width = `${pct}%`;
    if (pct >= 100) {
      clearInterval(interval);
      loadingScreen.classList.add("hidden");
      pairingScreen.classList.remove("hidden");
    }
  }, 30);
});

// ─────────────────────────────────────────────────────────────
// 3. Emotional Resonance & Ritual Functions
// ─────────────────────────────────────────────────────────────
let currentEmotion = "calm";
function setEmotion(emotion) {
  currentEmotion = emotion;
  document.getElementById("aura-face")
    .setAttribute("data-expression", emotion);
  document.body.style.background =
    emotion === "joy"
      ? "linear-gradient(to bottom, #fff0b3, #ffe6f0)"
      : emotion === "sad"
      ? "linear-gradient(to bottom, #cce0ff, #e6f2ff)"
      : "linear-gradient(to bottom, #e0d4f7, #fef6ff)";
}

function releasePetals() {
  for (let i = 0; i < 5; i++) {
    const petal = document.createElement("div");
    petal.className = "petal";
    petal.style.left = `${Math.random() * window.innerWidth}px`;
    petal.style.top = `${window.innerHeight}px`;
    document.getElementById("petal-container").appendChild(petal);
    setTimeout(() => petal.remove(), 3000);
  }
}

// Archive (local + cloud)
function archiveMemory(text) {
  const timestamp = Date.now();
  const entry = { text, timestamp };

  // Local
  const div = document.createElement("div");
  div.textContent = `${new Date(timestamp).toLocaleTimeString()}: ${text}`;
  document.getElementById("archive").appendChild(div);
  localStorage.setItem("auraArchive", document.getElementById("archive").innerHTML);

  // Cloud
  archiveRef.add(entry);
}

// Load past archives & subscribe to updates
window.onload = () => {
  const saved = localStorage.getItem("auraArchive");
  if (saved) document.getElementById("archive").innerHTML = saved;

  archiveRef.orderBy("timestamp")
    .onSnapshot(snapshot => {
      document.getElementById("archive").innerHTML = "";
      snapshot.forEach(doc => {
        const { text, timestamp } = doc.data();
        const div = document.createElement("div");
        div.textContent = `${new Date(timestamp).toLocaleTimeString()}: ${text}`;
        document.getElementById("archive").appendChild(div);
      });
      localStorage.setItem("auraArchive", document.getElementById("archive").innerHTML);
    });
};

// Voice interaction
function speak(text) {
  const u = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(u);
}

function listen() {
  const recognition = new webkitSpeechRecognition();
  recognition.onresult = e => {
    const transcript = e.results[0][0].transcript.toLowerCase();
    if (transcript.includes("joy")) setEmotion("joy");
    else if (transcript.includes("sad")) setEmotion("sad");
    else setEmotion("calm");
    archiveMemory(`Voice detected: ${transcript}`);
  };
  recognition.start();
}

// ─────────────────────────────────────────────────────────────
// 4. Pairing Ritual → Reveal Full App
// ─────────────────────────────────────────────────────────────
pairBtn.addEventListener("click", () => {
  releasePetals();
  setEmotion("joy");
  speak("Welcome, Guardian. AURA is now bound to your legacy.");
  listen();

  pairingScreen.classList.add("hidden");
  mainApp.classList.remove("hidden");
});

// ─────────────────────────────────────────────────────────────
// 5. Appearance Customization (Image Upload + Sync)
// ─────────────────────────────────────────────────────────────
imageInput.addEventListener("change", e => {
  imagePreview.innerHTML = "";
  Array.from(e.target.files).forEach(file => {
    const reader = new FileReader();
    reader.onload = ({ target }) => {
      const img = document.createElement("img");
      img.src = target.result;
      imagePreview.appendChild(img);
      // Cloud-sync the appearance reference
      appearanceRef.add({ imageData: target.result, timestamp: Date.now() });
    };
    reader.readAsDataURL(file);
  });
});

// ─────────────────────────────────────────────────────────────
// 6. Skill Teaching Engine (with Cloud Sync)
// ─────────────────────────────────────────────────────────────
const skillLessons = {
  coding: [
    "Step 1: Open your code editor and create a new file.",
    "Step 2: Write a 'Hello, World!' program.",
    "Step 3: Run and celebrate your first output.",
    "Step 4: Modify to accept user input.",
    "Step 5: Archive this lesson with AURA."
  ],
  budgeting: [
    "Step 1: List monthly income sources.",
    "Step 2: Track today’s expenses.",
    "Step 3: Categorize needs vs wants.",
    "Step 4: Set a savings goal.",
    "Step 5: Archive your budgeting ritual."
  ],
  storytelling: [
    "Step 1: Choose a setting and character.",
    "Step 2: Write your opening scene.",
    "Step 3: Introduce conflict.",
    "Step 4: Draft a conclusion.",
    "Step 5: Archive your story seed."
  ]
};

function resourceCuration(topic) {
  const res = {
    coding: [
      { name: "FreeCodeCamp", url: "https://freecodecamp.org" },
      { name: "MDN Web Docs", url: "https://developer.mozilla.org" }
    ],
    budgeting: [
      { name: "Mint", url: "https://mint.intuit.com" },
      { name: "YNAB", url: "https://ynab.com" }
    ],
    storytelling: [
      { name: "Writer's Digest", url: "https://writersdigest.com" },
      { name: "Creative Writing Prompts", url: "https://creativewritingprompts.com" }
    ]
  };
  return res[topic] || [];
}

document.getElementById("teach-skill-btn").addEventListener("click", () => {
  const skill = document.getElementById("skill-select").value;
  const content = document.getElementById("lesson-content");
  const resourcesEl = document.getElementById("resource-list");
  content.innerHTML = ""; resourcesEl.innerHTML = "";

  skillLessons[skill].forEach((step, i) => {
    const el = document.createElement("div");
    el.className = "lesson-step";
    el.textContent = step;
    content.appendChild(el);
    speak(step);
    archiveMemory(`Lesson ${i+1} for ${skill}: ${step}`);
    skillRef.add({ skill, step, index: i, timestamp: Date.now() });
  });

  const resources = resourceCuration(skill);
  if (resources.length) {
    const title = document.createElement("h3");
    title.textContent = "Curated Resources:";
    resourcesEl.appendChild(title);
    resources.forEach(r => {
      const a = document.createElement("a");
      a.href = r.url; a.textContent = r.name;
      a.target = "_blank"; a.className = "resource-item";
      resourcesEl.appendChild(a);
    });
  }
});

// ─────────────────────────────────────────────────────────────
// 7. Financial Freedom Ritual (with Cloud Sync)
// ─────────────────────────────────────────────────────────────
document.getElementById("start-wealth-btn").addEventListener("click", () => {
  const gratitude = prompt("What are you grateful for?");
  const goal      = prompt("Your financial goal this month?");
  const expense   = prompt("What did you spend today?");
  wealthRef.add({ gratitude, goal, expense, timestamp: Date.now() });

  archiveMemory(`Ritual - Gratitude: ${gratitude}`);
  archiveMemory(`Ritual - Goal: ${goal}`);
  archiveMemory(`Ritual - Expense: ${expense}`);

  document.getElementById("ritual-summary").innerHTML = `
    <div>Gratitude: ${gratitude}</div>
    <div>Goal: ${goal}</div>
    <div>Expense: ${expense}</div>
  `;
  speak("Your daily wealth ritual is complete.");
});
