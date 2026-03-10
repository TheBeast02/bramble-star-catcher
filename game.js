const gameArea = document.getElementById("gameArea");
const bear = document.getElementById("bear");
const scoreDisplay = document.getElementById("score");
const sizeText = document.getElementById("sizeText");
const levelText = document.getElementById("levelText");
const goalText = document.getElementById("goalText");
const startButton = document.getElementById("startButton");
const startScreen = document.getElementById("startScreen");
const questionBox = document.getElementById("questionBox");
const questionText = document.getElementById("questionText");
const levelBox = document.getElementById("levelBox");
const levelTitle = document.getElementById("levelTitle");
const levelMessage = document.getElementById("levelMessage");
const nextLevelButton = document.getElementById("nextLevelButton");
const pauseButton = document.getElementById("pauseButton");

const answerButtons = [
  document.getElementById("answer0"),
  document.getElementById("answer1"),
  document.getElementById("answer2")
];

let score = 0;
let totalScore = 0;
let bearX = 290;
let gameStarted = false;
let gamePaused = false;
let starSpawner = null;
let learningCountdown = 0;
let bearScale = 1;
let lastMoveX = bearX;
let currentLevel = 1;
let levelGoal = 10;
let spawnRate = 900;

const questions = [
  { question: "3 + 2 = ?", answers: ["4", "5", "6"], correct: 1 },
  { question: "5 - 1 = ?", answers: ["3", "4", "6"], correct: 1 },
  { question: "Find the word: the", answers: ["was", "the", "and"], correct: 1 },
  { question: "Find the word: jump", answers: ["jump", "play", "look"], correct: 0 },
  { question: "2 + 4 = ?", answers: ["5", "6", "7"], correct: 1 },
  { question: "Find the word: can", answers: ["can", "big", "red"], correct: 0 }
];

function updateBearScale() {
  bear.style.setProperty("--bearScale", bearScale);
  bear.style.transform = `scale(${bearScale})`;
  sizeText.textContent = bearScale.toFixed(1) + "x";
}

function updateHud() {
  levelText.textContent = currentLevel;
  goalText.textContent = levelGoal;
  scoreDisplay.textContent = score;
}

function setRunning(isRunning) {
  if (isRunning) {
    bear.classList.add("running");
  } else {
    bear.classList.remove("running");
  }
}

function moveBear(clientX) {
  const rect = gameArea.getBoundingClientRect();
  const targetX = clientX - rect.left - 65;

  if (targetX < 0) bearX = 0;
  else if (targetX > 570) bearX = 570;
  else bearX = targetX;

  bear.style.left = bearX + "px";

  if (Math.abs(bearX - lastMoveX) > 2) {
    setRunning(true);
    clearTimeout(window.runTimeout);
    window.runTimeout = setTimeout(() => setRunning(false), 120);
  }

  lastMoveX = bearX;
}

document.addEventListener("mousemove", (e) => {
  if (!gameStarted || gamePaused) return;
  moveBear(e.clientX);
});

gameArea.addEventListener("touchstart", (e) => {
  if (!gameStarted || gamePaused) return;
  const touch = e.touches[0];
  moveBear(touch.clientX);
});

gameArea.addEventListener("touchmove", (e) => {
  if (!gameStarted || gamePaused) return;
  e.preventDefault();
  const touch = e.touches[0];
  moveBear(touch.clientX);
});

function pauseGame() {
  gamePaused = !gamePaused;
  pauseButton.textContent = gamePaused ? "Resume" : "Pause";
}

pauseButton.addEventListener("click", pauseGame);

function showQuestion() {
  gamePaused = true;
  pauseButton.textContent = "Resume";
  questionBox.classList.remove("hidden");

  const q = questions[Math.floor(Math.random() * questions.length)];
  questionText.textContent = q.question;

  answerButtons.forEach((btn, index) => {
    btn.textContent = q.answers[index];
    btn.onclick = () => {
      if (index === q.correct) {
        bearScale = Math.min(bearScale + 0.1, 1.8);
        updateBearScale();
        bear.classList.add("powered");
        setTimeout(() => bear.classList.remove("powered"), 700);
      }
      questionBox.classList.add("hidden");
      gamePaused = false;
      pauseButton.textContent = "Pause";
    };
  });
}

function showLevelComplete() {
  gamePaused = true;
  levelTitle.textContent = "Level Complete!";
  levelMessage.textContent = `Bramble reached the goal of ${levelGoal} stars.`;
  levelBox.classList.remove("hidden");
}

function clearStars() {
  document.querySelectorAll(".star").forEach(star => star.remove());
}

function nextLevel() {
  levelBox.classList.add("hidden");
  currentLevel++;
  score = 0;
  learningCountdown = 0;
  levelGoal += 5;
  spawnRate = Math.max(450, spawnRate - 100);
  updateHud();
  clearStars();

  clearInterval(starSpawner);
  gamePaused = false;
  pauseButton.textContent = "Pause";
  starSpawner = setInterval(createStar, spawnRate);
}

nextLevelButton.addEventListener("click", nextLevel);

function createStar() {
  if (gamePaused) return;

  const star = document.createElement("div");
  star.classList.add("star");

  learningCountdown++;
  const isLearning = learningCountdown >= 8;

  if (isLearning) {
    star.innerText = "🌟";
    star.classList.add("learningStar");
    learningCountdown = 0;
  } else {
    star.innerText = "⭐";
  }

  let x = Math.random() * 640;
  let y = 0;
  let dx = isLearning ? 0 : (Math.random() > 0.5 ? 1.5 : -1.5);

  star.style.left = x + "px";
  star.style.top = y + "px";
  gameArea.appendChild(star);

  const fall = setInterval(() => {
    if (gamePaused) return;

    y += isLearning ? 3 : 4 + (currentLevel - 1) * 0.4;
    x += dx;

    if (!isLearning) {
      if (x <= 0 || x >= 660) dx *= -1;
    }

    star.style.top = y + "px";
    star.style.left = x + "px";

    const starRect = star.getBoundingClientRect();
    const bearRect = bear.getBoundingClientRect();

    if (
      starRect.bottom >= bearRect.top &&
      starRect.left < bearRect.right &&
      starRect.right > bearRect.left
    ) {
      score++;
      totalScore++;
      updateHud();
      star.remove();
      clearInterval(fall);

      if (isLearning) {
        showQuestion();
      }

      if (score >= levelGoal) {
        showLevelComplete();
      }
    }

    if (y > 470) {
      star.remove();
      clearInterval(fall);
    }
  }, 30);
}

function startGame() {
  if (gameStarted) return;
  gameStarted = true;
  startScreen.classList.add("hidden");
  score = 0;
  totalScore = 0;
  currentLevel = 1;
  levelGoal = 10;
  spawnRate = 900;
  bearScale = 1;
  updateBearScale();
  updateHud();
  gamePaused = false;
  pauseButton.textContent = "Pause";
  clearInterval(starSpawner);
  starSpawner = setInterval(createStar, spawnRate);
}

startButton.addEventListener("click", startGame);