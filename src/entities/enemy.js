import { normalize } from '../utils/math.js';

const ENEMY_TYPES = {
  glitchBug: {
    speed: 110,
    health: 24,
    damage: 8,
    color: '#ff5cf4',
    size: 18,
    rewardXp: 10,
  },
  dataLeech: {
    speed: 70,
    health: 42,
    damage: 14,
    color: '#7cff5c',
    size: 22,
    rewardXp: 16,
  },
  corruptedCrawler: {
    speed: 45,
    health: 90,
    damage: 20,
    color: '#ffb23f',
    size: 26,
    rewardXp: 22,
  },
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
    if (this.health <= 0) {
      this.isAlive = false;
    }
  }
}

export { ENEMY_TYPES };
export default Enemy;
