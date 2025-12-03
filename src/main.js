import Game from './game.js';
import { loadAssets } from './assets.js';
import { WEAPON_DEFS } from './data/weapons.js';

const startScreen = document.getElementById('start-screen');
const startButton = document.getElementById('start-button');
const runSummary = document.getElementById('run-summary');
const container = document.getElementById('game-container');
const statsEl = document.getElementById('stats');
const timerEl = document.getElementById('timer');
const upgradePanel = document.getElementById('upgrade-panel');
const weaponChoices = document.getElementById('weapon-choices');
const weaponHint = document.getElementById('weapon-hint');
const weaponBadge = document.getElementById('weapon-badge');

let game = null;
let isBooting = false;
let assetsPromise = null;
let selectedWeapon = null;

function renderWeaponChoices() {
  if (!weaponChoices) return;
  weaponChoices.innerHTML = '';
  WEAPON_DEFS.forEach((weapon) => {
    const card = document.createElement('button');
    card.className = 'weapon-card';
    card.innerHTML = `
      <img src="${weapon.icon}" alt="${weapon.id}" />
      <div class="weapon-title">${weapon.name}</div>
      <div class="weapon-desc">${weapon.description}</div>
    `;
    card.addEventListener('click', () => {
      selectedWeapon = weapon.id;
      weaponHint.textContent = `Выбрано: ${weapon.name}`;
      weaponChoices.querySelectorAll('.weapon-card').forEach((el) => el.classList.remove('selected'));
      card.classList.add('selected');
      if (!isBooting) startButton.disabled = false;
    });
    weaponChoices.appendChild(card);
  });
}

function showStart(message = '') {
  isBooting = false;
  startButton.disabled = !selectedWeapon;
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
    if (!selectedWeapon) {
      runSummary.textContent = 'Выбери оружие, чтобы начать';
      return;
    }
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
          weaponId: selectedWeapon,
          weaponBadge,
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
renderWeaponChoices();
startButton.disabled = true;
