import Game from './game.js';

// Entry point: bootstrap Pixi application and start game
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('game-container');
  const upgradePanel = document.getElementById('upgrade-panel');
  const statsEl = document.getElementById('stats');
  const timerEl = document.getElementById('timer');

  const game = new Game({ container, upgradePanel, statsEl, timerEl });
  game.start();
});
