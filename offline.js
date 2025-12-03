(() => {
  // Assets
  const SPRITE_SOURCES = {
    playerIdle: './assets/player_idle.svg',
    playerWalk1: './assets/player_walk1.svg',
    playerWalk2: './assets/player_walk2.svg',
    playerAttack: './assets/player_attack.svg',
    playerHurt: './assets/player_hurt.svg',
    enemyUndead1: './assets/enemy_undead_1.svg',
    enemyUndead2: './assets/enemy_undead_2.svg',
    enemyVampire1: './assets/enemy_vampire_1.svg',
    enemyVampire2: './assets/enemy_vampire_2.svg',
    enemySkeleton1: './assets/enemy_skeleton_1.svg',
    enemySkeleton2: './assets/enemy_skeleton_2.svg',
    enemyBoss1: './assets/enemy_boss_1.svg',
    enemyBoss2: './assets/enemy_boss_2.svg',
    projectileSword: './assets/projectile_sword.svg',
    projectileKnife: './assets/projectile_knife.svg',
    projectileBolt: './assets/projectile_bolt.svg',
    projectileArrow: './assets/projectile_arrow.svg',
    projectileOrb: './assets/projectile_orb.svg',
    orbitalCore: './assets/orbital_core.svg',
    weaponSwordIcon: './assets/weapon_sword_icon.svg',
    weaponKnifeIcon: './assets/weapon_knife_icon.svg',
    weaponCrossbowIcon: './assets/weapon_crossbow_icon.svg',
    weaponBowIcon: './assets/weapon_bow_icon.svg',
    weaponStaffIcon: './assets/weapon_staff_icon.svg',
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
      undead: ['enemyUndead1', 'enemyUndead2'],
      vampire: ['enemyVampire1', 'enemyVampire2'],
      skeleton: ['enemySkeleton1', 'enemySkeleton2'],
      graveLord: ['enemyBoss1', 'enemyBoss2'],
    },
    projectiles: {
      sword: 'projectileSword',
      knife: 'projectileKnife',
      bolt: 'projectileBolt',
      arrow: 'projectileArrow',
      orb: 'projectileOrb',
    },
    orbitals: { default: 'orbitalCore' },
    icons: {
      sword: 'weaponSwordIcon',
      knife: 'weaponKnifeIcon',
      crossbow: 'weaponCrossbowIcon',
      bow: 'weaponBowIcon',
      staff: 'weaponStaffIcon',
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

  // Weapons
  const WEAPON_DEFS = [
    {
      id: 'sword',
      name: 'Клинок стража',
      description: 'Ближний sweeping удар. Высокий урон, но нужно подойти к врагам.',
      icon: './assets/weapon_sword_icon.svg',
      stats: { damage: 26, attackCooldown: 0.95, attackRadius: 210, projectileSpeed: 0, speed: 190 },
      weapon: { kind: 'melee', arc: 1.35, range: 130, count: 1, sprite: 'sword' },
      startingOrbitals: 0,
      upgrades: [
        { title: 'Широкий размах', description: '+25% шире дуга клинка и небольшой push к скорости', apply: (p) => { p.weapon.arc *= 1.25; p.stats.speed += 10; } },
        { title: 'Закалённая сталь', description: '+20% к урону меча', apply: (p) => { p.stats.damage *= 1.2; } },
        { title: 'Укороченная стойка', description: '-18% к перезарядке удара', apply: (p) => { p.stats.attackCooldown *= 0.82; } },
        { title: 'Парирование', description: 'После удара получаете 10% уворота (митиг.) на 3с', apply: (p, g) => { g.parryBuff = 3; g.parryMitigation = 0.1; } },
      ],
    },
    {
      id: 'knife',
      name: 'Метательные клинки',
      description: 'Быстрые ножи вылетают один за другим, пробивая щели в орде.',
      icon: './assets/weapon_knife_icon.svg',
      stats: { damage: 12, attackCooldown: 0.55, attackRadius: 320, projectileSpeed: 420 },
      weapon: { kind: 'ranged', count: 1, spread: 0.08, projectile: 'knife', lifespan: 1.6, pierce: 0 },
      startingOrbitals: 0,
      upgrades: [
        { title: 'Двойной выпад', description: '+1 нож в очереди, плотнее конус', apply: (p) => { p.weapon.count = Math.min(p.weapon.count + 1, 4); p.weapon.spread = Math.max(0.05, p.weapon.spread - 0.015); } },
        { title: 'Отточенные лезвия', description: '+25% к урону ножей', apply: (p) => { p.stats.damage *= 1.25; } },
        { title: 'Быстрый бросок', description: '-15% к перезарядке', apply: (p) => { p.stats.attackCooldown *= 0.85; } },
        { title: 'Теневой шаг', description: '+12% скорости передвижения', apply: (p) => { p.stats.speed *= 1.12; } },
      ],
    },
    {
      id: 'crossbow',
      name: 'Арбалетный болт',
      description: 'Медленный, но тяжелый выстрел, проходящий насквозь.',
      icon: './assets/weapon_crossbow_icon.svg',
      stats: { damage: 34, attackCooldown: 1.25, attackRadius: 360, projectileSpeed: 520 },
      weapon: { kind: 'ranged', count: 1, spread: 0, projectile: 'bolt', lifespan: 2.2, pierce: 2 },
      startingOrbitals: 0,
      upgrades: [
        { title: 'Проникающий наконечник', description: '+2 к пронзанию', apply: (p) => { p.weapon.pierce = (p.weapon.pierce || 0) + 2; } },
        { title: 'Тяжёлое плечо', description: '+30% к урону болтов', apply: (p) => { p.stats.damage *= 1.3; } },
        { title: 'Перезарядка на бедре', description: '-16% к перезарядке', apply: (p) => { p.stats.attackCooldown *= 0.84; } },
        { title: 'Дубовая колодка', description: '+25 к максимуму здоровья', apply: (p) => { p.maxHealth += 25; p.health += 25; } },
      ],
    },
    {
      id: 'bow',
      name: 'Лучные залпы',
      description: 'Несколько медленных стрел летят дугой, расчищая коридор.',
      icon: './assets/weapon_bow_icon.svg',
      stats: { damage: 11, attackCooldown: 1.05, attackRadius: 360, projectileSpeed: 340 },
      weapon: { kind: 'ranged', count: 3, spread: 0.35, projectile: 'arrow', lifespan: 1.8, pierce: 1 },
      startingOrbitals: 0,
      upgrades: [
        { title: 'Дополнительная тетива', description: '+1 стрела в залпе', apply: (p) => { p.weapon.count = Math.min(p.weapon.count + 1, 5); } },
        { title: 'Усиленное перо', description: '+15% урона и +10% скорости стрел', apply: (p) => { p.stats.damage *= 1.15; p.stats.projectileSpeed *= 1.1; } },
        { title: 'Быстрый взвод', description: '-14% к перезарядке', apply: (p) => { p.stats.attackCooldown *= 0.86; } },
        { title: 'Дальний прицел', description: '+20% радиуса автоатаки', apply: (p) => { p.stats.attackRadius *= 1.2; } },
      ],
    },
    {
      id: 'staff',
      name: 'Жезл искр',
      description: 'Медленные сферы взрываются и цепляют группу врагов.',
      icon: './assets/weapon_staff_icon.svg',
      stats: { damage: 16, attackCooldown: 1, attackRadius: 340, projectileSpeed: 260 },
      weapon: { kind: 'ranged', count: 1, spread: 0.08, projectile: 'orb', lifespan: 2, splashRadius: 80, pierce: 0 },
      startingOrbitals: 1,
      upgrades: [
        { title: 'Второй заряд', description: '+1 сфера и чуть шире конус', apply: (p) => { p.weapon.count = Math.min(p.weapon.count + 1, 3); p.weapon.spread += 0.06; } },
        { title: 'Вспышка некера', description: '+25% к радиусу взрыва', apply: (p) => { p.weapon.splashRadius = Math.round((p.weapon.splashRadius || 60) * 1.25); } },
        { title: 'Ткань заклинателя', description: '-15% к перезарядке и +1 орбитальный дух', apply: (p) => { p.stats.attackCooldown *= 0.85; p.addOrbital({ radius: 90, speed: 2.2, damage: p.stats.damage * 0.6, sprite: 'default' }); } },
        { title: 'Сжатая мана', description: '+20% к урону сфер', apply: (p) => { p.stats.damage *= 1.2; } },
      ],
    },
  ];
  const getWeaponById = (id) => WEAPON_DEFS.find((w) => w.id === id) || WEAPON_DEFS[0];

  // Renderer
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
        const v = 20 + Math.random() * 90;
        imageData.data[i] = 30;
        imageData.data[i + 1] = v;
        imageData.data[i + 2] = 40;
        imageData.data[i + 3] = 45;
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
      this.ctx.fillStyle = '#0b0f12';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.globalAlpha = 0.45;
      this.ctx.fillStyle = this.bgNoise;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.globalAlpha = 1;
      this.ctx.fillStyle = `rgba(80,110,96,0.15)`;
      const pulse = 6 + Math.sin(time * 0.6) * 3;
      for (let x = 0; x < this.canvas.width; x += 72) {
        for (let y = 0; y < this.canvas.height; y += 72) {
          this.ctx.fillRect(x, y, pulse, 1.5);
          this.ctx.fillRect(x, y, 1.5, pulse);
        }
      }
    }
    worldToScreen(pos) {
      return { x: this.canvas.width / 2 + (pos.x - this.camera.x), y: this.canvas.height / 2 + (pos.y - this.camera.y) };
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
      if (player.hurtTimer > 0) frame = this.assets.images[set.hurt[0]];
      else if (player.attackFlash > 0) frame = this.assets.images[set.attack[0]];
      else if (Math.abs(player.velocity.x) < 2 && Math.abs(player.velocity.y) < 2) frame = this.assets.images[set.idle[0]];
      this.drawSprite(frame, x, y + bob, { scale: 1.6 });
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
      const frames = spriteSets.enemies[enemy.type] || spriteSets.enemies.undead;
      const frame = this.assets.images[frames[Math.floor(enemy.walkCycle * 4) % frames.length]];
      const alpha = enemy.hurtTimer > 0 ? 0.7 : 1;
      const scale = enemy.isBoss ? 2.1 : 1.5;
      this.drawSprite(frame, x, y + bob, { scale, alpha });
    }
    drawProjectile(projectile, spriteSets) {
      const { x, y } = this.worldToScreen(projectile.position);
      const spriteKey = spriteSets.projectiles[projectile.sprite] || spriteSets.projectiles.arrow;
      const img = this.assets.images[spriteKey];
      const scale = projectile.kind === 'melee' ? 1.9 : 1.2;
      this.drawSprite(img, x, y, { scale, rotation: projectile.rotation || 0, alpha: 0.95 });
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
      this.ctx.globalAlpha = 0.8;
      this.ctx.fillRect(-128, -128, this.canvas.width + 256, this.canvas.height + 256);
      this.ctx.restore();
    }
  }

  // Input & loop
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
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright'].includes(key)) this.keys.add(key);
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

  // Entities
  class Projectile {
    constructor({ x, y, vx, vy, damage, lifespan = 1.5, sprite = 'sword', rotation = 0, pierce = 0, splashRadius = 0, kind = 'ranged', arc = 0, owner = null, follow = false }) {
      this.position = { x, y };
      this.velocity = { x: vx, y: vy };
      this.damage = damage;
      this.lifespan = lifespan;
      this.sprite = sprite;
      this.rotation = rotation;
      this.pierce = pierce;
      this.splashRadius = splashRadius;
      this.kind = kind;
      this.arc = arc;
      this.owner = owner;
      this.follow = follow;
      this.isAlive = true;
    }
    update(dt) {
      if (!this.isAlive) return;
      if (this.follow && this.owner) {
        this.position.x = this.owner.position.x;
        this.position.y = this.owner.position.y;
      } else {
        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;
      }
      if (this.kind !== 'melee') this.rotation += dt * 6;
      this.lifespan -= dt;
      if (this.lifespan <= 0) this.isAlive = false;
    }
  }

  const ENEMY_TYPES = {
    undead: { speed: 70, health: 32, damage: 8, size: 18, rewardXp: 9 },
    vampire: { speed: 95, health: 60, damage: 14, size: 22, rewardXp: 16 },
    skeleton: { speed: 80, health: 18, damage: 7, size: 16, rewardXp: 6 },
    graveLord: { speed: 70, health: 800, damage: 28, size: 38, rewardXp: 150, isBoss: true },
  };
  class Enemy {
    constructor(type, position, difficulty = 1) {
      const stats = ENEMY_TYPES[type] || ENEMY_TYPES.undead;
      this.type = type;
      this.position = { ...position };
      const diffScale = Math.max(0.8, 0.9 + difficulty * 0.12);
      this.speed = stats.speed * diffScale;
      this.maxHealth = stats.health * (stats.isBoss ? difficulty * 1.4 : difficulty);
      this.health = this.maxHealth;
      this.damage = stats.damage * (0.8 + difficulty * 0.15);
      this.size = stats.size;
      this.rewardXp = Math.round(stats.rewardXp * (0.9 + difficulty * 0.1));
      this.isBoss = !!stats.isBoss;
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
    constructor(x, y, weaponDef) {
      this.position = { x, y };
      this.velocity = { x: 0, y: 0 };
      this.health = 160;
      this.maxHealth = 160;
      this.level = 1;
      this.experience = 0;
      this.experienceToLevel = 45;
      this.attackTimer = 0;
      this.hurtTimer = 0;
      this.attackFlash = 0;
      this.walkCycle = 0;
      const baseStats = { speed: 180, damage: 14, attackRadius: 260, attackCooldown: 0.9, mitigation: 0, projectileSpeed: 320 };
      const fallbackWeapon = { kind: 'ranged', count: 1, spread: 0.1, projectile: 'arrow', lifespan: 1.7, pierce: 0 };
      this.weaponId = weaponDef?.id || 'sword';
      this.weaponName = weaponDef?.name || 'Клинок стража';
      this.weaponIcon = weaponDef?.icon;
      this.stats = { ...baseStats, ...(weaponDef?.stats || {}) };
      this.weapon = { ...fallbackWeapon, ...(weaponDef?.weapon || {}) };
      this.orbitals = [];
      this.isAlive = true;
      const startingOrbitals = weaponDef?.startingOrbitals || 0;
      for (let i = 0; i < startingOrbitals; i++) this.addOrbital({ radius: 78 + i * 6, speed: 2 + i * 0.15, damage: this.stats.damage * 0.55, sprite: 'default' });
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
      this.orbitals.forEach((orb) => (orb.angle += dt * orb.speed));
    }
    tryAttack(target, enemies = []) {
      if (!target || this.attackTimer > 0 || !this.isAlive) return [];
      this.attackTimer = this.stats.attackCooldown;
      this.attackFlash = 0.22;
      const dx = target.position.x - this.position.x;
      const dy = target.position.y - this.position.y;
      const baseAngle = Math.atan2(dy, dx);
      const shots = [];
      if (this.weapon.kind === 'melee') {
        shots.push(new Projectile({ x: this.position.x, y: this.position.y, vx: 0, vy: 0, damage: this.stats.damage, lifespan: 0.25, sprite: this.weapon.sprite || 'sword', rotation: baseAngle, pierce: -1, kind: 'melee', arc: this.weapon.arc || 1.1, owner: this, follow: true }));
        return shots;
      }
      const count = this.weapon.count;
      const spread = this.weapon.spread;
      const pierce = this.weapon.pierce ?? 0;
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
            lifespan: this.weapon.lifespan || 1.7,
            sprite: this.weapon.projectile || 'arrow',
            rotation: angle,
            pierce,
            splashRadius: this.weapon.splashRadius || 0,
            kind: 'ranged',
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
        this.experienceToLevel = Math.round(this.experienceToLevel * 1.12 + 18);
        onLevelUp?.();
      }
    }
  }

  // Systems
  class CollisionSystem {
    static handleProjectiles(projectiles, enemies, onHit) {
      projectiles.forEach((proj) => {
        if (!proj.isAlive) return;
        for (const enemy of enemies) {
          if (!enemy.isAlive) continue;
          const hit = CollisionSystem.projectileHits(proj, enemy);
          if (!hit) continue;
          if (proj.splashRadius && proj.splashRadius > 0) {
            enemies.forEach((aoeTarget) => {
              if (!aoeTarget.isAlive) return;
              if (distance(aoeTarget.position, enemy.position) <= proj.splashRadius) onHit?.(aoeTarget, proj.damage);
            });
          } else {
            onHit?.(enemy, proj.damage);
          }
          if (proj.pierce > 0) {
            proj.pierce -= 1;
            if (proj.pierce < 0) proj.isAlive = false;
          } else if (proj.pierce === 0) {
            proj.isAlive = false;
          }
          if (!proj.isAlive) break;
        }
      });
    }
    static projectileHits(proj, enemy) {
      if (proj.kind === 'melee') {
        const d = distance(proj.position, enemy.position);
        if (d > (proj.arc ? proj.arc * 80 : 120)) return false;
        const angleToEnemy = Math.atan2(enemy.position.y - proj.position.y, enemy.position.x - proj.position.x);
        const diff = Math.abs(((angleToEnemy - proj.rotation + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
        return diff <= (proj.arc || Math.PI / 2);
      }
      return distance(proj.position, enemy.position) < enemy.size;
    }
    static handlePlayer(enemies, player, onTouch) {
      for (const enemy of enemies) {
        if (!enemy.isAlive) continue;
        const hitRadius = enemy.size + 14;
        if (distance(enemy.position, player.position) < hitRadius) onTouch?.(enemy);
      }
    }
  }

  class SpawnSystem {
    constructor() { this.reset(); }
    reset() { this.timer = 2; }
    update(dt, elapsed, spawnFn, playerPos, activeBoss) {
      this.timer -= dt;
      const difficulty = 1 + elapsed / 160;
      const interval = Math.max(0.6, 2 - elapsed / 140);
      if (this.timer <= 0) {
        this.timer = interval;
        let count = 1 + Math.floor(elapsed / 50);
        if (elapsed > 300) count += 2;
        for (let i = 0; i < count; i++) {
          const enemy = this.createEnemy(difficulty, playerPos, elapsed, activeBoss);
          spawnFn(enemy);
        }
      }
    }
    createEnemy(difficulty, playerPos, elapsed) {
      const roll = Math.random();
      let type = 'undead';
      if (elapsed > 300 && roll > 0.3) type = 'skeleton';
      else if (roll > 0.82) type = 'vampire';
      else if (roll > 0.55) type = 'undead';
      else type = 'vampire';
      const angle = Math.random() * Math.PI * 2;
      const distanceFromPlayer = 460 + Math.random() * 180;
      const position = { x: playerPos.x + Math.cos(angle) * distanceFromPlayer, y: playerPos.y + Math.sin(angle) * distanceFromPlayer };
      const eliteBoost = Math.random() < 0.1 ? 1.35 : 1;
      if (type === 'skeleton') return new Enemy(type, position, Math.max(0.8, difficulty * 0.8));
      return new Enemy(type, position, difficulty * eliteBoost);
    }
  }

  class UpgradeSystem {
    constructor() { this.weapon = null; this.createPool(); }
    configureForWeapon(weaponDef) { this.weapon = weaponDef; this.createPool(); }
    createPool() { this.options = this.weapon?.upgrades ? [...this.weapon.upgrades] : []; }
    getChoices() { return [...this.options].sort(() => Math.random() - 0.5).slice(0, 3); }
  }

  // Game
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
      this.loop = new GameLoop({ update: (dt) => this.update(dt), render: () => this.draw() });
      this.upgradeSystem = new UpgradeSystem();
      this.spawnSystem = new SpawnSystem();
      this.entities = { player: null, enemies: [], projectiles: [] };
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
    start() { this.reset(); this.loop.start(); }
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
    destroy() { this.loop.stop(); this.input.destroy(); this.renderer.destroy(); }
    pause() { this.state = 'paused'; }
    resume() { this.state = 'playing'; }
    update(dt) {
      if (this.state === 'paused') return;
      const { player, enemies, projectiles } = this.entities;
      this.elapsed += dt;
      if (this.parryBuff > 0) { this.parryBuff -= dt; player.stats.mitigation = Math.min(0.6, this.baseMitigation + this.parryMitigation); } else { player.stats.mitigation = this.baseMitigation; }
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
          if (enemy.isBoss) { this.activeBoss = null; this.updateBossBar(); this.nextBossTime = this.elapsed + 300; }
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
        if (d < nearestDist) { nearestDist = d; nearest = enemy; }
      }
      if (nearest && nearestDist <= player.stats.attackRadius) return nearest;
      return null;
    }
    applyOrbitals(player, enemies, dt) {
      player.orbitals.forEach((orb) => {
        const ox = player.position.x + Math.cos(orb.angle) * orb.radius;
        const oy = player.position.y + Math.sin(orb.angle) * orb.radius;
        enemies.forEach((enemy) => {
          if (!enemy.isAlive) return;
          if (distance(enemy.position, { x: ox, y: oy }) < enemy.size + 8) enemy.takeDamage(orb.damage * dt * 6);
        });
      });
    }
    handleBossSpawn() {
      if (this.activeBoss && this.activeBoss.isAlive) return;
      if (this.elapsed >= this.nextBossTime) {
        const playerPos = this.entities.player.position;
        const angle = Math.random() * Math.PI * 2;
        const dist = 520;
        const position = { x: playerPos.x + Math.cos(angle) * dist, y: playerPos.y + Math.sin(angle) * dist };
        this.activeBoss = new Enemy('graveLord', position, 1 + this.elapsed / 240);
        this.entities.enemies.push(this.activeBoss);
        this.updateBossBar();
      }
    }
    onLevelUp() { this.pause(); const options = this.upgradeSystem.getChoices(); this.showUpgradePanel(options); }
    showUpgradePanel(options) {
      this.upgradePanel.innerHTML = '';
      this.upgradePanel.style.display = 'flex';
      options.forEach((opt) => {
        const card = document.createElement('div');
        card.className = 'upgrade-card';
        card.innerHTML = `<strong>${opt.title}</strong><div style="margin-top:6px; font-size:13px;">${opt.description}</div>`;
        card.addEventListener('click', () => { opt.apply(this.entities.player, this); this.upgradePanel.style.display = 'none'; this.resume(); });
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
      this.statsEl.textContent = `HP: ${player.health.toFixed(0)}/${player.maxHealth} | Урон: ${player.stats.damage.toFixed(1)} | Скорость: ${player.stats.speed.toFixed(0)} | Орбиты: ${player.orbitals.length}`;
      this.timerEl.textContent = `Время: ${Math.floor(this.elapsed)}с | EXP: ${player.experience.toFixed(0)}/${player.experienceToLevel}`;
      if (this.weaponBadge) {
        const { name, icon, id } = this.weaponDef || {};
        this.weaponBadge.querySelector('.weapon-name').textContent = name || 'Оружие';
        const iconEl = this.weaponBadge.querySelector('img');
        if (iconEl && icon) { iconEl.src = icon; iconEl.alt = id; }
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

  // Bootstrap
  const startScreen = document.getElementById('start-screen');
  if (!startScreen) return;
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
  function hideStart() { startScreen.style.display = 'none'; }
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  function attachStartListeners() {
    const handler = () => {
      if (isBooting || startScreen.style.display === 'none') return;
      if (!selectedWeapon) { runSummary.textContent = 'Выбери оружие, чтобы начать'; return; }
      isBooting = true;
      startButton.disabled = true;
      if (!assetsPromise) assetsPromise = loadAssets();
      startButton.textContent = 'Загрузка ассетов...';
      hideStart();
      assetsPromise
        .then((assets) => {
          startButton.textContent = 'Запуск';
          if (game) game.destroy();
          game = new Game({ container, statsEl, timerEl, upgradePanel, assets, weaponId: selectedWeapon, weaponBadge, bossBar, onGameOver: ({ timeSurvived, kills }) => { showStart(`Пробег: ${formatTime(timeSurvived)} • Врагов уничтожено: ${kills}`); } });
          game.start();
        })
        .catch(() => { showStart('Не удалось загрузить ассеты'); });
    };
    startButton.addEventListener('click', handler);
    window.addEventListener('keydown', (e) => { if (e.code === 'Enter' || e.code === 'Space') handler(); });
  }

  attachStartListeners();
  renderWeaponChoices();
  startButton.disabled = true;
})();
