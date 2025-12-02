(() => {
  // utils/math.js
  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }
  function normalize(x, y) {
    const len = Math.hypot(x, y) || 1;
    return { x: x / len, y: y / len };
  }
  function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  // engine/input.js
  class Input {
    constructor() {
      this.keys = new Set();
      this.handleKeyDown = (e) => this.onKeyDown(e);
      this.handleKeyUp = (e) => this.onKeyUp(e);
      window.addEventListener('keydown', this.handleKeyDown);
      window.addEventListener('keyup', this.handleKeyUp);
    }
    onKeyDown(event) {
      const key = event.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright'].includes(key)) {
        this.keys.add(key);
      }
    }
    onKeyUp(event) {
      const key = event.key.toLowerCase();
      this.keys.delete(key);
    }
    destroy() {
      window.removeEventListener('keydown', this.handleKeyDown);
      window.removeEventListener('keyup', this.handleKeyUp);
    }
    getDirection() {
      const up = this.keys.has('w') || this.keys.has('arrowup');
      const down = this.keys.has('s') || this.keys.has('arrowdown');
      const left = this.keys.has('a') || this.keys.has('arrowleft');
      const right = this.keys.has('d') || this.keys.has('arrowright');
      return { up, down, left, right };
    }
  }

  // engine/loop.js
  class GameLoop {
    constructor({ update, render }) {
      this.update = update;
      this.render = render;
      this.running = false;
      this.lastTime = 0;
      this.rafId = null;
    }
    start() {
      if (this.running) return;
      this.running = true;
      this.lastTime = performance.now();
      const step = (time) => {
        if (!this.running) return;
        const dt = Math.min((time - this.lastTime) / 1000, 0.05);
        this.lastTime = time;
        this.update(dt);
        this.render();
        this.rafId = requestAnimationFrame(step);
      };
      this.rafId = requestAnimationFrame(step);
    }
    stop() {
      this.running = false;
      if (this.rafId) cancelAnimationFrame(this.rafId);
    }
  }

  // engine/renderer.js
  class Renderer {
    constructor(container) {
      this.container = container;
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
      this.container.appendChild(this.canvas);
      this.camera = { x: 0, y: 0 };
      this.bgNoise = this.createNoisePattern();
      this.resize();
      this.handleResize = () => this.resize();
      window.addEventListener('resize', this.handleResize);
    }
    destroy() {
      window.removeEventListener('resize', this.handleResize);
      this.container.removeChild(this.canvas);
    }
    resize() {
      this.canvas.width = this.container.clientWidth;
      this.canvas.height = this.container.clientHeight;
    }
    createNoisePattern() {
      const off = document.createElement('canvas');
      off.width = 80;
      off.height = 80;
      const c = off.getContext('2d');
      const imageData = c.createImageData(off.width, off.height);
      for (let i = 0; i < imageData.data.length; i += 4) {
        const v = Math.random() * 80;
        imageData.data[i] = 0;
        imageData.data[i + 1] = v;
        imageData.data[i + 2] = v;
        imageData.data[i + 3] = 40;
      }
      c.putImageData(imageData, 0, 0);
      return this.ctx.createPattern(off, 'repeat');
    }
    clear(center, time) {
      this.camera.x = center.x;
      this.camera.y = center.y;
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.globalAlpha = 1;
      this.ctx.fillStyle = '#070914';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.globalAlpha = 0.5;
      this.ctx.fillStyle = this.bgNoise;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.globalAlpha = 1;
      this.ctx.fillStyle = `rgba(0,255,200,0.1)`;
      const pulse = 8 + Math.sin(time * 0.5) * 4;
      for (let x = 0; x < this.canvas.width; x += 64) {
        for (let y = 0; y < this.canvas.height; y += 64) {
          this.ctx.fillRect(x, y, pulse, 1);
          this.ctx.fillRect(x, y, 1, pulse);
        }
      }
    }
    worldToScreen(pos) {
      const x = this.canvas.width / 2 + (pos.x - this.camera.x);
      const y = this.canvas.height / 2 + (pos.y - this.camera.y);
      return { x, y };
    }
    drawPlayer(player) {
      const { x, y } = this.worldToScreen(player.position);
      const size = 24;
      const jitter = Math.sin(performance.now() / 80) * 1.5;
      this.ctx.fillStyle = '#0ff';
      this.ctx.fillRect(x - size / 2, y - size / 2, size, size);
      this.ctx.strokeStyle = '#f0f';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(x - size / 2 - jitter, y - size / 2 + jitter, size, size);
    }
    drawEnemy(enemy) {
      const { x, y } = this.worldToScreen(enemy.position);
      const size = enemy.size;
      this.ctx.fillStyle = enemy.color;
      this.ctx.fillRect(x - size / 2, y - size / 2, size, size);
      this.ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      this.ctx.strokeRect(x - size / 2, y - size / 2, size, size);
    }
    drawProjectile(projectile) {
      const { x, y } = this.worldToScreen(projectile.position);
      const size = 8;
      this.ctx.fillStyle = '#8df';
      this.ctx.beginPath();
      this.ctx.arc(x, y, size / 2, 0, Math.PI * 2);
      this.ctx.fill();
    }
    drawBackground(time, center) {
      this.ctx.save();
      this.ctx.translate(this.canvas.width / 2 - (center.x % 200), this.canvas.height / 2 - (center.y % 200));
      const colors = ['#0c1824', '#0f1f30', '#0a1420'];
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          this.ctx.fillStyle = colors[(i + j + Math.round(time)) % colors.length];
          this.ctx.fillRect(i * 200, j * 200, 200, 200);
        }
      }
      this.ctx.restore();
    }
  }

  // entities/projectile.js
  class Projectile {
    constructor({ x, y, vx, vy, damage, lifespan = 1.5 }) {
      this.position = { x, y };
      this.velocity = { x: vx, y: vy };
      this.damage = damage;
      this.lifespan = lifespan;
      this.isAlive = true;
    }
    update(dt) {
      if (!this.isAlive) return;
      this.position.x += this.velocity.x * dt;
      this.position.y += this.velocity.y * dt;
      this.lifespan -= dt;
      if (this.lifespan <= 0) this.isAlive = false;
    }
  }

  // entities/enemy.js
  const ENEMY_TYPES = {
    glitchBug: { speed: 110, health: 24, damage: 8, color: '#ff5cf4', size: 18, rewardXp: 10 },
    dataLeech: { speed: 70, health: 42, damage: 14, color: '#7cff5c', size: 22, rewardXp: 16 },
    corruptedCrawler: { speed: 45, health: 90, damage: 20, color: '#ffb23f', size: 26, rewardXp: 22 },
  };
  class Enemy {
    constructor(type, position, difficulty = 1) {
      const stats = ENEMY_TYPES[type] || ENEMY_TYPES.glitchBug;
      this.type = type;
      this.position = { ...position };
      this.speed = stats.speed * difficulty;
      this.maxHealth = stats.health * difficulty;
      this.health = this.maxHealth;
      this.damage = stats.damage * (0.8 + difficulty * 0.2);
      this.color = stats.color;
      this.size = stats.size;
      this.rewardXp = Math.round(stats.rewardXp * difficulty);
      this.isAlive = true;
    }
    update(dt, playerPos) {
      if (!this.isAlive) return;
      const dx = playerPos.x - this.position.x;
      const dy = playerPos.y - this.position.y;
      const dir = normalize(dx, dy);
      this.position.x += dir.x * this.speed * dt;
      this.position.y += dir.y * this.speed * dt;
    }
    takeDamage(amount) {
      this.health -= amount;
      if (this.health <= 0) this.isAlive = false;
    }
  }

  // entities/player.js
  class Player {
    constructor(x, y) {
      this.position = { x, y };
      this.velocity = { x: 0, y: 0 };
      this.health = 120;
      this.maxHealth = 120;
      this.level = 1;
      this.experience = 0;
      this.experienceToLevel = 50;
      this.attackTimer = 0;
      this.stats = { speed: 170, damage: 14, attackRadius: 260, attackCooldown: 0.9 };
      this.isAlive = true;
    }
    update(dt, input) {
      if (!this.isAlive) return;
      const dir = input.getDirection();
      const axis = { x: 0, y: 0 };
      if (dir.up) axis.y -= 1;
      if (dir.down) axis.y += 1;
      if (dir.left) axis.x -= 1;
      if (dir.right) axis.x += 1;
      const n = normalize(axis.x, axis.y);
      this.velocity.x = n.x * this.stats.speed;
      this.velocity.y = n.y * this.stats.speed;
      this.position.x += this.velocity.x * dt;
      this.position.y += this.velocity.y * dt;
      this.attackTimer = Math.max(0, this.attackTimer - dt);
    }
    tryAttack(target) {
      if (!target || this.attackTimer > 0 || !this.isAlive) return null;
      this.attackTimer = this.stats.attackCooldown;
      const dx = target.position.x - this.position.x;
      const dy = target.position.y - this.position.y;
      const dir = normalize(dx, dy);
      const speed = 320;
      return new Projectile({ x: this.position.x, y: this.position.y, vx: dir.x * speed, vy: dir.y * speed, damage: this.stats.damage, lifespan: 1.6 });
    }
    takeDamage(amount) {
      this.health = clamp(this.health - amount, 0, this.maxHealth);
      if (this.health <= 0) this.isAlive = false;
    }
    gainExperience(amount, onLevelUp) {
      this.experience += amount;
      while (this.experience >= this.experienceToLevel) {
        this.experience -= this.experienceToLevel;
        this.level += 1;
        this.experienceToLevel = Math.round(this.experienceToLevel * 1.2 + 20);
        if (onLevelUp) onLevelUp();
      }
    }
  }

  // systems/spawnSystem.js
  class SpawnSystem {
    constructor() { this.reset(); }
    reset() { this.timer = 0; }
    update(dt, elapsed, spawnFn, playerPos) {
      this.timer -= dt;
      const difficulty = 1 + elapsed / 80;
      const interval = Math.max(0.35, 1.4 - elapsed / 60);
      if (this.timer <= 0) {
        this.timer = interval;
        const count = 1 + Math.floor(elapsed / 25);
        for (let i = 0; i < count; i++) {
          spawnFn(this.createEnemy(difficulty, playerPos));
        }
      }
    }
    createEnemy(difficulty, playerPos) {
      const roll = Math.random();
      let type = 'glitchBug';
      if (roll > 0.8) type = 'corruptedCrawler';
      else if (roll > 0.5) type = 'dataLeech';
      const angle = Math.random() * Math.PI * 2;
      const dist = 420 + Math.random() * 140;
      const position = { x: playerPos.x + Math.cos(angle) * dist, y: playerPos.y + Math.sin(angle) * dist };
      const eliteBoost = Math.random() < 0.15 ? 1.6 : 1;
      return new Enemy(type, position, difficulty * eliteBoost);
    }
  }

  // systems/collisionSystem.js
  class CollisionSystem {
    static handleProjectiles(projectiles, enemies, onHit) {
      projectiles.forEach((proj) => {
        if (!proj.isAlive) return;
        for (const enemy of enemies) {
          if (!enemy.isAlive) continue;
          if (distance(proj.position, enemy.position) < enemy.size) {
            proj.isAlive = false;
            if (onHit) onHit(enemy, proj.damage);
            break;
          }
        }
      });
    }
    static handlePlayer(enemies, player, onTouch) {
      for (const enemy of enemies) {
        if (!enemy.isAlive) continue;
        const hitRadius = enemy.size + 14;
        if (distance(enemy.position, player.position) < hitRadius) {
          if (onTouch) onTouch(enemy);
        }
      }
    }
  }

  // systems/upgradeSystem.js
  class UpgradeSystem {
    constructor() { this.createPool(); }
    reset() { this.createPool(); }
    createPool() {
      this.options = [
        { title: 'Сверхскорость', description: '+20% к скорости перемещения', apply: (player) => { player.stats.speed *= 1.2; } },
        { title: 'Оптимизация кода', description: '-15% к перезарядке автоатаки', apply: (player) => { player.stats.attackCooldown *= 0.85; } },
        { title: 'Усиленные пакеты', description: '+25% к урону снарядов', apply: (player) => { player.stats.damage *= 1.25; } },
        { title: 'Расширенная зона', description: '+18% к радиусу автоатаки', apply: (player) => { player.stats.attackRadius *= 1.18; } },
        { title: 'Патч регенерации', description: 'Мгновенно восстанавливает 35 HP и увеличивает максимум на 15', apply: (player) => { player.maxHealth += 15; player.health = Math.min(player.maxHealth, player.health + 35); } },
        {
          title: 'Орбитальные искры',
          description: 'Добавляет импульсный разряд вокруг игрока каждые 4 секунды',
          apply: (player, game) => {
            if (!game.orbitTimer) game.orbitTimer = 0;
            const originalUpdate = player.update.bind(player);
            player.update = (dt, input) => {
              originalUpdate(dt, input);
              game.orbitTimer += dt;
              if (game.orbitTimer >= 4) {
                game.orbitTimer = 0;
                game.entities.enemies.forEach((enemy) => {
                  if (!enemy.isAlive) return;
                  const dist = Math.hypot(enemy.position.x - player.position.x, enemy.position.y - player.position.y);
                  if (dist < 140) enemy.takeDamage(player.stats.damage * 1.5);
                });
              }
            };
          },
        },
        { title: 'Электрический разряд', description: 'При попадании снаряда цепная искра наносит 40% урона еще одной цели', apply: (player, game) => { game.chainLightning = true; } },
      ];
    }
    getChoices() {
      const shuffled = [...this.options].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 3);
    }
  }

  // game.js (non-module)
  class Game {
    constructor({ container, statsEl, timerEl, upgradePanel, onGameOver }) {
      this.container = container;
      this.statsEl = statsEl;
      this.timerEl = timerEl;
      this.upgradePanel = upgradePanel;
      this.onGameOver = onGameOver;
      this.renderer = new Renderer(container);
      this.input = new Input();
      this.loop = new GameLoop({ update: (dt) => this.update(dt), render: () => this.draw() });
      this.upgradeSystem = new UpgradeSystem();
      this.spawnSystem = new SpawnSystem();
      this.entities = { player: null, enemies: [], projectiles: [] };
      this.elapsed = 0;
      this.kills = 0;
      this.state = 'idle';
      this.chainLightning = false;
      this.orbitTimer = 0;
    }
    start() { this.reset(); this.loop.start(); }
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
    destroy() { this.loop.stop(); this.input.destroy(); this.renderer.destroy(); }
    pause() { this.state = 'paused'; }
    resume() { this.state = 'playing'; }
    update(dt) {
      if (this.state === 'paused') return;
      const { player, enemies, projectiles } = this.entities;
      this.elapsed += dt;
      player.update(dt, this.input);
      this.spawnSystem.update(dt, this.elapsed, (enemy) => enemies.push(enemy), player.position);
      const target = this.findNearestEnemy(player, enemies);
      const newProjectile = player.tryAttack(target, dt);
      if (newProjectile) projectiles.push(newProjectile);
      enemies.forEach((enemy) => enemy.update(dt, player.position));
      projectiles.forEach((proj) => proj.update(dt));
      CollisionSystem.handleProjectiles(projectiles, enemies, (enemy, dmg) => {
        enemy.takeDamage(dmg);
        if (this.chainLightning) {
          const secondary = enemies.find((other) => other !== enemy && other.isAlive);
          if (secondary) secondary.takeDamage(dmg * 0.4);
        }
        if (!enemy.isAlive) {
          this.kills += 1;
          player.gainExperience(enemy.rewardXp, () => this.onLevelUp());
        }
      });
      CollisionSystem.handlePlayer(enemies, player, (enemy) => player.takeDamage(enemy.damage * dt));
      this.cleanup();
      this.updateHud();
      if (!player.isAlive) this.endRun();
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
        if (d < nearestDist) { nearestDist = d; nearest = enemy; }
      }
      return nearest && nearestDist <= player.stats.attackRadius ? nearest : null;
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
      if (this.onGameOver) this.onGameOver({ timeSurvived, kills: this.kills });
    }
    updateHud() {
      const { player } = this.entities;
      this.statsEl.textContent = `HP: ${player.health.toFixed(0)} | Урон: ${player.stats.damage.toFixed(1)} | Скорость: ${player.stats.speed.toFixed(0)} | Уровень: ${player.level}`;
      this.timerEl.textContent = `Время: ${Math.floor(this.elapsed)}с | EXP: ${player.experience.toFixed(0)}/${player.experienceToLevel}`;
    }
  }

  // main.js replacement for file://
  function bootOffline() {
    const startScreen = document.getElementById('start-screen');
    const startButton = document.getElementById('start-button');
    const runSummary = document.getElementById('run-summary');
    const container = document.getElementById('game-container');
    const statsEl = document.getElementById('stats');
    const timerEl = document.getElementById('timer');
    const upgradePanel = document.getElementById('upgrade-panel');
    let game = null;
    let isBooting = false;

    const showStart = (message = '') => {
      isBooting = false;
      startButton.disabled = false;
      startScreen.style.display = 'flex';
      runSummary.textContent = message;
    };
    const hideStart = () => { startScreen.style.display = 'none'; };
    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
      return `${mins}:${secs}`;
    };

    const handler = () => {
      if (isBooting || startScreen.style.display === 'none') return;
      isBooting = true;
      startButton.disabled = true;
      hideStart();
      if (game) game.destroy();
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
      if (e.code === 'Enter' || e.code === 'Space') handler();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootOffline);
  } else {
    bootOffline();
  }
})();
