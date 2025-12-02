import * as PIXI from 'https://cdn.jsdelivr.net/npm/pixi.js@7/dist/pixi.min.mjs';

const enemyPresets = {
  glitch: { color: 0xff3366, speed: 120, health: 18, damage: 8, xp: 8 },
  leech: { color: 0x33ffaa, speed: 90, health: 26, damage: 6, xp: 10 },
  crawler: { color: 0xffaa33, speed: 60, health: 40, damage: 10, xp: 14 },
};

class Enemy {
  constructor(type, stage, difficultyMultiplier = 1) {
    const preset = enemyPresets[type];
    this.type = type;
    this.position = { x: (Math.random() - 0.5) * 1200, y: (Math.random() - 0.5) * 1200 };
    this.speed = preset.speed * difficultyMultiplier;
    this.health = preset.health * difficultyMultiplier;
    this.damage = preset.damage * difficultyMultiplier;
    this.xpValue = preset.xp * difficultyMultiplier;
    this.size = 20 + Math.random() * 8;
    this.sprite = this._createSprite(stage, preset.color);
    this.statusTimer = 0;
  }

  _createSprite(stage, color) {
    const g = new PIXI.Graphics();
    g.rect(-this.size / 2, -this.size / 2, this.size, this.size).fill({ color, alpha: 0.75 });
    g.rect(-this.size / 4, -this.size / 4, this.size / 2, this.size / 2).fill({ color: 0xffffff, alpha: 0.25 });
    g.filters = [new PIXI.NoiseFilter(0.3)];
    stage.addChild(g);
    return g;
  }

  update(deltaSeconds, targetPosition) {
    const dx = targetPosition.x - this.position.x;
    const dy = targetPosition.y - this.position.y;
    const len = Math.hypot(dx, dy) || 1;
    this.position.x += (dx / len) * this.speed * deltaSeconds;
    this.position.y += (dy / len) * this.speed * deltaSeconds;
    this.sprite.position.set(this.position.x, this.position.y);

    if (this.statusTimer > 0) {
      this.statusTimer -= deltaSeconds;
      this.sprite.alpha = 0.5 + Math.sin(performance.now() * 0.02) * 0.2;
    } else {
      this.sprite.alpha = 0.9;
    }
  }

  applyDamage(amount) {
    this.health -= amount;
    this.statusTimer = 0.3;
  }

  destroy() {
    this.sprite.destroy();
  }
}

export function createEnemy(stage, type, multiplier = 1) {
  return new Enemy(type, stage, multiplier);
}

export const enemyTypes = Object.keys(enemyPresets);

export default Enemy;
