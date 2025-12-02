import Game from './game.js';

const startScreen = document.getElementById('start-screen');
const startButton = document.getElementById('start-button');
const runSummary = document.getElementById('run-summary');
const container = document.getElementById('game-container');
const statsEl = document.getElementById('stats');
const timerEl = document.getElementById('timer');
const upgradePanel = document.getElementById('upgrade-panel');

let game = null;
let isBooting = false;

function showStart(message = '') {
  isBooting = false;
  startButton.disabled = false;
  startScreen.style.display = 'flex';
  runSummary.textContent = message;
}

function hideStart() {
  startScreen.style.display = 'none';
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

function attachStartListeners() {
  const handler = () => {
    if (isBooting || startScreen.style.display === 'none') return;
    isBooting = true;
    startButton.disabled = true;
    hideStart();

    if (game) {
      game.destroy();
    }

    game = new Game({
      container,
      statsEl,
      timerEl,
      upgradePanel,
      onGameOver: ({ timeSurvived, kills }) => {
        showStart(`Пробег: ${formatTime(timeSurvived)} • Врагов уничтожено: ${kills}`);
      },
    });

    game.start();
  };

  startButton.addEventListener('click', handler);
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Enter' || e.code === 'Space') {
      handler();
    }
  });
}

attachStartListeners();
