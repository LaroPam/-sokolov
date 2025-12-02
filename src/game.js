import Renderer from './engine/renderer.js';
import Input from './engine/input.js';
import Loop from './engine/loop.js';
import { createPlayer } from './entities/player.js';
import { createProjectile } from './entities/projectile.js';
import SpawnSystem from './systems/spawnSystem.js';
import CollisionSystem from './systems/collisionSystem.js';
import UpgradeSystem from './systems/upgradeSystem.js';
import { distance } from './utils/math.js';

class Game {
  constructor({ container, upgradePanel, statsEl, timerEl }) {
    this.container = container;
    this.renderer = new Renderer(container);
    this.input = new Input();
    this.loop = new Loop(this.update.bind(this));
    this.upgradeSystem = new UpgradeSystem(upgradePanel, (upgrade) => this.applyUpgrade(upgrade));

    this.statsEl = statsEl;
    this.timerEl = timerEl;

    // Game state
    this.entities = {
      player: null,
      enemies: [],
      projectiles: [],
    };
    this.spawnSystem = new SpawnSystem();
    this.collisionSystem = new CollisionSystem();
    this.isGameOver = false;
    this.elapsed = 0;
  }

  async start() {
    await this.renderer.init();
    this.reset();
    this.loop.start();
  }

  reset() {
    this.isGameOver = false;
    this.elapsed = 0;
    this.renderer.reset();
    this.entities = { player: null, enemies: [], projectiles: [] };

    this.entities.player = createPlayer(this.renderer);
    this.spawnSystem.reset();
    this.upgradeSystem.reset();
  }

  update(delta) {
    if (this.isGameOver) return;
    const { player, enemies, projectiles } = this.entities;
    const deltaSeconds = delta / 1000;
    this.elapsed += deltaSeconds;

    // Update UI
    this.timerEl.textContent = `Время: ${this.elapsed.toFixed(1)}s`;
    this.statsEl.textContent = `HP: ${Math.ceil(player.health)} | Урон: ${player.damage} | Скорость: ${player.speed} | Уровень: ${player.level} (${player.xp}/${player.nextLevelXp})`;

    // Update player movement
    player.update(deltaSeconds, this.input.movement);
    this.renderer.centerCamera(player.position);

    // Auto attack logic
    player.attackCooldown -= delta;
    if (player.attackCooldown <= 0 && enemies.length > 0) {
      const target = this.findClosestEnemy(player.position, enemies);
      if (target) {
        const projectile = createProjectile(
          player.position,
          target,
          player.damage,
          player.bulletSize,
          this.renderer,
        );
        projectiles.push(projectile);
        player.attackCooldown = player.attackDelay;
      }
    }

    // Update projectiles
    for (const projectile of [...projectiles]) {
      projectile.update(deltaSeconds);
      if (projectile.life <= 0) {
        projectile.destroy();
        projectiles.splice(projectiles.indexOf(projectile), 1);
      }
    }

    // Spawn enemies
    const newEnemies = this.spawnSystem.update(deltaSeconds, this.elapsed, this.renderer, player);
    if (newEnemies.length) enemies.push(...newEnemies);

    // Update enemies
    for (const enemy of [...enemies]) {
      enemy.update(deltaSeconds, player.position);
      if (enemy.health <= 0) {
        enemy.destroy();
        enemies.splice(enemies.indexOf(enemy), 1);
        player.gainXp(enemy.xpValue, () => this.upgradeSystem.offer(player));
      }
    }

    // Passive skills from upgrades
    this.applyPassiveSkills(deltaSeconds, player, enemies);

    // Collisions
    this.collisionSystem.handle(player, enemies, projectiles, () => this.onPlayerHit());

    // Draw
    this.renderer.render();

    // Lose condition
    if (player.health <= 0) {
      this.endRun();
    }
  }

  applyPassiveSkills(deltaSeconds, player, enemies) {
    // Orbital pulse
    if (player.orbital) {
      player.orbital.timer -= deltaSeconds;
      if (player.orbital.timer <= 0) {
        player.orbital.timer = 1.2;
        enemies.forEach((enemy) => {
          if (distance(player.position, enemy.position) <= player.orbital.radius) {
            enemy.applyDamage(player.orbital.damage);
          }
        });
      }
    }

    // Electric chain
    if (player.chain) {
      player.chain.timer -= deltaSeconds;
      if (player.chain.timer <= 0 && enemies.length) {
        const target = this.findClosestEnemy(player.position, enemies) || enemies[0];
        if (target) {
          target.applyDamage(player.chain.damage);
        }
        player.chain.timer = 2.4;
      }
    }
  }

  onPlayerHit() {
    // brief glitch flash
    this.renderer.flash();
  }

  endRun() {
    this.isGameOver = true;
    this.loop.stop();
    this.upgradeSystem.showDeathScreen(() => {
      this.reset();
      this.loop.start();
    });
  }

  findClosestEnemy(position, enemies) {
    let closest = null;
    let closestDist = Infinity;
    for (const enemy of enemies) {
      const d = distance(position, enemy.position);
      if (d < closestDist) {
        closest = enemy;
        closestDist = d;
      }
    }
    return closest && closestDist <= this.entities.player.attackRadius ? closest : null;
  }

  applyUpgrade(upgrade) {
    const player = this.entities.player;
    upgrade.apply(player);
  }
}

export default Game;
