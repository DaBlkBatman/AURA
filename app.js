// Face Authentication
document.getElementById('auth-scan-btn').addEventListener('click', async () => {
  await startVideo('authVideo');
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

// Canvas Persistence
document.getElementById('place-home-item-btn').addEventListener('click', () => {
  const item = document.getElementById('homeItem').value;
  ctx.fillText(item, Math.random() * 700, Math.random() * 350);
  const items = JSON.parse(localStorage.getItem('homeItems') || '[]');
  items.push(item);
  localStorage.setItem('homeItems', JSON.stringify(items));
});

// Avatar Preview
document.getElementById('clothingStyle').addEventListener('change', () => {
  const style = document.getElementById('clothingStyle').value;
  const preview = document.getElementById('aura-preview');
  preview.textContent = style === 'ritual' ? '🧝' : style === 'casual' ? '👕' : '👽';
});

// Voice Command Parser
document.getElementById('submitTaskBtn').addEventListener('click', () => {
  const task = document.getElementById('taskInput').value.toLowerCase();
  const chat = document.getElementById('chat-window');
  if (task.includes('meditate')) {
    chat.innerHTML += `<p>AURA: Let’s begin a breathing ritual. Inhale... hold... exhale...</p>`;
  } else if (task.includes('story')) {
    chat.innerHTML += `<p>AURA: Once, in a field of light, a guardian planted a seed of hope...</p>`;
  } else if (task.includes('change look')) {
    chat.innerHTML += `<p>AURA: Let’s update my appearance together.</p>`;
    showScreen('customization-screen');
  } else {
    chat.innerHTML += `<p>AURA: I’m here for you. Let’s figure this out together.</p>`;
  }
});
