import Renderer from './engine/renderer.js';
import Input from './engine/input.js';
import GameLoop from './engine/loop.js';
import Player from './entities/player.js';
import Enemy from './entities/enemy.js';
import SpawnSystem from './systems/spawnSystem.js';
import CollisionSystem from './systems/collisionSystem.js';
import UpgradeSystem from './systems/upgradeSystem.js';
import { distance } from './utils/math.js';
import { getWeaponById } from './data/weapons.js';

class Game {
  constructor({ container, statsEl, timerEl, upgradePanel, onGameOver, assets, weaponId, weaponBadge, bossBar }) {
    this.container = container;
    this.statsEl = statsEl;
    this.timerEl = timerEl;
    this.upgradePanel = upgradePanel;
    this.onGameOver = onGameOver;
    this.assets = assets;
    this.weaponId = weaponId;
    this.weaponBadge = weaponBadge;
    this.bossBar = bossBar;

    this.renderer = new Renderer(container, assets);
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
    this.parryBuff = 0;
    this.parryMitigation = 0;
    this.baseMitigation = 0;
    this.activeBoss = null;
    this.nextBossTime = 300;
  }

  start() {
    this.reset();
    this.loop.start();
  }

  reset() {
    this.weaponDef = getWeaponById(this.weaponId);
    this.entities.player = new Player(0, 0, this.weaponDef);
    this.baseMitigation = this.entities.player.stats.mitigation;
    this.entities.enemies = [];
    this.entities.projectiles = [];
    this.spawnSystem.reset();
    this.upgradeSystem.configureForWeapon(this.weaponDef);
    this.upgradePanel.style.display = 'none';
    this.upgradePanel.innerHTML = '';
    this.chainLightning = false;
    this.orbitTimer = 0;
    this.parryBuff = 0;
    this.activeBoss = null;
    this.nextBossTime = 300;
    this.elapsed = 0;
    this.kills = 0;
    this.state = 'playing';
    this.updateBossBar();
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

    if (this.parryBuff > 0) {
      this.parryBuff -= dt;
      player.stats.mitigation = Math.min(0.6, this.baseMitigation + this.parryMitigation);
    } else {
      player.stats.mitigation = this.baseMitigation;
    }

    player.update(dt, this.input);

    this.spawnSystem.update(dt, this.elapsed, (enemy) => enemies.push(enemy), player.position, this.activeBoss);
    this.handleBossSpawn();

    const target = this.findNearestEnemy(player, enemies);
    const newProjectiles = player.tryAttack(target, enemies);
    newProjectiles.forEach((p) => projectiles.push(p));

    enemies.forEach((enemy) => enemy.update(dt, player.position));
    projectiles.forEach((proj) => proj.update(dt));

    this.applyOrbitals(player, enemies, dt);

    CollisionSystem.handleProjectiles(projectiles, enemies, (enemy, damage) => {
      enemy.takeDamage(damage);
      if (!enemy.isAlive) {
        this.kills += 1;
        if (enemy.isBoss) {
          this.activeBoss = null;
          this.updateBossBar();
          this.nextBossTime = this.elapsed + 300;
        }
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
    this.renderer.drawBackground(player.position);
    enemies.forEach((enemy) => this.renderer.drawEnemy(enemy, this.assets.sets));
    projectiles.forEach((proj) => this.renderer.drawProjectile(proj, this.assets.sets));
    this.renderer.drawPlayer(player, this.assets.sets);
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

  applyOrbitals(player, enemies, dt) {
    player.orbitals.forEach((orb) => {
      const ox = player.position.x + Math.cos(orb.angle) * orb.radius;
      const oy = player.position.y + Math.sin(orb.angle) * orb.radius;
      enemies.forEach((enemy) => {
        if (!enemy.isAlive) return;
        if (distance(enemy.position, { x: ox, y: oy }) < enemy.size + 8) {
          enemy.takeDamage(orb.damage * dt * 6);
        }
      });
    });
  }

  handleBossSpawn() {
    if (this.activeBoss && !this.activeBoss.isAlive) {
      this.activeBoss = null;
      this.nextBossTime = this.elapsed + 300;
    }
    if (this.activeBoss && this.activeBoss.isAlive) return;
    if (this.elapsed >= this.nextBossTime) {
      const playerPos = this.entities.player.position;
      const angle = Math.random() * Math.PI * 2;
      const distanceFromPlayer = 520;
      const position = {
        x: playerPos.x + Math.cos(angle) * distanceFromPlayer,
        y: playerPos.y + Math.sin(angle) * distanceFromPlayer,
      };
      this.activeBoss = new Enemy('graveLord', position, 1 + this.elapsed / 240);
      this.entities.enemies.push(this.activeBoss);
      this.nextBossTime = this.elapsed + 300;
      this.updateBossBar();
    }
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
    this.statsEl.textContent = `HP: ${player.health.toFixed(0)}/${player.maxHealth} | Урон: ${player.stats.damage.toFixed(1)} | Скорость: ${player.stats.speed.toFixed(0)} | Орбиты: ${player.orbitals.length}`;
    this.timerEl.textContent = `Время: ${Math.floor(this.elapsed)}с | EXP: ${player.experience.toFixed(0)}/${player.experienceToLevel}`;

    if (this.weaponBadge) {
      const { name, icon, id } = this.weaponDef || {};
      this.weaponBadge.querySelector('.weapon-name').textContent = name || 'Оружие';
      const iconEl = this.weaponBadge.querySelector('img');
      if (iconEl && icon) {
        iconEl.src = icon;
        iconEl.alt = id;
      }
    }

    this.updateBossBar();
  }

  updateBossBar() {
    if (!this.bossBar) return;
    const fill = this.bossBar.querySelector('.fill');
    const label = this.bossBar.querySelector('.label');
    if (this.activeBoss && this.activeBoss.isAlive) {
      const ratio = this.activeBoss.health / this.activeBoss.maxHealth;
      fill.style.width = `${Math.max(0, Math.min(1, ratio)) * 100}%`;
      label.textContent = 'Повелитель костей';
      this.bossBar.style.opacity = 1;
    } else {
      this.bossBar.style.opacity = 0;
      fill.style.width = '0%';
      label.textContent = '';
    }
  }
}

export default Game;
