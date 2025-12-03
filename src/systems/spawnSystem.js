import Enemy from '../entities/enemy.js';

class SpawnSystem {
  constructor() {
    this.reset();
  }

  reset() {
    this.timer = 2;
  }

  update(dt, elapsed, spawnFn, playerPos, activeBoss) {
    this.timer -= dt;
    const difficulty = 1 + elapsed / 160;
    const interval = Math.max(0.6, 2 - elapsed / 140);
    if (this.timer <= 0) {
      this.timer = interval;
      let count = 1 + Math.floor(elapsed / 50);
      if (elapsed > 300) {
        count += 2; // скелеты подступают ордой после пятой минуты
      }
      for (let i = 0; i < count; i++) {
        const enemy = this.createEnemy(difficulty, playerPos, elapsed, activeBoss);
        spawnFn(enemy);
      }
    }
  }

  createEnemy(difficulty, playerPos, elapsed, activeBoss) {
    const roll = Math.random();
    let type = 'undead';
    if (elapsed > 300 && roll > 0.3) {
      type = 'skeleton';
    } else if (roll > 0.82) type = 'vampire';
    else if (roll > 0.55) type = 'undead';
    else type = 'vampire';

    if (activeBoss && !activeBoss.isAlive) {
      activeBoss = null;
    }

    const angle = Math.random() * Math.PI * 2;
    const distance = 460 + Math.random() * 180;
    const position = {
      x: playerPos.x + Math.cos(angle) * distance,
      y: playerPos.y + Math.sin(angle) * distance,
    };

    const eliteBoost = Math.random() < 0.1 ? 1.35 : 1;
    if (type === 'skeleton') {
      return new Enemy(type, position, Math.max(0.8, difficulty * 0.8));
    }
    return new Enemy(type, position, difficulty * eliteBoost);
  }
}

export default SpawnSystem;
