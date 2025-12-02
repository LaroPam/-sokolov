import Renderer from './engine/renderer.js';
import Input from './engine/input.js';
import GameLoop from './engine/loop.js';
import Player from './entities/player.js';
import SpawnSystem from './systems/spawnSystem.js';
import CollisionSystem from './systems/collisionSystem.js';
import UpgradeSystem from './systems/upgradeSystem.js';
import { distance } from './utils/math.js';

class Game {
  constructor({ container, statsEl, timerEl, upgradePanel, onGameOver }) {
    this.container = container;
    this.statsEl = statsEl;
    this.timerEl = timerEl;
    this.upgradePanel = upgradePanel;
    this.onGameOver = onGameOver;

    this.renderer = new Renderer(container);
    this.input = new Input();
    this.loop = new GameLoop({
      update: (dt) => this.update(dt),
      render: () => this.draw(),
    });

    this.upgradeSystem = new UpgradeSystem();
    this.spawnSystem = new SpawnSystem();

    this.entities = {
      player: null,
      enemies: [],
      projectiles: [],
    };

    this.elapsed = 0;
    this.kills = 0;
    this.state = 'idle';
    this.chainLightning = false;
    this.orbitTimer = 0;
  }

  start() {
    this.reset();
    this.loop.start();
  }

  reset() {
    this.entities.player = new Player(0, 0);
    this.entities.enemies = [];
    this.entities.projectiles = [];
    this.spawnSystem.reset();
    this.upgradeSystem.reset();
    this.upgradePanel.style.display = 'none';
    this.upgradePanel.innerHTML = '';
    this.chainLightning = false;
    this.orbitTimer = 0;
    this.elapsed = 0;
    this.kills = 0;
    this.state = 'playing';
  }

  destroy() {
    this.loop.stop();
    this.input.destroy();
    this.renderer.destroy();
  }

  pause() {
    this.state = 'paused';
  }

  resume() {
    this.state = 'playing';
  }

  update(dt) {
    if (this.state === 'paused') return;
    const { player, enemies, projectiles } = this.entities;
    this.elapsed += dt;

    player.update(dt, this.input);

    this.spawnSystem.update(dt, this.elapsed, (enemy) => enemies.push(enemy), player.position);

    const target = this.findNearestEnemy(player, enemies);
    const newProjectile = player.tryAttack(target, dt);
    if (newProjectile) {
      projectiles.push(newProjectile);
    }

    enemies.forEach((enemy) => enemy.update(dt, player.position));
    projectiles.forEach((proj) => proj.update(dt));

    CollisionSystem.handleProjectiles(projectiles, enemies, (enemy, damage) => {
      enemy.takeDamage(damage);
      if (this.chainLightning) {
        const secondary = enemies.find((other) => other !== enemy && other.isAlive);
        if (secondary) {
          secondary.takeDamage(damage * 0.4);
        }
      }
      if (!enemy.isAlive) {
        this.kills += 1;
        player.gainExperience(enemy.rewardXp, () => this.onLevelUp());
      }
    });

    CollisionSystem.handlePlayer(enemies, player, (enemy) => player.takeDamage(enemy.damage * dt));

    this.cleanup();
    this.updateHud();

    if (!player.isAlive) {
      this.endRun();
    }
  }

  draw() {
    const { player, enemies, projectiles } = this.entities;
    this.renderer.clear(player.position, this.elapsed);
    this.renderer.drawBackground(this.elapsed, player.position);
    enemies.forEach((enemy) => this.renderer.drawEnemy(enemy));
    projectiles.forEach((proj) => this.renderer.drawProjectile(proj));
    this.renderer.drawPlayer(player);
  }

  cleanup() {
    const { enemies, projectiles } = this.entities;
    this.entities.enemies = enemies.filter((enemy) => enemy.isAlive);
    this.entities.projectiles = projectiles.filter((proj) => proj.isAlive);
  }

  findNearestEnemy(player, enemies) {
    let nearest = null;
    let nearestDist = Infinity;
    for (const enemy of enemies) {
      const d = distance(player.position, enemy.position);
      if (d < nearestDist) {
        nearestDist = d;
        nearest = enemy;
      }
    }
    if (nearest && nearestDist <= player.stats.attackRadius) {
      return nearest;
    }
    return null;
  }

  onLevelUp() {
    this.pause();
    const options = this.upgradeSystem.getChoices();
    this.showUpgradePanel(options);
  }

  showUpgradePanel(options) {
    this.upgradePanel.innerHTML = '';
    this.upgradePanel.style.display = 'flex';
    options.forEach((opt) => {
      const card = document.createElement('div');
      card.className = 'upgrade-card';
      card.innerHTML = `<strong>${opt.title}</strong><div style="margin-top:6px; font-size:13px;">${opt.description}</div>`;
      card.addEventListener('click', () => {
        opt.apply(this.entities.player, this);
        this.upgradePanel.style.display = 'none';
        this.resume();
      });
      this.upgradePanel.appendChild(card);
    });
  }

  endRun() {
    this.state = 'ended';
    this.loop.stop();
    const timeSurvived = Math.round(this.elapsed);
    if (this.onGameOver) {
      this.onGameOver({ timeSurvived, kills: this.kills });
    }
  }

  updateHud() {
    const { player } = this.entities;
    this.statsEl.textContent = `HP: ${player.health.toFixed(0)} | Урон: ${player.stats.damage.toFixed(1)} | Скорость: ${player.stats.speed.toFixed(0)} | Уровень: ${player.level}`;
    this.timerEl.textContent = `Время: ${Math.floor(this.elapsed)}с | EXP: ${player.experience.toFixed(0)}/${player.experienceToLevel}`;
  }
}

export default Game;
