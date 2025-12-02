import { normalize } from '../utils/math.js';

const ENEMY_TYPES = {
  glitchBug: {
    speed: 100,
    health: 22,
    damage: 7,
    color: '#ff6cf4',
    glyph: 'x',
    size: 18,
    rewardXp: 10,
  },
  dataLeech: {
    speed: 65,
    health: 36,
    damage: 12,
    color: '#7cff5c',
    glyph: 's',
    size: 20,
    rewardXp: 14,
  },
  corruptedCrawler: {
    speed: 42,
    health: 70,
    damage: 18,
    color: '#ffb23f',
    glyph: '#',
    size: 26,
    rewardXp: 20,
  },
  nullWraith: {
    speed: 85,
    health: 40,
    damage: 15,
    color: '#82d8ff',
    glyph: '?',
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
    this.color = stats.color;
    this.size = stats.size;
    this.rewardXp = Math.round(stats.rewardXp * (0.9 + difficulty * 0.12));
    this.glyph = stats.glyph;
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
    if (this.health <= 0) {
      this.isAlive = false;
    }
  }
}

export { ENEMY_TYPES };
export default Enemy;
