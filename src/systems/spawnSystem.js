import { createEnemy } from '../entities/enemy.js';

class SpawnSystem {
  constructor() {
    this.timer = 0;
    this.interval = 2; // seconds
  }

  reset() {
    this.timer = 0;
    this.interval = 2;
  }

  update(deltaSeconds, elapsed, renderer, player) {
    this.timer -= deltaSeconds;
    const spawned = [];
    const difficulty = 1 + elapsed * 0.03;

    if (this.timer <= 0) {
      const count = Math.min(1 + Math.floor(elapsed / 10), 6);
      for (let i = 0; i < count; i++) {
        const type = this._pickType(elapsed);
        const enemy = createEnemy(renderer, type, difficulty);
        const angle = Math.random() * Math.PI * 2;
        const distance = player.attackRadius + 120 + Math.random() * 200;
        enemy.position.x = player.position.x + Math.cos(angle) * distance;
        enemy.position.y = player.position.y + Math.sin(angle) * distance;
        enemy.sprite.x = enemy.position.x;
        enemy.sprite.y = enemy.position.y;
        spawned.push(enemy);
      }
      this.interval = Math.max(0.6, 2 - elapsed * 0.01);
      this.timer = this.interval;
    }

    return spawned;
  }

  _pickType(elapsed) {
    if (elapsed > 90) return 'crawler';
    if (elapsed > 45) return Math.random() > 0.4 ? 'leech' : 'crawler';
    return Math.random() > 0.6 ? 'glitch' : 'leech';
  }
}

export default SpawnSystem;
