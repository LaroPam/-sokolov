import Game from './game.js';

// Entry point: bootstrap Pixi application and start game
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('game-container');
  const upgradePanel = document.getElementById('upgrade-panel');
  const statsEl = document.getElementById('stats');
  const timerEl = document.getElementById('timer');
  const startScreen = document.getElementById('start-screen');
  const startButton = document.getElementById('start-button');

  let hasStarted = false;

  const launch = async () => {
    if (hasStarted) return;
    hasStarted = true;
    startButton.disabled = true;
    startButton.textContent = 'Загрузка...';
    startScreen.style.pointerEvents = 'none';
    startButton.removeEventListener('click', launch);
    startScreen.removeEventListener('click', launch);
    window.removeEventListener('keydown', handleStartKey);
    startScreen.style.display = 'none';
    const game = new Game({ container, upgradePanel, statsEl, timerEl });
    await game.start();
  };

  const handleStartKey = (e) => {
    if (e.code === 'Enter' || e.code === 'Space') {
      launch();
    }
  };

  startButton.addEventListener('click', launch);
  startScreen.addEventListener('click', launch);
  window.addEventListener('keydown', handleStartKey);
});
