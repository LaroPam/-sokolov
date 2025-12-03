import Projectile from './projectile.js';
import { clamp, normalize } from '../utils/math.js';

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
    const baseStats = {
      speed: 180,
      damage: 14,
      attackRadius: 260,
      attackCooldown: 0.9,
      mitigation: 0,
      projectileSpeed: 320,
    };

    const fallbackWeapon = {
      kind: 'ranged',
      count: 1,
      spread: 0.1,
      projectile: 'arrow',
      lifespan: 1.7,
      pierce: 0,
    };

    this.weaponId = weaponDef?.id || 'sword';
    this.weaponName = weaponDef?.name || 'Клинок стража';
    this.weaponIcon = weaponDef?.icon;

    this.stats = { ...baseStats, ...(weaponDef?.stats || {}) };
    this.weapon = { ...fallbackWeapon, ...(weaponDef?.weapon || {}) };
    this.orbitals = [];
    this.isAlive = true;

    const startingOrbitals = weaponDef?.startingOrbitals || 0;
    for (let i = 0; i < startingOrbitals; i++) {
      this.addOrbital({ radius: 78 + i * 6, speed: 2 + i * 0.15, damage: this.stats.damage * 0.55, sprite: 'default' });
    }
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
    if (moveMag > 5) {
      this.walkCycle += dt * (moveMag / 70);
    }

    this.attackTimer = Math.max(0, this.attackTimer - dt);
    this.hurtTimer = Math.max(0, this.hurtTimer - dt);
    this.attackFlash = Math.max(0, this.attackFlash - dt);
    this.orbitals.forEach((orb) => {
      orb.angle += dt * orb.speed;
    });
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
      shots.push(
        new Projectile({
          x: this.position.x,
          y: this.position.y,
          vx: 0,
          vy: 0,
          damage: this.stats.damage,
          lifespan: 0.25,
          sprite: this.weapon.sprite || 'sword',
          rotation: baseAngle,
          pierce: -1,
          kind: 'melee',
          arc: this.weapon.arc || 1.1,
          owner: this,
          follow: true,
        }),
      );
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
    if (this.health <= 0) {
      this.isAlive = false;
    }
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

export default Player;
