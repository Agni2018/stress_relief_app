// ------------------- EXISTING SELECTORS -------------------
const circle = document.getElementById("breathingCircle");
const phaseText = document.getElementById("phaseText");
const startBtn = document.getElementById("startBtn");
const bgMusic = document.getElementById("bgMusic");
const logoutBtn = document.getElementById("logoutBtn");
const timerInput = document.getElementById("timerInput");
const toggleMusicBtn = document.getElementById("toggleMusicBtn");
const musicSelect = document.getElementById("musicSelect");

// ------------------- MINI GAME SELECTORS -------------------
const openGameBtn = document.getElementById("openGameBtn");
const gameModal = document.getElementById("gameModal");
const closeModal = document.getElementById("closeModal");
const gameArea = document.getElementById("gameArea");
const startGameBtn = document.getElementById("startGameBtn");
const scoreText = document.getElementById("scoreText");

let isRunning = false;
let breathingInterval;
let timerTimeout;

// ---------------- SESSION CHECK ----------------
async function checkSession() {
  try {
    const res = await fetch("/api/auth/session");
    const data = await res.json();
    if (!data.loggedIn) window.location.href = "/index.html";
  } catch (e) {
    console.warn("Session check skipped.");
  }
}
checkSession();

// ✅ Add listener to handle browser back/forward buttons
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    checkSession();
  }
});

// ---------------- LOGOUT ----------------
logoutBtn.addEventListener("click", async () => {
  await fetch("/api/auth/logout", { method: "POST" });
  window.location.href = "/index.html";
});

// ---------------- BREATHING ANIMATION ----------------
function startBreathing() {
  if (isRunning) return;

  const duration = parseInt(timerInput.value) * 60 * 1000;
  if (isNaN(duration) || duration <= 0) {
    alert("Please enter a valid duration in minutes.");
    return;
  }

  isRunning = true;
  startBtn.disabled = true;
  phaseText.textContent = "Inhale... 🌬️";

  let phase = "inhale";
  let cycle = 0;

  breathingInterval = setInterval(() => {
    if (phase === "inhale") {
      circle.classList.add("inhale");
      circle.classList.remove("exhale");
      phaseText.textContent = "Inhale... 🌿";
      phase = "hold";
    } else if (phase === "hold") {
      circle.classList.remove("inhale");
      phaseText.textContent = "Hold... 🕊️";
      phase = "exhale";
    } else {
      circle.classList.add("exhale");
      circle.classList.remove("inhale");
      phaseText.textContent = "Exhale... 😌";
      phase = "inhale";
      cycle++;
    }
  }, 4000);

  timerTimeout = setTimeout(() => {
    clearInterval(breathingInterval);
    bgMusic.pause();
    bgMusic.currentTime = 0;
    circle.classList.remove("inhale", "exhale");
    phaseText.textContent = "Session Complete 🌸";
    startBtn.disabled = false;
    isRunning = false;
  }, duration);
}

// ---------------- MUSIC TOGGLE ----------------
toggleMusicBtn.addEventListener("click", async () => {
  if (bgMusic.paused) {
    try {
      bgMusic.volume = 0.5;
      await bgMusic.play();
      toggleMusicBtn.textContent = "🔇 Music Off";
    } catch (err) {
      alert("Browser blocked autoplay. Please click again to start music.");
    }
  } else {
    bgMusic.pause();
    toggleMusicBtn.textContent = "🔊 Music On";
  }
});

// ---------------- MUSIC SELECTION ----------------
musicSelect.addEventListener("change", () => {
  const selectedTrack = musicSelect.value;
  bgMusic.src = selectedTrack;
  bgMusic.currentTime = 0;

  if (!bgMusic.paused) bgMusic.play();
});

startBtn.addEventListener("click", startBreathing);

// ---------------- MINI-GAME LOGIC ----------------
// ---------------- MINI-GAME LOGIC ----------------
openGameBtn.addEventListener("click", () => {
  gameModal.style.display = "flex";
  document.getElementById("timeLeft").textContent = "Time Left: 15s";
});
closeModal.addEventListener("click", () => {
  gameModal.style.display = "none";
  clearGame();
});
window.addEventListener("click", (e) => {
  if (e.target === gameModal) {
    gameModal.style.display = "none";
    clearGame();
  }
});

let score = 0;
let dotTimeout;
let gameTimer;
let timeLeft = 15;
let gameActive = false;

function startGame() {
  if (gameActive) return;
  gameActive = true;
  score = 0;
  timeLeft = 15;
  scoreText.textContent = "Score: 0";
  startGameBtn.disabled = true;
  document.getElementById("timeLeft").textContent = `Time Left: ${timeLeft}s`;

  spawnDot();

  // countdown timer
  gameTimer = setInterval(() => {
    timeLeft--;
    document.getElementById("timeLeft").textContent = `Time Left: ${timeLeft}s`;
    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

function spawnDot() {
  gameArea.innerHTML = "";
  const dot = document.createElement("div");
  dot.classList.add("dot");

  const x = Math.random() * (gameArea.clientWidth - 30);
  const y = Math.random() * (gameArea.clientHeight - 30);
  dot.style.left = `${x}px`;
  dot.style.top = `${y}px`;

  dot.addEventListener("click", () => {
    if (!gameActive) return;
    score++;
    scoreText.textContent = `Score: ${score}`;
    spawnDot();
  });

  gameArea.appendChild(dot);
}

function endGame() {
  gameActive = false;
  clearInterval(gameTimer);
  gameArea.innerHTML = "";
  scoreText.textContent += " | ⏳ Time’s up!";
  startGameBtn.disabled = false;
}

function clearGame() {
  gameActive = false;
  clearInterval(gameTimer);
  clearTimeout(dotTimeout);
  gameArea.innerHTML = "";
  scoreText.textContent = "Score: 0";
  startGameBtn.disabled = false;
  document.getElementById("timeLeft").textContent = "Time Left: 15s";
}

startGameBtn.addEventListener("click", startGame);


