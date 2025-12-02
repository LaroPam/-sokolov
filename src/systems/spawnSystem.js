import Enemy from '../entities/enemy.js';

class SpawnSystem {
  constructor() {
    this.reset();
  }

  reset() {
    this.timer = 0;
  }

  update(dt, elapsed, spawnFn, playerPos) {
    this.timer -= dt;
    const difficulty = 1 + elapsed / 80;
    const interval = Math.max(0.35, 1.4 - elapsed / 60);
    if (this.timer <= 0) {
      this.timer = interval;
      const count = 1 + Math.floor(elapsed / 25);
      for (let i = 0; i < count; i++) {
        const enemy = this.createEnemy(difficulty, playerPos);
        spawnFn(enemy);
      }
    }
  }

  createEnemy(difficulty, playerPos) {
    const roll = Math.random();
    let type = 'glitchBug';
    if (roll > 0.8) type = 'corruptedCrawler';
    else if (roll > 0.5) type = 'dataLeech';

    const angle = Math.random() * Math.PI * 2;
    const distance = 420 + Math.random() * 140;
    const position = {
      x: playerPos.x + Math.cos(angle) * distance,
      y: playerPos.y + Math.sin(angle) * distance,
    };

    const eliteBoost = Math.random() < 0.15 ? 1.6 : 1;
    return new Enemy(type, position, difficulty * eliteBoost);
  }
}

export default SpawnSystem;
