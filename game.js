const gameArea = document.getElementById("gameArea");
const bear = document.getElementById("bear");
const bearSprite = document.getElementById("bearSprite");
const scoreDisplay = document.getElementById("score");
const sizeText = document.getElementById("sizeText");
const levelText = document.getElementById("levelText");
const goalText = document.getElementById("goalText");
const livesText = document.getElementById("livesText");

const startButton = document.getElementById("startButton");
const startScreen = document.getElementById("startScreen");

const questionBox = document.getElementById("questionBox");
const questionText = document.getElementById("questionText");

const levelBox = document.getElementById("levelBox");
const levelTitle = document.getElementById("levelTitle");
const levelMessage = document.getElementById("levelMessage");
const nextLevelButton = document.getElementById("nextLevelButton");

const gameOverBox = document.getElementById("gameOverBox");
const gameOverMessage = document.getElementById("gameOverMessage");
const restartButton = document.getElementById("restartButton");

const pauseButton = document.getElementById("pauseButton");
const pauseOverlay = document.getElementById("pauseOverlay");

const playerNameInput = document.getElementById("playerName");
const currentPlayerText = document.getElementById("currentPlayer");
const bestPlayerText = document.getElementById("bestPlayer");
const highScoreText = document.getElementById("highScore");
const hudHighScoreText = document.getElementById("hudHighScore");
const fullscreenButton = document.getElementById("fullscreenButton");

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

const bgMusic = new Audio();
bgMusic.loop = true;
bgMusic.volume = 0.35;

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
  tone(1174.66, now + 0.04, 0.07, "triangle", 0.05);
}

function playCorrectSound() {
  const now = audioCtx.currentTime;
  tone(523.25, now, 0.10, "sine", 0.05);
  tone(659.25, now + 0.11, 0.10, "sine", 0.05);
  tone(783.99, now + 0.22, 0.14, "sine", 0.05);
}

function playHurtSound() {
  const now = audioCtx.currentTime;
  tone(220, now, 0.12, "sawtooth", 0.07);
  tone(180, now + 0.08, 0.16, "sawtooth", 0.07);
  tone(140, now + 0.16, 0.20, "sawtooth", 0.06);
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
let lastMoveX = bearX;
let currentLevel = 1;
let levelGoal = 12;
let spawnRate = 950;
let lives = 3;
let poweredTimeout = null;

let purplePower = 0;
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

const spriteMap = {
  idle1: "bramble_idle_1.png",
  idle2: "bramble_idle_2.png",
  blink: "bramble_blink.png",
  reach: "bramble_reach.png",
  happy: "bramble_happy.png"
};

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

function getLevelGoal(level) {
  if (level <= levelGoals.length) return levelGoals[level - 1];
  return levelGoals[levelGoals.length - 1] + (level - levelGoals.length) * 22;
}

function updateLevelGoal() {
  levelGoal = getLevelGoal(currentLevel);
  if (goalText) goalText.textContent = levelGoal;
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

function setBearSprite(name) {
  if (!bearSprite || !spriteMap[name]) return;
  bearSprite.src = spriteMap[name];
}

function returnBearToIdle() {
  if (!gameStarted || gamePaused) return;
  setBearSprite(idleFrameToggle ? "idle2" : "idle1");
}

function showBearPose(name, duration = 220) {
  clearTimeout(spriteTimeout);
  setBearSprite(name);
  spriteTimeout = setTimeout(() => {
    returnBearToIdle();
  }, duration);
}

function celebrateBear(duration = 900) {
  bear.classList.add("powered");
  clearTimeout(poweredTimeout);
  poweredTimeout = setTimeout(() => {
    bear.classList.remove("powered");
  }, duration);
}

function playHurtReaction() {
  if (!bearSprite) return;

  setBearSprite("blink");
  bear.classList.remove("running");

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
  const previousPurple = purplePower;
  purplePower += amount;

  if (previousPurple < 2 && purplePower >= 2) {
    activateTimedPower("magnet", 10000);
    playMagnetSound();
    celebrateBear(700);
  }
  if (previousPurple < 4 && purplePower >= 4) {
    activateTimedPower("cape", 10000);
    playCorrectSound();
    celebrateBear(850);
  }
  if (previousPurple < 6 && purplePower >= 6) {
    crownActive = true;
updatePowerClasses();
    playCorrectSound();
    celebrateBear(950);
  }
  if (previousPurple < 8 && purplePower >= 8) {
    activateTimedPower("speed", 8000);
    playMagnetSound();
    celebrateBear(1100);
  }
}

function updateBearScale() {
  bear.style.setProperty("--bearScale", bearScale);
  if (sizeText) sizeText.textContent = bearScale.toFixed(1) + "x";
}

function updateHud() {
  levelText.textContent = currentLevel;
  scoreDisplay.textContent = score;
  livesText.textContent = livesToHearts();

  if (currentPlayerText) currentPlayerText.textContent = currentPlayerName;
  if (bestPlayerText) bestPlayerText.textContent = bestPlayerName;
  if (highScoreText) highScoreText.textContent = highScore;

  if (hudHighScoreText) {
    hudHighScoreText.textContent =
      bestPlayerName && bestPlayerName !== "None yet"
        ? `${bestPlayerName} - ${highScore}`
        : "0";
  }
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
    if (targetX < 0) {
      bearX = 0;
    } else if (targetX > maxX) {
      bearX = maxX;
    } else {
      bearX = targetX;
    }
  }

  bear.style.left = bearX + "px";

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

  if (playerNameInput) {
    playerNameInput.value = currentPlayerName === "Guest" ? "" : currentPlayerName;
  }

  updateHud();
}

function saveCurrentPlayerName() {
  if (!playerNameInput) return;

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

  if (target.requestFullscreen) {
    await target.requestFullscreen();
  } else if (target.webkitRequestFullscreen) {
    await target.webkitRequestFullscreen();
  } else if (target.msRequestFullscreen) {
    await target.msRequestFullscreen();
  }
}

async function exitFullscreen() {
  if (document.exitFullscreen) {
    await document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    await document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    await document.msExitFullscreen();
  }
}

function updateFullscreenButton() {
  if (!fullscreenButton) return;
  fullscreenButton.textContent = isFullscreenActive() ? "Exit Fullscreen" : "Fullscreen";
}

async function toggleFullscreen() {
  try {
    if (isFullscreenActive()) {
      await exitFullscreen();
    } else {
      await enterFullscreen();
    }
  } catch (error) {
    console.log("Fullscreen unavailable:", error);
  }
  updateFullscreenButton();
}

document.addEventListener("mousemove", (e) => {
  if (!gameStarted || gamePaused) return;
  moveBear(e.clientX);
});

gameArea.addEventListener("touchstart", (e) => {
  if (!gameStarted || gamePaused) return;

  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  const touch = e.touches[0];
  lastPointerX = touch.clientX;
  moveBear(touch.clientX);
});

gameArea.addEventListener("touchmove", (e) => {
  if (!gameStarted || gamePaused) return;

  e.preventDefault();

  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  const touch = e.touches[0];
  moveBear(touch.clientX);
});

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

pauseButton.addEventListener("click", pauseGame);

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
      if (index === q.correct) {
        playCorrectSound();
        score += 1;
        bearScale = Math.min(bearScale + 0.08, 1.8);
        updateBearScale();
        updateHud();
        celebrateBear(650);
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

  lives--;
  bearScale = Math.max(0.8, bearScale - 0.05);
  updateBearScale();
  updateHud();

  if (lives <= 0) {
    showGameOver();
  }
}

function awardHeart() {
  playHeartSound();

  if (lives < 4) {
    lives++;
  } else {
    score += 3;
  }

  celebrateBear(500);
  updateHud();

  if (score >= levelGoal) {
    showLevelComplete();
  }
}

function showGameOver() {gamePaused = true;
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
  setBearSprite("happy");
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

  updateLevelGoal();
  spawnRate = Math.max(430, spawnRate - 45);
  updateHud();
  clearStars();

  clearInterval(starSpawner);
  gamePaused = false;
  pauseButton.textContent = "Pause";
  pauseOverlay.classList.add("hidden");
  returnBearToIdle();
  starSpawner = setInterval(createItem, spawnRate);
  bgMusic.play().catch(() => {});
}

nextLevelButton.addEventListener("click", nextLevel);

function restartGame() {
  gameOverBox.classList.add("hidden");
  startFreshGame();
}

restartButton.addEventListener("click", restartGame);

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
    speed = 4;
    dx = Math.random() > 0.5 ? 1.3 : -1.3;
  } else if (itemType === "bad") {
    item.classList.add("badStar");
    item.innerText = "🔴";
    speed = 4.6 + (currentLevel - 1) * 0.3;
    dx = Math.random() > 0.5 ? 1.8 : -1.8;
  } else {
    item.classList.add("star");
    item.innerText = "⭐";
    speed = 4 + (currentLevel - 1) * 0.3;
    dx = Math.random() > 0.5 ? 1.5 : -1.5;
  }

  item.style.left = x + "px";
  item.style.top = y + "px";
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

    item.style.top = y + "px";
    item.style.left = x + "px";

    const itemRect = item.getBoundingClientRect();
    const hitbox = getBearHitbox(itemType);

    const hit =
      itemRect.bottom >= hitbox.top &&
      itemRect.top <= hitbox.bottom &&
      itemRect.left < hitbox.right &&
      itemRect.right > hitbox.left;

    if (hit) {
      item.remove();
      clearInterval(fall);

      if (itemType === "bad") {
        loseLife();
        return;
      }

      if (itemType === "heart") {
        awardHeart();
        return;
      }

      if (itemType === "bonus") {
        playBonusSound();
        addPurplePower(1);
        score += 2;
        bearScale = Math.min(bearScale + 0.03, 1.8);
        updateBearScale();
        updateHud();
        celebrateBear(450);

        if (score >= levelGoal) {
          showLevelComplete();
        }
        return;
      }

      if (itemType === "learning") {
        playStarSound();
        showBearPose("reach", 180);
        score += 1;
        updateHud();
        pendingLevelCheckAfterQuestion = true;
        showQuestion();
        return;
      }

      playStarSound();
      showBearPose("reach", 180);
      score += 1;
      updateHud();

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
  startScreen.classList.add("hidden");
  questionBox.classList.add("hidden");
  levelBox.classList.add("hidden");
  gameOverBox.classList.add("hidden");
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
  magnetActive = false;
  capeActive = false;
  crownActive = false;
  speedWrapActive = false;
  updatePowerClasses();

  updateLevelGoal();
  spawnRate = 950;

  lastPointerX = null;
  lastMoveDirection = 0;

  bear.classList.remove("powered");
  bear.classList.remove("running");

  updateBearScale();
  updateHud();

  pauseButton.textContent = "Pause";
  idleFrameToggle = false;
  setBearSprite("idle1");

  bgMusic.currentTime = 0;
  bgMusic.play().catch(() => {});

  starSpawner = setInterval(createItem, spawnRate);
}

startButton.addEventListener("click", startFreshGame);

if (fullscreenButton) {
  fullscreenButton.addEventListener("click", toggleFullscreen);
  document.addEventListener("fullscreenchange", updateFullscreenButton);
  document.addEventListener("webkitfullscreenchange", updateFullscreenButton);
  document.addEventListener("msfullscreenchange", updateFullscreenButton);
}

setInterval(() => {
  if (!gameStarted || gamePaused) return;
  if (questionBox && !questionBox.classList.contains("hidden")) return;
  if (levelBox && !levelBox.classList.contains("hidden")) return;
  if (gameOverBox && !gameOverBox.classList.contains("hidden")) return;

  idleFrameToggle = !idleFrameToggle;
  returnBearToIdle();
}, 700);

setInterval(() => {
  if (!gameStarted || gamePaused) return;
  if (Math.random() < 0.35) {
    showBearPose("blink", 180);
  }
}, 3200);

loadPlayerData();
updateLevelGoal();
updateHud();
updateFullscreenButton();