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
const bossBar = document.getElementById('boss-bar');

let game = null;
let isBooting = false;
// Lazy-init assets so the weapon picker is always the first thing the player
// sees; build the cache only after a loadout is chosen.
let assetsPromise = null;
let selectedWeapon = null;
const weaponCardRefs = [];

function updateWeaponHint() {
  const weaponName = WEAPON_DEFS.find((w) => w.id === selectedWeapon)?.name;
  weaponHint.textContent = weaponName
    ? `Выбрано: ${weaponName}`
    : 'Выбери стартовое оружие';
}

function selectWeapon(weaponId, card) {
  selectedWeapon = weaponId;
  updateWeaponHint();
  weaponChoices.querySelectorAll('.weapon-card').forEach((el) => el.classList.remove('selected'));
  if (card) card.classList.add('selected');
  const ref = weaponCardRefs.find((refCard) => refCard.id === weaponId);
  if (!card && ref?.card) ref.card.classList.add('selected');
  if (!isBooting) {
    startButton.disabled = false;
    startButton.textContent = 'Запуск';
  }
}

function renderWeaponChoices() {
  if (!weaponChoices) return;
  weaponCardRefs.length = 0;
  weaponChoices.innerHTML = '';
  WEAPON_DEFS.forEach((weapon, index) => {
    const card = document.createElement('button');
    card.className = 'weapon-card';
    card.innerHTML = `
      <div class="weapon-hotkey">${index + 1}</div>
      <img src="${weapon.icon}" alt="${weapon.id}" />
      <div class="weapon-title">${weapon.name}</div>
      <div class="weapon-desc">${weapon.description}</div>
    `;
    const select = () => selectWeapon(weapon.id, card);
    card.addEventListener('click', select);
    weaponChoices.appendChild(card);
    weaponCardRefs.push({ id: weapon.id, card });
  });
}

function showStart(message = '') {
  isBooting = false;
  startButton.disabled = !selectedWeapon;
  startButton.textContent = selectedWeapon ? 'Запуск' : 'Выбери оружие';
  startScreen.style.display = 'flex';
  runSummary.textContent = message || 'Сначала выбери оружие на панели выше';
  updateWeaponHint();
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
  const handler = async () => {
    if (isBooting || startScreen.style.display === 'none') return;
    if (!selectedWeapon) {
      runSummary.textContent = 'Выбери оружие, чтобы начать';
      return;
    }
    isBooting = true;
    startButton.disabled = true;
    if (!assetsPromise) assetsPromise = loadAssets();
    runSummary.textContent = 'Готовлю мир...';
    startButton.textContent = 'Загрузка...';

    try {
      const assets = await assetsPromise;
      // If loading somehow returned null, regenerate assets synchronously.
      const readyAssets = assets || (await loadAssets());
      startButton.textContent = 'Запуск';
      hideStart();

      if (game) {
        game.destroy();
      }

      game = new Game({
        container,
        statsEl,
        timerEl,
        upgradePanel,
        assets: readyAssets,
        weaponId: selectedWeapon,
        weaponBadge,
        bossBar,
        onGameOver: ({ timeSurvived, kills }) => {
          showStart(`Пробег: ${formatTime(timeSurvived)} • Врагов уничтожено: ${kills}`);
        },
      });

      game.start();
    } catch (err) {
      console.error('Не удалось инициализировать игру', err);
      runSummary.textContent = 'Не удалось загрузить ассеты';
      startButton.textContent = 'Запуск';
      startButton.disabled = false;
    } finally {
      isBooting = false;
    }
  };

  startButton.addEventListener('click', handler);
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Enter' || e.code === 'Space') {
      handler();
    }

    if (startScreen.style.display !== 'none') {
      const key = e.key;
      if (key >= '1' && key <= '4') {
        const idx = Number(key) - 1;
        const weapon = WEAPON_DEFS[idx];
        if (weapon) {
          selectWeapon(weapon.id, weaponCardRefs[idx]?.card);
        }
      }
    }
  });
}

attachStartListeners();
renderWeaponChoices();
updateWeaponHint();
runSummary.textContent = 'Сначала выбери оружие на панели выше';
startButton.disabled = !selectedWeapon;
startButton.textContent = selectedWeapon ? 'Запуск' : 'Выбери оружие';
