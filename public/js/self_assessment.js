const logoutBtn = document.getElementById("logoutBtn");
const quizContainer = document.getElementById("quizContainer");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const resultContainer = document.getElementById("resultContainer");
const resultText = document.getElementById("resultText");
const restartBtn = document.getElementById("restartBtn");

let currentQ = 0;
let score = 0;

// ----------------- QUESTIONS -----------------
const questions = [
  { q: "How often do you feel overwhelmed?", options: ["Rarely", "Sometimes", "Often", "Almost always"], score: [1, 2, 3, 4] },
  { q: "How well are you sleeping lately?", options: ["Very well", "Fair", "Poorly", "Barely at all"], score: [1, 2, 3, 4] },
  { q: "How is your energy level during the day?", options: ["High", "Moderate", "Low", "Exhausted"], score: [1, 2, 3, 4] },
  { q: "Do you find it hard to relax?", options: ["Not at all", "Sometimes", "Often", "Always"], score: [1, 2, 3, 4] },
  { q: "Do small issues make you irritated?", options: ["Rarely", "Sometimes", "Often", "Always"], score: [1, 2, 3, 4] },
  { q: "How often do you experience headaches or tension?", options: ["Rarely", "Occasionally", "Frequently", "Daily"], score: [1, 2, 3, 4] },
  { q: "How is your appetite lately?", options: ["Normal", "Slightly affected", "Low", "Very poor"], score: [1, 2, 3, 4] },
  { q: "Do you have trouble focusing?", options: ["No", "Sometimes", "Often", "Constantly"], score: [1, 2, 3, 4] },
  { q: "How optimistic do you feel?", options: ["Very", "Somewhat", "Rarely", "Not at all"], score: [1, 2, 3, 4] },
  { q: "Do you feel supported by people around you?", options: ["Yes, completely", "Mostly", "Not much", "No"], score: [1, 2, 3, 4] },
];

// ----------------- LOGOUT -----------------
logoutBtn.addEventListener("click", async () => {
  await fetch("/api/auth/logout", { method: "POST" });
  window.location.href = "/index.html";
});

// ----------------- QUIZ LOGIC -----------------
function loadQuestion() {
  const q = questions[currentQ];
  quizContainer.innerHTML = `
    <h3>${q.q}</h3>
    ${q.options
      .map(
        (opt, i) =>
          `<button class="option" data-score="${q.score[i]}">${opt}</button>`
      )
      .join("")}
  `;
  progressBar.style.width = `${((currentQ + 1) / questions.length) * 100}%`;
  progressText.textContent = `Question ${currentQ + 1} of ${questions.length}`;

  document.querySelectorAll(".option").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      score += parseInt(e.target.getAttribute("data-score"));
      currentQ++;
      if (currentQ < questions.length) {
        loadQuestion();
      } else {
        showResult();
      }
    })
  );
}

function showResult() {
  quizContainer.classList.add("hidden");
  resultContainer.classList.remove("hidden");

  let level = "";
  let color = "";
  if (score <= 15) {
    level = "Low Stress 🌈 — You're doing great! Keep it up.";
    color = "#c8e6c9";
  } else if (score <= 25) {
    level = "Moderate Stress 🌤️ — Try more relaxation activities.";
    color = "#fff9c4";
  } else {
    level = "High Stress 🌧️ — Take a break, breathe, and seek support.";
    color = "#ffcdd2";
  }

  resultText.textContent = level;
  document.body.style.background = color;
  localStorage.setItem("lastStressScore", score);
}

restartBtn.addEventListener("click", () => {
  currentQ = 0;
  score = 0;
  resultContainer.classList.add("hidden");
  quizContainer.classList.remove("hidden");
  document.body.style.background = "linear-gradient(to bottom right, #b3e5fc, #f8bbd0)";
  loadQuestion();
});

// ----------------- INITIAL LOAD -----------------
async function checkSession() {
  const res = await fetch("/api/auth/session");
  const data = await res.json();
  if (!data.loggedIn) {
    window.location.href = "/index.html";
  }
}

window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    checkSession();
  }
});

window.onload = () => {
  checkSession();
  loadQuestion();
};
