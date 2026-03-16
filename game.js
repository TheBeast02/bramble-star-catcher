const gameArea = document.getElementById("gameArea");
const bear = document.getElementById("bear");
const bearSprite = document.getElementById("bearSprite");

const scoreDisplay = document.getElementById("score");
const sizeText = document.getElementById("sizeText");
const levelText = document.getElementById("levelText");
const goalText = document.getElementById("goalText");
const livesText = document.getElementById("livesText");

const currentPlayerText = document.getElementById("currentPlayer");
const bestPlayerText = document.getElementById("bestPlayer");
const bestPlayerStartText = document.getElementById("bestPlayerStart");
const highScoreText = document.getElementById("highScore");
const hudHighScoreText = document.getElementById("hudHighScore");

const startButton = document.getElementById("startButton");
const fullscreenButton = document.getElementById("fullscreenButton");
const pauseButton = document.getElementById("pauseButton");
const nextLevelButton = document.getElementById("nextLevelButton");
const restartButton = document.getElementById("restartButton");
const storyButton = document.getElementById("storyButton");

const startScreen = document.getElementById("startScreen");
const questionBox = document.getElementById("questionBox");
const levelBox = document.getElementById("levelBox");
const gameOverBox = document.getElementById("gameOverBox");
const pauseOverlay = document.getElementById("pauseOverlay");
const storyBox = document.getElementById("storyBox");

const questionText = document.getElementById("questionText");
const levelTitle = document.getElementById("levelTitle");
const levelMessage = document.getElementById("levelMessage");
const gameOverMessage = document.getElementById("gameOverMessage");
const storyTitle = document.getElementById("storyTitle");
const storyMessage = document.getElementById("storyMessage");

const growthFill = document.getElementById("growthFill");
const growthText = document.getElementById("growthText");

const fireflyLayer = document.getElementById("fireflyLayer");
const sparkleLayer = document.getElementById("sparkleLayer");
const floatingScoreLayer = document.getElementById("floatingScoreLayer");
const flashOverlay = document.getElementById("flashOverlay");

const playerNameInput = document.getElementById("playerName");

const answerButtons = [
  document.getElementById("answer0"),
  document.getElementById("answer1"),
  document.getElementById("answer2")
];

const STORAGE_KEYS = {
  bestPlayer: "bramble_best_player",
  highScore: "bramble_high_score",
  playerName: "bramble_player_name"
};

const bgMusic = new Audio("forest_theme.m4a");
bgMusic.loop = true;
bgMusic.volume = 0.35;

const levelCompleteMusic = new Audio("level_complete.m4a");
levelCompleteMusic.volume = 0.55;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function tone(freq, start, duration, type = "sine", volume = 0.06) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);

  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start(start);
  osc.stop(start + duration);
}

function playStarSound() {
  const now = audioCtx.currentTime;
  tone(880, now, 0.05, "triangle", 0.05);
  tone(1174.66, now + 0.04, 0.08, "triangle", 0.05);
}

function playCorrectSound() {
  const now = audioCtx.currentTime;
  tone(523.25, now, 0.08, "sine", 0.05);
  tone(659.25, now + 0.1, 0.09, "sine", 0.05);
  tone(783.99, now + 0.2, 0.13, "sine", 0.05);
}

function playHurtSound() {
  const now = audioCtx.currentTime;
  tone(220, now, 0.12, "sawtooth", 0.07);
  tone(180, now + 0.08, 0.16, "sawtooth", 0.07);
  tone(140, now + 0.16, 0.18, "sawtooth", 0.06);
}

function playBonusSound() {
  const now = audioCtx.currentTime;
  tone(659.25, now, 0.08, "triangle", 0.05);
  tone(783.99, now + 0.08, 0.08, "triangle", 0.05);
  tone(987.77, now + 0.16, 0.12, "triangle", 0.05);
}

function playMagnetSound() {
  const now = audioCtx.currentTime;
  tone(523.25, now, 0.06, "triangle", 0.05);
  tone(783.99, now + 0.06, 0.08, "triangle", 0.05);
  tone(1046.5, now + 0.12, 0.12, "triangle", 0.05);
}

function playHeartSound() {
  const now = audioCtx.currentTime;
  tone(698.46, now, 0.08, "triangle", 0.05);
  tone(880, now + 0.06, 0.10, "triangle", 0.05);
  tone(1046.5, now + 0.14, 0.12, "triangle", 0.05);
}

let score = 0;
let bearX = 290;
let gameStarted = false;
let gamePaused = false;
let starSpawner = null;

let learningCountdown = 0;
let bonusCountdown = 0;
let dangerCountdown = 0;
let heartCountdown = 0;
let nextHeartThreshold = 26;

let bearScale = 1;
const HERO_FORM_SCALE = 1.8;
let lastMoveX = bearX;
let currentLevel = 1;
let levelGoal = 12;
let spawnRate = 920;
let lives = 3;
let poweredTimeout = null;

let purplePower = 0;
let correctAnswerCount = 0;
const ANSWERS_TO_HERO = 6;
const GROWTH_STEPS = [1.00, 1.08, 1.16, 1.24, 1.32, 1.42];

let heroFormActive = false;
let magnetActive = false;
let capeActive = false;
let crownActive = false;
let speedWrapActive = false;

let magnetTimer = null;
let capeTimer = null;
let crownTimer = null;
let speedTimer = null;

let spriteTimeout = null;
let idleFrameToggle = false;

let currentPlayerName = "Guest";
let bestPlayerName = "None yet";
let highScore = 0;

let pendingLevelCheckAfterQuestion = false;
let lastPointerX = null;
let lastMoveDirection = 0;

let pendingStoryAdvance = false;

const levelGoals = [18, 26, 38, 52, 68, 86, 106, 128, 152];

const questionSets = {
  easy: [
    { question: "3 + 2 = ?", answers: ["4", "5", "6"], correct: 1 },
    { question: "5 - 1 = ?", answers: ["3", "4", "6"], correct: 1 },
    { question: "Find the word: the", answers: ["was", "the", "and"], correct: 1 },
    { question: "Find the word: jump", answers: ["jump", "play", "look"], correct: 0 },
    { question: "2 + 4 = ?", answers: ["5", "6", "7"], correct: 1 },
    { question: "Find the word: can", answers: ["can", "big", "red"], correct: 0 }
  ],
  medium: [
    { question: "7 + 5 = ?", answers: ["11", "12", "13"], correct: 1 },
    { question: "9 - 3 = ?", answers: ["5", "6", "7"], correct: 1 },
    { question: "What color is grass?", answers: ["green", "blue", "purple"], correct: 0 },
    { question: "What color is the sky?", answers: ["yellow", "blue", "black"], correct: 1 },
    { question: "Which word names a color?", answers: ["orange", "table", "run"], correct: 0 },
    { question: "What shape has 3 sides?", answers: ["circle", "triangle", "square"], correct: 1 }
  ],
  hard: [
    { question: "12 + 8 = ?", answers: ["18", "20", "22"], correct: 1 },
    { question: "15 - 6 = ?", answers: ["7", "8", "9"], correct: 2 },
    { question: "Fill in the blank: The cat sat on the ___.", answers: ["mat", "tree", "sun"], correct: 0 },
    { question: "Fill in the blank: I can throw the ___.", answers: ["ball", "blue", "chair"], correct: 0 },
    { question: "Fill in the blank: We sleep at ___.", answers: ["night", "jump", "green"], correct: 0 },
    { question: "Which word completes the sentence: The bird can ___.", answers: ["fly", "apple", "book"], correct: 0 }
  ]
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function isFoxLevel() {
  return currentLevel >= 4 && currentLevel <= 6;
}

function getSpriteMap() {
  if (isFoxLevel()) {
    if (heroFormActive) {
      return {
        idle1: "fox_power_idle_1.png",
        idle2: "fox_power_idle_2.png",
        blink: "fox_power_idle_1.png",
        reach: "fox_power_reach.png",
        happy: "fox_power_celebrate.png"
      };
    }

    return {
      idle1: "fox_idle_1.png",
      idle2: "fox_idle_2.png",
      blink: "fox_idle_1.png",
      reach: "fox_reach.png",
      happy: "fox_celebrate.png"
    };
  }

  if (heroFormActive) {
    return {
      idle1: "bramble_power_idle_1.png",
      idle2: "bramble_power_idle_2.png",
      blink: "bramble_power_idle_1.png",
      reach: "bramble_power_reach.png",
      happy: "bramble_power_celebrate.png"
    };
  }

  return {
    idle1: "bramble_idle_1.png",
    idle2: "bramble_idle_2.png",
    blink: "bramble_blink.png",
    reach: "bramble_reach.png",
    happy: "bramble_happy.png"
  };
}

function getCurrentSpriteFile(name) {
  return getSpriteMap()[name];
}

function setBearSprite(name) {
  const spriteFile = getCurrentSpriteFile(name);
  if (!bearSprite || !spriteFile) return;
  bearSprite.src = spriteFile;
}

function applyCharacterMode() {
  bear.classList.toggle("foxMode", isFoxLevel());
  setBearSprite(idleFrameToggle ? "idle2" : "idle1");
}

function getLevelGoal(level) {
  if (level <= levelGoals.length) return levelGoals[level - 1];
  return levelGoals[levelGoals.length - 1] + (level - levelGoals.length) * 22;
}

function updateLevelGoal() {
  levelGoal = getLevelGoal(currentLevel);
  goalText.textContent = levelGoal;
}

function getQuestionPoolForLevel() {
  if (currentLevel <= 2) return questionSets.easy;
  if (currentLevel <= 4) return [...questionSets.easy, ...questionSets.medium];
  return [...questionSets.medium, ...questionSets.hard];
}

function livesToHearts() {
  let hearts = "";
  for (let i = 0; i < lives; i++) hearts += "❤️";
  return hearts || "0";
}

function updateGrowthHud() {
  const percent = Math.min(correctAnswerCount / ANSWERS_TO_HERO, 1) * 100;
  growthFill.style.width = `${percent}%`;
  growthText.textContent = `${correctAnswerCount} / ${ANSWERS_TO_HERO}`;
}

function updateHud() {
  levelText.textContent = currentLevel;
  scoreDisplay.textContent = score;
  livesText.textContent = livesToHearts();

  currentPlayerText.textContent = currentPlayerName;
  bestPlayerText.textContent = bestPlayerName;
  bestPlayerStartText.textContent = bestPlayerName;
  highScoreText.textContent = highScore;
  hudHighScoreText.textContent =
    bestPlayerName && bestPlayerName !== "None yet"
      ? `${bestPlayerName} - ${highScore}`
      : "0";

  updateGrowthHud();
}

function updateBearScale() {
  bear.style.setProperty("--bearScale", bearScale);
  sizeText.textContent = `${bearScale.toFixed(2)}x`;
}

function flashScreen() {
  flashOverlay.classList.remove("flash");
  void flashOverlay.offsetWidth;
  flashOverlay.classList.add("flash");
}

function pulseHero() {
  bear.classList.remove("heroPulse");
  void bear.offsetWidth;
  bear.classList.add("heroPulse");
}

function createSparkBurst(x, y, amount = 6, symbol = "✨") {
  for (let i = 0; i < amount; i++) {
    const spark = document.createElement("div");
    spark.className = "spark";
    spark.textContent = symbol;
    spark.style.left = `${x + randomInt(-18, 18)}px`;
    spark.style.top = `${y + randomInt(-18, 18)}px`;
    spark.style.animationDuration = `${randomInt(500, 850)}ms`;
    sparkleLayer.appendChild(spark);
    setTimeout(() => spark.remove(), 900);
  }
}

function createFloatingScore(text, x, y, type = "good") {
  const el = document.createElement("div");
  el.className = `floatScore ${type}`;
  el.textContent = text;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  floatingScoreLayer.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

function setRunning(isRunning) {
  bear.classList.toggle("running", isRunning);
}

function returnBearToIdle() {
  if (!gameStarted || gamePaused) return;
  setBearSprite(idleFrameToggle ? "idle2" : "idle1");
}

function showBearPose(name, duration = 220) {
  clearTimeout(spriteTimeout);
  setBearSprite(name);
  spriteTimeout = setTimeout(returnBearToIdle, duration);
}

function celebrateBear(duration = 850) {
  bear.classList.add("powered");
  clearTimeout(poweredTimeout);
  poweredTimeout = setTimeout(() => {
    bear.classList.remove("powered");
  }, duration);
}

function playHurtReaction() {
  setBearSprite("blink");
  bear.classList.remove("running");
  gameArea.classList.remove("shake");
  void gameArea.offsetWidth;
  gameArea.classList.add("shake");

  bearSprite.animate(
    [
      { transform: "translateX(0px) rotate(0deg)" },
      { transform: "translateX(-8px) rotate(-4deg)" },
      { transform: "translateX(8px) rotate(4deg)" },
      { transform: "translateX(-6px) rotate(-3deg)" },
      { transform: "translateX(6px) rotate(3deg)" },
      { transform: "translateX(0px) rotate(0deg)" }
    ],
    { duration: 320, easing: "ease-in-out" }
  );

  const oldOpacity = bearSprite.style.opacity;
  const oldFilter = bearSprite.style.filter;

  bearSprite.style.opacity = "0.72";
  bearSprite.style.filter = "drop-shadow(0 0 10px rgba(255, 70, 70, 0.9))";

  clearTimeout(spriteTimeout);
  spriteTimeout = setTimeout(() => {
    bearSprite.style.opacity = oldOpacity;
    bearSprite.style.filter = oldFilter;
    returnBearToIdle();
  }, 320);
}

function clearPowerTimers() {
  clearTimeout(magnetTimer);
  clearTimeout(capeTimer);
  clearTimeout(crownTimer);
  clearTimeout(speedTimer);
}

function updatePowerClasses() {
  bear.classList.toggle("magnetOn", magnetActive);
  bear.classList.toggle("capeOn", capeActive);
  bear.classList.toggle("crownOn", crownActive);
  bear.classList.toggle("speedOn", speedWrapActive);
  bear.classList.toggle("builtInPowerArt", heroFormActive);
}

function activateTimedPower(powerName, durationMs) {
  if (powerName === "magnet") {
    magnetActive = true;
    clearTimeout(magnetTimer);
    magnetTimer = setTimeout(() => {
      magnetActive = false;
      updatePowerClasses();
    }, durationMs);
  } else if (powerName === "cape") {
    capeActive = true;
    clearTimeout(capeTimer);
    capeTimer = setTimeout(() => {
      capeActive = false;
      updatePowerClasses();
    }, durationMs);
  } else if (powerName === "crown") {
    crownActive = true;
    clearTimeout(crownTimer);
    crownTimer = setTimeout(() => {
      crownActive = false;
      updatePowerClasses();
    }, durationMs);
  } else if (powerName === "speed") {
    speedWrapActive = true;
    clearTimeout(speedTimer);
    speedTimer = setTimeout(() => {
      speedWrapActive = false;
      updatePowerClasses();
    }, durationMs);
  }

  updatePowerClasses();
}

function addPurplePower(amount = 1) {
  purplePower += amount;

  playBonusSound();
  score += 2 * amount;
  updateHud();
  celebrateBear(450);

  const rect = bear.getBoundingClientRect();
  const areaRect = gameArea.getBoundingClientRect();
  const hitX = rect.left - areaRect.left + rect.width / 2;
  const hitY = rect.top - areaRect.top + rect.height / 2;

  createSparkBurst(hitX, hitY, 7, "✨");
  createFloatingScore(`+${2 * amount}`, hitX, hitY, "good");

  if (score >= levelGoal) {
    showLevelComplete();
  }
}
function applyLearningProgress() {
  const becameHero = !heroFormActive && correctAnswerCount >= ANSWERS_TO_HERO;

  if (correctAnswerCount >= ANSWERS_TO_HERO) {
    heroFormActive = true;
    bearScale = HERO_FORM_SCALE;
  } else {
    heroFormActive = false;
    const stepIndex = Math.min(correctAnswerCount, GROWTH_STEPS.length - 1);
    bearScale = GROWTH_STEPS[stepIndex];
  }

  updatePowerClasses();
  updateBearScale();
  applyCharacterMode();
  updateGrowthHud();

  if (becameHero) {
    playCorrectSound();
    flashScreen();
    pulseHero();
    celebrateBear(1000);

    const rect = bear.getBoundingClientRect();
    const areaRect = gameArea.getBoundingClientRect();
    createSparkBurst(
      rect.left - areaRect.left + rect.width / 2,
      rect.top - areaRect.top + rect.height / 2,
      11,
      "✨"
    );
  }
}

function moveBear(clientX) {
  const rect = gameArea.getBoundingClientRect();
  const styleWidth = parseFloat(getComputedStyle(bear).width) || bear.offsetWidth || 110;
  const scale = bearScale || 1;
  const effectiveBearWidth = styleWidth * scale;

  let targetX = clientX - rect.left - effectiveBearWidth / 2;
  const maxX = rect.width - effectiveBearWidth;

  if (lastPointerX !== null) {
    lastMoveDirection = clientX > lastPointerX ? 1 : clientX < lastPointerX ? -1 : lastMoveDirection;
  }
  lastPointerX = clientX;

  if (speedWrapActive) {
    const edgeZone = 14;
    if (targetX <= 0 && lastMoveDirection < 0 && clientX <= rect.left + edgeZone) {
      bearX = maxX;
    } else if (targetX >= maxX && lastMoveDirection > 0 && clientX >= rect.right - edgeZone) {
      bearX = 0;
    } else {
      if (targetX < 0) targetX = 0;
      if (targetX > maxX) targetX = maxX;
      bearX = targetX;
    }
  } else {
    if (targetX < 0) bearX = 0;
    else if (targetX > maxX) bearX = maxX;
    else bearX = targetX;
  }

  bear.style.left = `${bearX}px`;

  if (Math.abs(bearX - lastMoveX) > 2) {
    setRunning(true);
    clearTimeout(window.runTimeout);
    window.runTimeout = setTimeout(() => setRunning(false), 120);
  }

  lastMoveX = bearX;
}

function loadPlayerData() {
  const savedPlayer = localStorage.getItem(STORAGE_KEYS.playerName);
  const savedBestPlayer = localStorage.getItem(STORAGE_KEYS.bestPlayer);
  const savedHighScore = localStorage.getItem(STORAGE_KEYS.highScore);

  currentPlayerName = savedPlayer && savedPlayer.trim() ? savedPlayer.trim() : "Guest";
  bestPlayerName = savedBestPlayer && savedBestPlayer.trim() ? savedBestPlayer.trim() : "None yet";
  highScore = savedHighScore ? parseInt(savedHighScore, 10) || 0 : 0;

  playerNameInput.value = currentPlayerName === "Guest" ? "" : currentPlayerName;
  updateHud();
}

function saveCurrentPlayerName() {
  const enteredName = playerNameInput.value.trim();
  currentPlayerName = enteredName || "Guest";
  localStorage.setItem(STORAGE_KEYS.playerName, currentPlayerName);
  updateHud();
}

function maybeSaveHighScore() {
  if (score > highScore) {
    highScore = score;
    bestPlayerName = currentPlayerName;
    localStorage.setItem(STORAGE_KEYS.highScore, String(highScore));
    localStorage.setItem(STORAGE_KEYS.bestPlayer, bestPlayerName);
  }
  updateHud();
}

function isFullscreenActive() {
  return !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.msFullscreenElement
  );
}

async function enterFullscreen() {
  const target = document.documentElement;
  if (target.requestFullscreen) await target.requestFullscreen();
  else if (target.webkitRequestFullscreen) await target.webkitRequestFullscreen();
  else if (target.msRequestFullscreen) await target.msRequestFullscreen();
}

async function exitFullscreen() {
  if (document.exitFullscreen) await document.exitFullscreen();
  else if (document.webkitExitFullscreen) await document.webkitExitFullscreen();
  else if (document.msExitFullscreen) await document.msExitFullscreen();
}

function updateFullscreenButton() {
  fullscreenButton.textContent = isFullscreenActive() ? "Exit Fullscreen" : "Fullscreen";
}

async function toggleFullscreen() {
  try {
    if (isFullscreenActive()) await exitFullscreen();
    else await enterFullscreen();
  } catch (error) {
    console.log("Fullscreen unavailable:", error);
  }
  updateFullscreenButton();
}

function clearStars() {
  document.querySelectorAll(".star, .badStar, .bonusStar, .heartStar").forEach(item => item.remove());
}

function pauseGame() {
  if (!gameStarted) return;

  gamePaused = !gamePaused;
  pauseButton.textContent = gamePaused ? "Resume" : "Pause";
  pauseOverlay.classList.toggle("hidden", !gamePaused);

  if (gamePaused) {
    bgMusic.pause();
  } else {
    bgMusic.play().catch(() => {});
  }
}

function getStoryForLevel(level) {
  if (level === 4) {
    return {
      title: "A New Friend Appears",
      text: "Bramble reaches deeper into the forest and meets a clever fox. The adventure changes, and the forest feels faster now."
    };
  }

  if (level === 7) {
    return {
      title: "Return of the Bear Hero",
      text: "Bramble returns stronger than before, carrying everything learned in the glowing woods."
    };
  }

  return null;
}

function showStoryCard(level) {
  const story = getStoryForLevel(level);
  if (!story) return false;

  gamePaused = true;
  pendingStoryAdvance = true;
  bgMusic.pause();

  storyTitle.textContent = story.title;
  storyMessage.textContent = story.text;
  storyBox.classList.remove("hidden");
  return true;
}

function showQuestion() {
  gamePaused = true;
  pauseButton.textContent = "Resume";
  pauseOverlay.classList.add("hidden");
  questionBox.classList.remove("hidden");
  bgMusic.pause();

  const pool = getQuestionPoolForLevel();
  const q = pool[Math.floor(Math.random() * pool.length)];
  questionText.textContent = q.question;

  answerButtons.forEach((btn, index) => {
    btn.textContent = q.answers[index];
    btn.onclick = () => {
      const rect = bear.getBoundingClientRect();
      const areaRect = gameArea.getBoundingClientRect();
      const cx = rect.left - areaRect.left + rect.width / 2;
      const cy = rect.top - areaRect.top + rect.height / 2;

      if (index === q.correct) {
        playCorrectSound();
        score += 1;
        correctAnswerCount = Math.min(correctAnswerCount + 1, ANSWERS_TO_HERO);
        applyLearningProgress();
        updateHud();
        pulseHero();
        celebrateBear(650);
        createSparkBurst(cx, cy, 8, "✨");
        createFloatingScore("+1", cx, cy - 10, "good");
      } else {
        createFloatingScore("Try Again!", cx - 20, cy - 10, "bad");
      }

      questionBox.classList.add("hidden");
      gamePaused = false;
      pauseButton.textContent = "Pause";
      bgMusic.play().catch(() => {});
      returnBearToIdle();

      if (pendingLevelCheckAfterQuestion && score >= levelGoal) {
        pendingLevelCheckAfterQuestion = false;
        showLevelComplete();
        return;
      }

      pendingLevelCheckAfterQuestion = false;
    };
  });
}

function loseLife() {
  playHurtSound();
  playHurtReaction();

  const rect = bear.getBoundingClientRect();
  const areaRect = gameArea.getBoundingClientRect();
  createFloatingScore("-1 life", rect.left - areaRect.left + rect.width / 2 - 10, rect.top - areaRect.top, "bad");

  lives--;
  bearScale = 1;
  purplePower = 0;
  heroFormActive = false;
  magnetActive = false;
  capeActive = false;
  crownActive = false;
  speedWrapActive = false;
  correctAnswerCount = 0;

  clearPowerTimers();
  updatePowerClasses();
  updateBearScale();
  applyCharacterMode();
  updateHud();

  if (lives <= 0) {
    showGameOver();
  }
}

function awardHeart() {
  playHeartSound();

  const rect = bear.getBoundingClientRect();
  const areaRect = gameArea.getBoundingClientRect();
  createFloatingScore("+1 life", rect.left - areaRect.left + rect.width / 2 - 10, rect.top - areaRect.top, "heart");

  if (lives < 4) {
    lives++;
  } else {
    score += 3;
    createFloatingScore("+3", rect.left - areaRect.left + rect.width / 2 + 18, rect.top - areaRect.top - 18, "good");
  }

  celebrateBear(500);
  createSparkBurst(rect.left - areaRect.left + rect.width / 2, rect.top - areaRect.top + rect.height / 2, 6, "💖");
  updateHud();

  if (score >= levelGoal) {
    showLevelComplete();
  }
}

function showGameOver() {
  gamePaused = true;
  clearInterval(starSpawner);
  clearStars();
  pauseOverlay.classList.add("hidden");
  maybeSaveHighScore();
  playHurtSound();

  gameOverMessage.textContent = `${currentPlayerName} reached Level ${currentLevel}! Final Score: ${score}. Best Score: ${highScore}.`;
  bgMusic.pause();
  setBearSprite("blink");

  setTimeout(() => gameOverBox.classList.remove("hidden"), 250);
}

function showLevelComplete() {
  gamePaused = true;
  celebrateBear(1200);
  clearInterval(starSpawner);
  maybeSaveHighScore();

  levelTitle.textContent = "Level Complete!";
  levelMessage.textContent = `${currentPlayerName} reached the goal of ${levelGoal} points.`;
  levelBox.classList.remove("hidden");

  bgMusic.pause();
  levelCompleteMusic.currentTime = 0;
  levelCompleteMusic.play().catch(() => {});
  setBearSprite("happy");
  flashScreen();

  const rect = bear.getBoundingClientRect();
  const areaRect = gameArea.getBoundingClientRect();
  createSparkBurst(rect.left - areaRect.left + rect.width / 2, rect.top - areaRect.top + rect.height / 2, 12, "✨");
}

function nextLevel() {
  levelBox.classList.add("hidden");
  currentLevel++;
  score = 0;

  learningCountdown = 0;
  bonusCountdown = 0;
  dangerCountdown = 0;
  heartCountdown = 0;
  nextHeartThreshold = currentLevel < 3 ? 9999 : randomInt(22, 32);

  if (currentLevel === 4 || currentLevel === 7) {
    bearScale = 1;
    purplePower = 0;
    correctAnswerCount = 0;
    heroFormActive = false;
    magnetActive = false;
    capeActive = false;
    crownActive = false;
    speedWrapActive = false;
    clearPowerTimers();
    updatePowerClasses();
  }

  updateLevelGoal();
  spawnRate = Math.max(420, spawnRate - 45);
  updateBearScale();
  updateHud();
  clearStars();
  applyCharacterMode();

  clearInterval(starSpawner);
  pauseOverlay.classList.add("hidden");
  pauseButton.textContent = "Pause";
  returnBearToIdle();

  if (showStoryCard(currentLevel)) {
    return;
  }

  gamePaused = false;
  starSpawner = setInterval(createItem, spawnRate);
  bgMusic.play().catch(() => {});
}

function restartGame() {
  gameOverBox.classList.add("hidden");
  startFreshGame();
}

function applyMagnet(x) {
  if (!magnetActive) return x;

  const bearRect = bear.getBoundingClientRect();
  const gameRect = gameArea.getBoundingClientRect();
  const bearCenterX = bearRect.left - gameRect.left + bearRect.width / 2;
  const starCenterX = x + 15;
  const distance = bearCenterX - starCenterX;

  let pullStrength = 0.05;
  if (currentLevel >= 3) pullStrength = 0.06;
  if (currentLevel >= 5) pullStrength = 0.075;
  if (currentLevel >= 7) pullStrength = 0.09;
  if (capeActive) pullStrength += 0.015;
  if (crownActive) pullStrength += 0.015;
  if (speedWrapActive) pullStrength += 0.02;

  const pullRadius =
    120 +
    currentLevel * 8 +
    (capeActive ? 18 : 0) +
    (crownActive ? 20 : 0) +
    (speedWrapActive ? 25 : 0);

  if (Math.abs(distance) < pullRadius) {
    x += distance * pullStrength;
  }

  return x;
}

function getBearHitbox(itemType) {
  const sourceRect = bearSprite ? bearSprite.getBoundingClientRect() : bear.getBoundingClientRect();

  if (itemType === "bad") {
    return {
      left: sourceRect.left + 28,
      right: sourceRect.right - 28,
      top: sourceRect.top + 34,
      bottom: sourceRect.bottom - 24
    };
  }

  return {
    left: sourceRect.left + 14,
    right: sourceRect.right - 14,
    top: sourceRect.top + 18,
    bottom: sourceRect.bottom - 12
  };
}

function createItem() {
  if (gamePaused) return;

  let itemType = "normal";

  learningCountdown++;
  bonusCountdown++;
  dangerCountdown++;
  heartCountdown++;

  if (currentLevel >= 3 && heartCountdown >= nextHeartThreshold) {
    itemType = "heart";
    heartCountdown = 0;
    nextHeartThreshold = randomInt(22, 32);
  } else if (learningCountdown >= 9) {
    itemType = "learning";
    learningCountdown = 0;
  } else if (bonusCountdown >= 7) {
    itemType = "bonus";
    bonusCountdown = 0;
  } else if (dangerCountdown >= 12) {
    itemType = "bad";
    dangerCountdown = 0;
  }

  const item = document.createElement("div");
  let x = Math.random() * Math.max(40, gameArea.clientWidth - 60);
  let y = 0;
  let dx = 0;
  let speed = 4;

  if (itemType === "heart") {
    item.classList.add("heartStar");
    item.innerText = "❤️";
    speed = 2.9;
    dx = Math.random() > 0.5 ? 0.8 : -0.8;
  } else if (itemType === "learning") {
    item.classList.add("star", "learningStar");
    item.innerText = "🌟";
    speed = 3;
    dx = 0;
  } else if (itemType === "bonus") {
    item.classList.add("bonusStar");
    item.innerText = "🟣";
    speed = 4.1;
    dx = Math.random() > 0.5 ? 1.3 : -1.3;
  } else if (itemType === "bad") {
    item.classList.add("badStar");
    item.innerText = "🔴";
    speed = 4.7 + (currentLevel - 1) * 0.3;
    dx = Math.random() > 0.5 ? 1.8 : -1.8;
  } else {
    item.classList.add("star");
    item.innerText = "⭐";
    speed = 4 + (currentLevel - 1) * 0.28;
    dx = Math.random() > 0.5 ? 1.5 : -1.5;
  }

  item.style.left = `${x}px`;
  item.style.top = `${y}px`;
  gameArea.appendChild(item);

  const fall = setInterval(() => {
    if (gamePaused) return;

    y += speed;

    if (itemType !== "learning") {
      x += dx;
      if (x <= 0 || x >= gameArea.clientWidth - 40) dx *= -1;
    }

    if (itemType !== "bad" && itemType !== "heart") {
      x = applyMagnet(x);
    }

    item.style.top = `${y}px`;
    item.style.left = `${x}px`;

    const itemRect = item.getBoundingClientRect();
    const hitbox = getBearHitbox(itemType);

    const hit =
      itemRect.bottom >= hitbox.top &&
      itemRect.top <= hitbox.bottom &&
      itemRect.left < hitbox.right &&
      itemRect.right > hitbox.left;

    if (hit) {
      const areaRect = gameArea.getBoundingClientRect();
      const hitX = itemRect.left - areaRect.left + itemRect.width / 2;
      const hitY = itemRect.top - areaRect.top + itemRect.height / 2;

      item.remove();
      clearInterval(fall);

      if (itemType === "bad") {
        createSparkBurst(hitX, hitY, 5, "💥");
        loseLife();
        return;
      }

      if (itemType === "heart") {
        createSparkBurst(hitX, hitY, 5, "💖");
        awardHeart();
        return;
      }

if (itemType === "bonus") {
  addPurplePower(1);
  return;
}
      if (itemType === "learning") {
        playStarSound();
        showBearPose("reach", 180);
        score += 1;
        updateHud();
        pendingLevelCheckAfterQuestion = true;
        createSparkBurst(hitX, hitY, 6, "✨");
        createFloatingScore("+1", hitX, hitY, "good");
        showQuestion();
        return;
      }

      playStarSound();
      showBearPose("reach", 180);
      score += 1;
      updateHud();
      createSparkBurst(hitX, hitY, 4, "✨");
      createFloatingScore("+1", hitX, hitY, "good");

      if (score >= levelGoal) {
        showLevelComplete();
      }
    }

    if (y > gameArea.clientHeight) {
      item.remove();
      clearInterval(fall);
    }
  }, 30);
}

function resetCharacterState() {
  bearScale = 1;
  purplePower = 0;
  correctAnswerCount = 0;
  heroFormActive = false;
  magnetActive = false;
  capeActive = false;
  crownActive = false;
  speedWrapActive = false;
  clearPowerTimers();
  updatePowerClasses();
  applyLearningProgress();
  updateHud();
}

function debugJumpToLevel(targetLevel) {
  currentLevel = targetLevel;
  score = 0;
  learningCountdown = 0;
  bonusCountdown = 0;
  dangerCountdown = 0;
  heartCountdown = 0;
  nextHeartThreshold = targetLevel < 4 ? 9999 : randomInt(22, 32);

  resetCharacterState();
  updateLevelGoal();
  updateHud();
  clearStars();
  applyCharacterMode();
  returnBearToIdle();
}

function spawnFireflies() {
  fireflyLayer.innerHTML = "";
  for (let i = 0; i < 14; i++) {
    const fly = document.createElement("div");
    fly.className = "firefly";
    fly.style.left = `${randomInt(4, 96)}%`;
    fly.style.top = `${randomInt(8, 78)}%`;
    fly.style.animationDuration = `${randomInt(4000, 9000)}ms, ${randomInt(900, 1800)}ms`;
    fly.style.animationDelay = `${randomInt(0, 2000)}ms`;
    fireflyLayer.appendChild(fly);
  }
}

function startFreshGame() {
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  saveCurrentPlayerName();

  clearInterval(starSpawner);
  clearStars();
  clearTimeout(spriteTimeout);
  clearPowerTimers();

  gameStarted = true;
  gamePaused = false;
  pendingStoryAdvance = false;

  startScreen.classList.add("hidden");
  questionBox.classList.add("hidden");
  levelBox.classList.add("hidden");
  gameOverBox.classList.add("hidden");
  storyBox.classList.add("hidden");
  pauseOverlay.classList.add("hidden");

  score = 0;
  bearScale = 1;
  lives = 3;
  currentLevel = 1;
  learningCountdown = 0;
  bonusCountdown = 0;
  dangerCountdown = 0;
  heartCountdown = 0;
  nextHeartThreshold = 9999;

  purplePower = 0;
  correctAnswerCount = 0;
  heroFormActive = false;
  magnetActive = false;
  capeActive = false;
  crownActive = false;
  speedWrapActive = false;
  updatePowerClasses();

  updateLevelGoal();
  spawnRate = 920;

  lastPointerX = null;
  lastMoveDirection = 0;

  bear.classList.remove("powered");
  bear.classList.remove("running");

  updateBearScale();
  updateHud();

  pauseButton.textContent = "Pause";
  idleFrameToggle = false;
  applyCharacterMode();

  bgMusic.currentTime = 0;
  bgMusic.play().catch(() => {});

  starSpawner = setInterval(createItem, spawnRate);
}

document.addEventListener("mousemove", (e) => {
  if (!gameStarted || gamePaused) return;
  moveBear(e.clientX);
});

gameArea.addEventListener("touchstart", (e) => {
  if (!gameStarted || gamePaused) return;
  if (audioCtx.state === "suspended") audioCtx.resume();

  const touch = e.touches[0];
  lastPointerX = touch.clientX;
  moveBear(touch.clientX);
});

gameArea.addEventListener("touchmove", (e) => {
  if (!gameStarted || gamePaused) return;
  e.preventDefault();

  if (audioCtx.state === "suspended") audioCtx.resume();

  const touch = e.touches[0];
  moveBear(touch.clientX);
}, { passive: false });

pauseButton.addEventListener("click", pauseGame);
startButton.addEventListener("click", startFreshGame);
nextLevelButton.addEventListener("click", nextLevel);
restartButton.addEventListener("click", restartGame);

storyButton.addEventListener("click", () => {
  storyBox.classList.add("hidden");
  pendingStoryAdvance = false;
  gamePaused = false;
  pauseButton.textContent = "Pause";
  returnBearToIdle();
  bgMusic.play().catch(() => {});
  clearInterval(starSpawner);
  starSpawner = setInterval(createItem, spawnRate);
});

if (fullscreenButton) {
  fullscreenButton.addEventListener("click", toggleFullscreen);
  document.addEventListener("fullscreenchange", updateFullscreenButton);
  document.addEventListener("webkitfullscreenchange", updateFullscreenButton);
  document.addEventListener("msfullscreenchange", updateFullscreenButton);
}

setInterval(() => {
  if (!gameStarted || gamePaused) return;
  if (!questionBox.classList.contains("hidden")) return;
  if (!levelBox.classList.contains("hidden")) return;
  if (!gameOverBox.classList.contains("hidden")) return;
  if (!storyBox.classList.contains("hidden")) return;

  idleFrameToggle = !idleFrameToggle;
  returnBearToIdle();
}, 700);

setInterval(() => {
  if (!gameStarted || gamePaused) return;
  if (Math.random() < 0.35) {
    showBearPose("blink", 180);
  }
}, 3200);

document.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();

  if (["input", "textarea"].includes(document.activeElement?.tagName?.toLowerCase())) {
    return;
  }

  if (key === "k") {
    correctAnswerCount = Math.min(correctAnswerCount + 1, ANSWERS_TO_HERO);
    applyLearningProgress();
    updateHud();
  }

  if (key === "n") {
    nextLevel();
  }

  if (key === "b") {
    addPurplePower(1);
    updateHud();
    applyCharacterMode();
  }

  if (key === "r") {
    resetCharacterState();
  }

  if (key === "h") {
    heroFormActive = !heroFormActive;
    applyLearningProgress();
  }

  if (key === "4") {
    debugJumpToLevel(4);
  }

  if (key === "7") {
    debugJumpToLevel(7);
  }
});

loadPlayerData();
updateLevelGoal();
updateHud();
updateFullscreenButton();
applyCharacterMode();
spawnFireflies();S