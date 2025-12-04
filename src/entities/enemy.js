import { normalize } from '../utils/math.js';

const ENEMY_TYPES = {
  undead: {
    speed: 70,
    health: 32,
    damage: 8,
    size: 18,
    rewardXp: 9,
  },
  vampire: {
    speed: 95,
    health: 60,
    damage: 14,
    size: 22,
    rewardXp: 16,
  },
  skeleton: {
    speed: 80,
    health: 18,
    damage: 7,
    size: 16,
    rewardXp: 6,
  },
  graveLord: {
    speed: 70,
    health: 800,
    damage: 28,
    size: 38,
    rewardXp: 150,
    isBoss: true,
  },
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
    if (this.health <= 0) {
      this.isAlive = false;
    }
  }
}

export { ENEMY_TYPES };
export default Enemy;
