// Jungle Math Dash Game
// All code commented so kids can learn!

const timerEl = document.getElementById('timer');
const questionEl = document.getElementById('question');
const answersEl = document.getElementById('answers');
const monkeyEl = document.getElementById('monkey');
const modal = document.getElementById('modal');
const modalMessage = document.getElementById('modal-message');
const restartBtn = document.getElementById('restart');

// Game state
let timeLeft = 60; // seconds
let plank = 0; // monkey position
const maxPlank = 10; // number of planks across bridge
let countdownInterval;

// Simple sound using Web Audio API
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

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
  const a = Math.floor(Math.random() * 21); // 0-20
  const b = Math.floor(Math.random() * 21);
  const add = Math.random() < 0.5; // decide addition or subtraction
  const correct = add ? a + b : a - b;
  const op = add ? '+' : '-';

  questionEl.textContent = `${a} ${op} ${b} = ?`;

  // Build answers
  const options = new Set([correct]);
  while (options.size < 3) {
    const distractor = correct + Math.floor(Math.random() * 11) - 5; // +/-5 range
    options.add(distractor);
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
    plank = Math.min(plank + 1, maxPlank);
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
  const pixels = plank * 20; // 20px per plank
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
  if (plank >= maxPlank) {
    endGame(true);
  }
}

// End game with win/lose
function endGame(win) {
  clearInterval(countdownInterval);
  modal.classList.remove('hidden');
  modalMessage.textContent = win ? 'You Win!' : 'Try Again!';
}

// Restart the game
function restart() {
  modal.classList.add('hidden');
  timeLeft = 60;
  plank = 0;
  timerEl.textContent = timeLeft;
  moveMonkey();
  newQuestion();
  startTimer();
}

restartBtn.addEventListener('click', restart);

// Start on page load
window.addEventListener('load', restart);
