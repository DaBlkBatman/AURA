function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// 1. Face Scan
document.getElementById('start-scan-btn').addEventListener('click', async () => {
  showScreen('origin-story-screen');
  startVideo('video');
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

// 3. Onboarding Questions
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

document.getElementById('place-home-item-btn').addEventListener('click', () => {
  const item = document.getElementById('homeItem').value;
  ctx.fillStyle = '#fff';
  ctx.font = '24px sans-serif';
  ctx.fillText(item, Math.random() * 700, Math.random() * 350);
});

document.getElementById('finish-home-btn').addEventListener('click', () => {
  showScreen('auth-screen');
  startVideo('authVideo');
});

// 6. Authentication
document.getElementById('auth-scan-btn').addEventListener('click', () => {
  // Simulate face match
  setTimeout(() => {
    showScreen('sanctuary-screen');
    greetUser();
  }, 1500);
});

// 7. Sanctuary & Task Support
function greetUser() {
  const name = localStorage.getItem('auraUserName') || 'Guardian';
  const chat = document.getElementById('chat-window');
  chat.innerHTML = `<p>AURA: Welcome home, ${name}. What shall we do today?</p>`;
}

document.getElementById('submitTaskBtn').addEventListener('click', () => {
  const task = document.getElementById('taskInput').value;
  const chat = document.get
