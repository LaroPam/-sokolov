import Enemy from '../entities/enemy.js';

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
    const distance = 440 + Math.random() * 160;
    const position = {
      x: playerPos.x + Math.cos(angle) * distance,
      y: playerPos.y + Math.sin(angle) * distance,
    };

    const eliteBoost = Math.random() < 0.12 ? 1.5 : 1;
    return new Enemy(type, position, difficulty * eliteBoost);
  }
}

export default SpawnSystem;
