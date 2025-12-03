import Projectile from './projectile.js';
import { clamp, normalize } from '../utils/math.js';

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
    if (this.health <= 0) {
      this.isAlive = false;
    }
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

export default Player;
