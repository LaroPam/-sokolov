import Game from './game.js';
import { loadAssets } from './assets.js';

const startScreen = document.getElementById('start-screen');
const startButton = document.getElementById('start-button');
const runSummary = document.getElementById('run-summary');
const container = document.getElementById('game-container');
const statsEl = document.getElementById('stats');
const timerEl = document.getElementById('timer');
const upgradePanel = document.getElementById('upgrade-panel');

let game = null;
let isBooting = false;
let assetsPromise = null;

function showStart(message = '') {
  isBooting = false;
  startButton.disabled = false;
  startButton.textContent = 'Запуск';
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
    if (!assetsPromise) {
      assetsPromise = loadAssets();
    }
    startButton.textContent = 'Загрузка ассетов...';
    hideStart();

    assetsPromise
      .then((assets) => {
        startButton.textContent = 'Запуск';
        if (game) {
          game.destroy();
        }

        game = new Game({
          container,
          statsEl,
          timerEl,
          upgradePanel,
          assets,
          onGameOver: ({ timeSurvived, kills }) => {
            showStart(`Пробег: ${formatTime(timeSurvived)} • Врагов уничтожено: ${kills}`);
          },
        });

        game.start();
      })
      .catch(() => {
        showStart('Не удалось загрузить ассеты');
      });
  };

  startButton.addEventListener('click', handler);
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Enter' || e.code === 'Space') {
      handler();
    }
  });
}

attachStartListeners();
