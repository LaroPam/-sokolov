(() => {
  // Assets
  const SPRITE_SOURCES = {
    playerIdle: './assets/player_idle.svg',
    playerWalk1: './assets/player_walk1.svg',
    playerWalk2: './assets/player_walk2.svg',
    playerAttack: './assets/player_attack.svg',
    playerHurt: './assets/player_hurt.svg',
    glitch1: './assets/enemy_glitch_1.svg',
    glitch2: './assets/enemy_glitch_2.svg',
    leech1: './assets/enemy_leech_1.svg',
    leech2: './assets/enemy_leech_2.svg',
    crawler1: './assets/enemy_crawler_1.svg',
    crawler2: './assets/enemy_crawler_2.svg',
    wraith1: './assets/enemy_wraith_1.svg',
    wraith2: './assets/enemy_wraith_2.svg',
    projectileShard: './assets/projectile_shard.svg',
    projectileArc: './assets/projectile_arc.svg',
    orbitalCore: './assets/orbital_core.svg',
    backgroundTile: './assets/background_tile.svg',
  };

  const SPRITE_SETS = {
    player: {
      idle: ['playerIdle'],
      walk: ['playerWalk1', 'playerWalk2'],
      attack: ['playerAttack'],
      hurt: ['playerHurt'],
    },
    enemies: {
      glitchBug: ['glitch1', 'glitch2'],
      dataLeech: ['leech1', 'leech2'],
      corruptedCrawler: ['crawler1', 'crawler2'],
      nullWraith: ['wraith1', 'wraith2'],
    },
    projectiles: {
      shard: 'projectileShard',
      arc: 'projectileArc',
    },
    orbitals: {
      default: 'orbitalCore',
    },
    background: 'backgroundTile',
  };

  const loadImage = (src) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  async function loadAssets() {
    const cache = {};
    await Promise.all(
      Object.entries(SPRITE_SOURCES).map(([key, src]) =>
        loadImage(src)
          .then((img) => {
            cache[key] = img;
          })
          .catch((err) => console.warn('Asset load failed', key, err)),
      ),
    );
    return { images: cache, sets: SPRITE_SETS };
  }

  // Utils
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const normalize = (x, y) => {
    const len = Math.hypot(x, y) || 1;
    return { x: x / len, y: y / len };
  };
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  class Projectile {
    constructor({ x, y, vx, vy, damage, lifespan = 1.5, sprite = 'shard', rotation = 0 }) {
      this.position = { x, y };
      this.velocity = { x: vx, y: vy };
      this.damage = damage;
      this.lifespan = lifespan;
      this.sprite = sprite;
      this.rotation = rotation;
      this.isAlive = true;
    }
    update(dt) {
      if (!this.isAlive) return;
      this.position.x += this.velocity.x * dt;
      this.position.y += this.velocity.y * dt;
      this.rotation += dt * 8;
      this.lifespan -= dt;
      if (this.lifespan <= 0) this.isAlive = false;
    }
  }

  const ENEMY_TYPES = {
    glitchBug: {
      speed: 100,
      health: 22,
      damage: 7,
      size: 18,
      rewardXp: 10,
    },
    dataLeech: {
      speed: 65,
      health: 36,
      damage: 12,
      size: 20,
      rewardXp: 14,
    },
    corruptedCrawler: {
      speed: 42,
      health: 70,
      damage: 18,
      size: 26,
      rewardXp: 20,
    },
    nullWraith: {
      speed: 85,
      health: 40,
      damage: 15,
      size: 22,
      rewardXp: 18,
    },
  };

  class Enemy {
    constructor(type, position, difficulty = 1) {
      const stats = ENEMY_TYPES[type] || ENEMY_TYPES.glitchBug;
      this.type = type;
      this.position = { ...position };
      this.speed = stats.speed * Math.max(0.9, difficulty * 0.95);
      this.maxHealth = stats.health * difficulty;
      this.health = this.maxHealth;
      this.damage = stats.damage * (0.7 + difficulty * 0.18);
      this.size = stats.size;
      this.rewardXp = Math.round(stats.rewardXp * (0.9 + difficulty * 0.12));
      this.hurtTimer = 0;
      this.walkCycle = 0;
      this.isAlive = true;
    }
    update(dt, playerPos) {
      if (!this.isAlive) return;
      const dx = playerPos.x - this.position.x;
      const dy = playerPos.y - this.position.y;
      const dir = normalize(dx, dy);
      this.position.x += dir.x * this.speed * dt;
      this.position.y += dir.y * this.speed * dt;
      this.walkCycle += dt * (this.speed / 80);
      this.hurtTimer = Math.max(0, this.hurtTimer - dt);
    }
    takeDamage(amount) {
      this.health -= amount;
      this.hurtTimer = 0.25;
      if (this.health <= 0) this.isAlive = false;
    }
  }

  class Player {
    constructor(x, y) {
      this.position = { x, y };
      this.velocity = { x: 0, y: 0 };
      this.health = 140;
      this.maxHealth = 140;
      this.level = 1;
      this.experience = 0;
      this.experienceToLevel = 45;
      this.attackTimer = 0;
      this.hurtTimer = 0;
      this.attackFlash = 0;
      this.walkCycle = 0;
      this.stats = {
        speed: 170,
        damage: 12,
        attackRadius: 280,
        attackCooldown: 0.9,
        mitigation: 0,
        projectileSpeed: 340,
      };
      this.weapon = {
        count: 1,
        spread: 0.12,
        projectile: 'shard',
      };
      this.orbitals = [];
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
      const moveMag = Math.hypot(this.velocity.x, this.velocity.y);
      if (moveMag > 5) this.walkCycle += dt * (moveMag / 70);
      this.attackTimer = Math.max(0, this.attackTimer - dt);
      this.hurtTimer = Math.max(0, this.hurtTimer - dt);
      this.attackFlash = Math.max(0, this.attackFlash - dt);
      this.orbitals.forEach((orb) => {
        orb.angle += dt * orb.speed;
      });
    }
    tryAttack(target) {
      if (!target || this.attackTimer > 0 || !this.isAlive) return [];
      this.attackTimer = this.stats.attackCooldown;
      this.attackFlash = 0.22;
      const dx = target.position.x - this.position.x;
      const dy = target.position.y - this.position.y;
      const baseAngle = Math.atan2(dy, dx);
      const shots = [];
      const count = this.weapon.count;
      const spread = this.weapon.spread;
      for (let i = 0; i < count; i++) {
        const offset = spread * ((i / (count - 1 || 1)) - 0.5);
        const angle = baseAngle + offset;
        const dir = { x: Math.cos(angle), y: Math.sin(angle) };
        shots.push(
          new Projectile({
            x: this.position.x,
            y: this.position.y,
            vx: dir.x * this.stats.projectileSpeed,
            vy: dir.y * this.stats.projectileSpeed,
            damage: this.stats.damage,
            lifespan: 1.7,
            sprite: this.weapon.projectile || 'shard',
            rotation: angle,
          }),
        );
      }
      return shots;
    }
    addOrbital({ radius = 70, speed = 2, damage = 8, sprite = 'default' }) {
      this.orbitals.push({ angle: Math.random() * Math.PI * 2, radius, speed, damage, sprite });
    }
    takeDamage(amount) {
      const mitigated = amount * (1 - this.stats.mitigation);
      this.health = clamp(this.health - mitigated, 0, this.maxHealth);
      this.hurtTimer = 0.35;
      if (this.health <= 0) this.isAlive = false;
    }
    gainExperience(amount, onLevelUp) {
      this.experience += amount;
      while (this.experience >= this.experienceToLevel) {
        this.experience -= this.experienceToLevel;
        this.level += 1;
        this.experienceToLevel = Math.round(this.experienceToLevel * 1.15 + 20);
        if (onLevelUp) onLevelUp();
      }
    }
  }

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

  class Renderer {
    constructor(container, assets) {
      this.container = container;
      this.assets = assets;
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
      this.container.appendChild(this.canvas);
      this.camera = { x: 0, y: 0 };
      this.bgNoise = this.createNoisePattern();
      this.tilePattern = null;
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
      this.ctx.font = '20px "Courier New", monospace';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
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
      this.ctx.fillStyle = '#050510';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.globalAlpha = 0.5;
      this.ctx.fillStyle = this.bgNoise;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.globalAlpha = 1;
      this.ctx.fillStyle = `rgba(0,255,200,0.08)`;
      const pulse = 10 + Math.sin(time * 0.5) * 5;
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
    drawSprite(image, x, y, { scale = 1, alpha = 1, rotation = 0 } = {}) {
      if (!image) return;
      this.ctx.save();
      this.ctx.translate(x, y);
      this.ctx.rotate(rotation);
      this.ctx.globalAlpha = alpha;
      const w = image.width * scale;
      const h = image.height * scale;
      this.ctx.drawImage(image, -w / 2, -h / 2, w, h);
      this.ctx.restore();
    }
    drawPlayer(player, spriteSets) {
      const { x, y } = this.worldToScreen(player.position);
      const bob = Math.sin(player.walkCycle * 8) * 3;
      const set = spriteSets.player;
      let frame = this.assets.images[set.walk[Math.floor(player.walkCycle * 6) % set.walk.length]];
      if (player.hurtTimer > 0) {
        frame = this.assets.images[set.hurt[0]];
      } else if (player.attackFlash > 0) {
        frame = this.assets.images[set.attack[0]];
      } else if (Math.abs(player.velocity.x) < 2 && Math.abs(player.velocity.y) < 2) {
        frame = this.assets.images[set.idle[0]];
      }
      this.drawSprite(frame, x, y + bob, { scale: 1.5 });
      player.orbitals.forEach((orb) => {
        const ox = x + Math.cos(orb.angle) * orb.radius;
        const oy = y + Math.sin(orb.angle) * orb.radius;
        const orbKey = spriteSets.orbitals[orb.sprite] || spriteSets.orbitals.default;
        const orbImg = this.assets.images[orbKey];
        this.drawSprite(orbImg, ox, oy, { scale: 1, alpha: 0.95 });
      });
    }
    drawEnemy(enemy, spriteSets) {
      const { x, y } = this.worldToScreen(enemy.position);
      const bob = Math.sin(enemy.walkCycle * 8) * 2;
      const frames = spriteSets.enemies[enemy.type] || spriteSets.enemies.glitchBug;
      const frame = this.assets.images[frames[Math.floor(enemy.walkCycle * 4) % frames.length]];
      const alpha = enemy.hurtTimer > 0 ? 0.7 : 1;
      this.drawSprite(frame, x, y + bob, { scale: 1.5, alpha });
    }
    drawProjectile(projectile, spriteSets) {
      const { x, y } = this.worldToScreen(projectile.position);
      const spriteKey = spriteSets.projectiles[projectile.sprite] || spriteSets.projectiles.shard;
      const img = this.assets.images[spriteKey];
      this.drawSprite(img, x, y, { scale: 1.2, rotation: projectile.rotation || 0 });
    }
    drawBackground(center) {
      if (!this.tilePattern) {
        const tileImg = this.assets.images[this.assets.sets.background];
        if (tileImg) {
          const off = document.createElement('canvas');
          off.width = tileImg.width;
          off.height = tileImg.height;
          const ctx = off.getContext('2d');
          ctx.drawImage(tileImg, 0, 0);
          this.tilePattern = this.ctx.createPattern(off, 'repeat');
        }
      }
      if (!this.tilePattern) return;
      this.ctx.save();
      this.ctx.translate(this.canvas.width / 2 - (center.x % 128), this.canvas.height / 2 - (center.y % 128));
      this.ctx.fillStyle = this.tilePattern;
      this.ctx.globalAlpha = 0.75;
      this.ctx.fillRect(-128, -128, this.canvas.width + 256, this.canvas.height + 256);
      this.ctx.restore();
    }
  }

  class SpawnSystem {
    constructor() {
      this.reset();
    }
    reset() {
      this.timer = 1.6;
    }
    update(dt, elapsed, spawnFn, playerPos) {
      this.timer -= dt;
      const difficulty = 1 + elapsed / 120;
      const interval = Math.max(0.6, 1.8 - elapsed / 90);
      if (this.timer <= 0) {
        this.timer = interval;
        const count = 1 + Math.floor(elapsed / 35);
        for (let i = 0; i < count; i++) {
          const enemy = this.createEnemy(difficulty, playerPos);
          spawnFn(enemy);
        }
      }
    }
    createEnemy(difficulty, playerPos) {
      const roll = Math.random();
      let type = 'glitchBug';
      if (roll > 0.82) type = 'corruptedCrawler';
      else if (roll > 0.6) type = 'dataLeech';
      else if (roll > 0.38) type = 'nullWraith';
      const angle = Math.random() * Math.PI * 2;
      const dist = 440 + Math.random() * 160;
      const position = {
        x: playerPos.x + Math.cos(angle) * dist,
        y: playerPos.y + Math.sin(angle) * dist,
      };
      const eliteBoost = Math.random() < 0.12 ? 1.5 : 1;
      return new Enemy(type, position, difficulty * eliteBoost);
    }
  }

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

  class UpgradeSystem {
    constructor() {
      this.createPool();
    }
    reset() {
      this.createPool();
    }
    createPool() {
      this.options = [
        {
          title: 'Сверхскорость',
          description: '+20% к скорости перемещения',
          apply: (player) => {
            player.stats.speed *= 1.2;
          },
        },
        {
          title: 'Оптимизация кода',
          description: '-18% к перезарядке автоатаки',
          apply: (player) => {
            player.stats.attackCooldown *= 0.82;
          },
        },
        {
          title: 'Усиленные пакеты',
          description: '+25% к урону снарядов',
          apply: (player) => {
            player.stats.damage *= 1.25;
          },
        },
        {
          title: 'Расширенная зона',
          description: '+18% к радиусу автоатаки',
          apply: (player) => {
            player.stats.attackRadius *= 1.18;
          },
        },
        {
          title: 'Патч регенерации',
          description: 'Мгновенно восстанавливает 45 HP и увеличивает максимум на 20',
          apply: (player) => {
            player.maxHealth += 20;
            player.health = Math.min(player.maxHealth, player.health + 45);
          },
        },
        {
          title: 'Орбитальные искры',
          description: 'Добавляет импульсный разряд вокруг игрока каждые 3.5 секунды',
          apply: (player, game) => {
            if (!game.orbitTimer) game.orbitTimer = 0;
            const originalUpdate = player.update.bind(player);
            player.update = (dt, input) => {
              originalUpdate(dt, input);
              game.orbitTimer += dt;
              if (game.orbitTimer >= 3.5) {
                game.orbitTimer = 0;
                game.entities.enemies.forEach((enemy) => {
                  if (!enemy.isAlive) return;
                  const dist = Math.hypot(enemy.position.x - player.position.x, enemy.position.y - player.position.y);
                  if (dist < 160) {
                    enemy.takeDamage(player.stats.damage * 1.5);
                  }
                });
              }
            };
          },
        },
        {
          title: 'Электрический разряд',
          description: 'При попадании снаряда цепная искра наносит 45% урона еще одной цели',
          apply: (player, game) => {
            game.chainLightning = true;
          },
        },
        {
          title: 'ASCII-дробовик',
          description: 'Автоатака выпускает +1 символ с небольшим разбросом',
          apply: (player) => {
            player.weapon.count = Math.min(player.weapon.count + 1, 4);
            player.weapon.spread += 0.06;
          },
        },
        {
          title: 'Стабильная сборка',
          description: '-12% входящего урона, +10% к максимуму HP',
          apply: (player) => {
            player.stats.mitigation = Math.min(0.35, player.stats.mitigation + 0.12);
            player.maxHealth = Math.round(player.maxHealth * 1.1);
            player.health = Math.min(player.maxHealth, player.health + 15);
          },
        },
        {
          title: 'Орбитальный дрон',
          description: 'Добавляет дрон-* вокруг героя, наносящий урон в ближнем бою',
          apply: (player) => {
            player.addOrbital({ radius: 78, speed: 2.4, damage: player.stats.damage * 0.5, sprite: 'default' });
          },
        },
        {
          title: 'Глитч-щит',
          description: '+20% к скорости снарядов, +1 к количеству снарядов, короткий свечащийся барьер',
          apply: (player) => {
            player.stats.projectileSpeed *= 1.2;
            player.weapon.count = Math.min(player.weapon.count + 1, 4);
            player.addOrbital({ radius: 48, speed: 3.6, damage: player.stats.damage * 0.35, sprite: 'default' });
          },
        },
        {
          title: 'Глитч-магнит',
          description: '+25% к радиусу автоатаки и небольшой авто-лечащий тик',
          apply: (player) => {
            player.stats.attackRadius *= 1.25;
            const originalUpdate = player.update.bind(player);
            player.update = (dt, input) => {
              originalUpdate(dt, input);
              player.health = Math.min(player.maxHealth, player.health + dt * 2.5);
            };
          },
        },
      ];
    }
    getChoices() {
      const shuffled = [...this.options].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 3);
    }
  }

  class Game {
    constructor({ container, statsEl, timerEl, upgradePanel, onGameOver, assets }) {
      this.container = container;
      this.statsEl = statsEl;
      this.timerEl = timerEl;
      this.upgradePanel = upgradePanel;
      this.onGameOver = onGameOver;
      this.assets = assets;
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
      const newProjectiles = player.tryAttack(target, dt);
      newProjectiles.forEach((p) => projectiles.push(p));
      enemies.forEach((enemy) => enemy.update(dt, player.position));
      projectiles.forEach((proj) => proj.update(dt));
      this.applyOrbitals(player, enemies, dt);
      CollisionSystem.handleProjectiles(projectiles, enemies, (enemy, damage) => {
        enemy.takeDamage(damage);
        if (this.chainLightning) {
          const secondary = enemies.find((other) => other !== enemy && other.isAlive && distance(other.position, enemy.position) < 220);
          if (secondary) {
            secondary.takeDamage(damage * 0.45);
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
    }
  }

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

  const handler = () => {
    if (isBooting || startScreen.style.display === 'none') return;
    isBooting = true;
    startButton.disabled = true;
    if (!assetsPromise) assetsPromise = loadAssets();
    startButton.textContent = 'Загрузка ассетов...';
    hideStart();
    assetsPromise
      .then((assets) => {
        startButton.textContent = 'Запуск';
        if (game) game.destroy();
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
})();
