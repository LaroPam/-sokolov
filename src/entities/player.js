import Projectile from './projectile.js';
import { clamp, normalize } from '../utils/math.js';

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
    this.stats = {
      speed: 170,
      damage: 14,
      attackRadius: 260,
      attackCooldown: 0.9,
    };
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

  tryAttack(target, dt) {
    if (!target || this.attackTimer > 0 || !this.isAlive) return null;
    this.attackTimer = this.stats.attackCooldown;

    const dx = target.position.x - this.position.x;
    const dy = target.position.y - this.position.y;
    const dir = normalize(dx, dy);
    const speed = 320;

    return new Projectile({
      x: this.position.x,
      y: this.position.y,
      vx: dir.x * speed,
      vy: dir.y * speed,
      damage: this.stats.damage,
      lifespan: 1.6,
    });
  }

  takeDamage(amount) {
    this.health = clamp(this.health - amount, 0, this.maxHealth);
    if (this.health <= 0) {
      this.isAlive = false;
    }
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

export default Player;
