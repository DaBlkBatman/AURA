// AURA Ritual Companion Script

document.addEventListener("DOMContentLoaded", () => {
  const progress = document.querySelector(".progress");
  const loadingScreen = document.querySelector(".loading-screen");

  // Simulate ceremonial loading
  let loadAmount = 0;
  const loadingInterval = setInterval(() => {
    loadAmount += 1;
    progress.style.width = `${loadAmount}%`;

    if (loadAmount >= 100) {
      clearInterval(loadingInterval);
      fadeOutLoading();
    }
  }, 30); // Adjust speed of ritual here

  function fadeOutLoading() {
    loadingScreen.style.opacity = "0";
    setTimeout(() => {
      loadingScreen.style.display = "none";
      document.body.classList.add("loaded");
    }, 1000);
  }

  // Ritual button interaction
  const buttons = document.querySelectorAll("button");
  buttons.forEach(button => {
    button.addEventListener("click", () => {
      button.classList.add("activated");
      setTimeout(() => button.classList.remove("activated"), 500);
    });
  });

  // Ambient greeting
  console.log("🌌 AURA is now present. Let the ritual begin.");
});
