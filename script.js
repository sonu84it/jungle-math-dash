// Jungle Math Dash Game
// All code commented so kids can learn!

const timerEl = document.getElementById('timer');
const questionEl = document.getElementById('question');
const answersEl = document.getElementById('answers');
const monkeyEl = document.getElementById('monkey');
const bridgeEl = document.getElementById('bridge');
const modal = document.getElementById('modal');
const modalMessage = document.getElementById('modal-message');
const restartBtn = document.getElementById('restart');
const scoreEl = document.getElementById('score');

// Game state
let timeLeft = 60; // seconds
const startPos = 0;
let finalPos = 0; // will be calculated based on bridge width
let plank = startPos; // monkey position
let countdownInterval;
let score = 0; // total correct answers
const plankWidth = 20; // pixels per plank

// Simple sound using Web Audio API
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

// Determine how many planks fit across the bridge
function calculateFinalPos() {
  finalPos = Math.floor((bridgeEl.clientWidth - plankWidth) / plankWidth);
}

function playTone(frequency) {
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  oscillator.start();
  gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
  oscillator.stop(audioCtx.currentTime + 0.2);
}

// Generate a new math question
function newQuestion() {
  // Difficulty increases as monkey advances across the bridge
  const level = Math.min(10, plank + 1); // 1-10 scale
  let a, b, correct, op;

  // Choose operation based on level
  const ops = level < 3 ? ['+'] : level < 5 ? ['+', '-'] : level < 7 ? ['+', '-', '*'] : ['+', '-', '*', '/'];
  op = ops[Math.floor(Math.random() * ops.length)];

  // Set number ranges by level
  const max = level * 5;

  if (op === '+') {
    a = Math.floor(Math.random() * (max + 1));
    b = Math.floor(Math.random() * (max + 1));
    correct = a + b;
  } else if (op === '-') {
    a = Math.floor(Math.random() * (max + 1));
    b = Math.floor(Math.random() * (a + 1)); // ensure positive result
    correct = a - b;
  } else if (op === '*') {
    a = Math.floor(Math.random() * (level + 1));
    b = Math.floor(Math.random() * (level + 1));
    correct = a * b;
  } else {
    b = Math.floor(Math.random() * level) + 1; // avoid 0
    correct = Math.floor(Math.random() * level) + 1;
    a = b * correct; // ensure integer division
  }

  questionEl.textContent = `${a} ${op} ${b} = ?`;

  // Build answers
  const options = new Set([correct]);
  while (options.size < 3) {
    const delta = Math.floor(Math.random() * 7) - 3; // close to correct answer
    options.add(correct + delta);
  }
  // Shuffle
  const arr = Array.from(options);
  arr.sort(() => Math.random() - 0.5);

  answersEl.innerHTML = '';
  arr.forEach((n) => {
    const btn = document.createElement('button');
    btn.textContent = n;
    btn.addEventListener('click', () => handleAnswer(n === correct));
    answersEl.appendChild(btn);
  });
}

// Handle answer click
function handleAnswer(correct) {
  if (correct) {
    plank = Math.min(plank + 1, finalPos);
    score++;
    scoreEl.textContent = score;
    playTone(600); // correct sound
  } else {
    plank = Math.max(plank - 1, 0);
    playTone(200); // wrong sound
  }
  moveMonkey();
  checkWin();
  newQuestion();
}

// Move monkey sprite along the bridge
function moveMonkey() {
  const pixels = plank * plankWidth; // move based on plank width
  monkeyEl.style.transform = `translateX(${pixels}px)`;
}

// Start countdown timer
function startTimer() {
  countdownInterval = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;
    if (timeLeft <= 0) {
      endGame(false);
    }
  }, 1000);
}

// Check if monkey reached end
function checkWin() {
  if (plank >= finalPos) {
    endGame(true);
  }
}

// End game with win/lose
function endGame(win) {
  clearInterval(countdownInterval);
  modal.classList.remove('hidden');
  modalMessage.textContent = (win ? 'You Win! ' : 'Try Again! ') + `Score: ${score}`;
}

// Restart the game
function restart() {
  modal.classList.add('hidden');
  timeLeft = 60;
  plank = startPos;
  score = 0;
  scoreEl.textContent = score;
  timerEl.textContent = timeLeft;
  calculateFinalPos();
  moveMonkey();
  newQuestion();
  startTimer();
}

restartBtn.addEventListener('click', restart);
window.addEventListener('resize', () => {
  calculateFinalPos();
  moveMonkey();
});

// Start on page load
window.addEventListener('load', restart);
