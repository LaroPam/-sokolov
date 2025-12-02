const enemyPresets = {
  glitch: { color: '#ff3366', speed: 120, health: 18, damage: 8, xp: 8 },
  leech: { color: '#33ffaa', speed: 90, health: 26, damage: 6, xp: 10 },
  crawler: { color: '#ffaa33', speed: 60, health: 40, damage: 10, xp: 14 },
};

class Enemy {
  constructor(type, renderer, difficultyMultiplier = 1) {
    const preset = enemyPresets[type];
    this.type = type;
    this.renderer = renderer;
    this.position = { x: (Math.random() - 0.5) * 1200, y: (Math.random() - 0.5) * 1200 };
    this.speed = preset.speed * difficultyMultiplier;
    this.health = preset.health * difficultyMultiplier;
    this.damage = preset.damage * difficultyMultiplier;
    this.xpValue = preset.xp * difficultyMultiplier;
    this.size = 20 + Math.random() * 8;
    this.sprite = this._createSprite(preset.color);
    this.statusTimer = 0;
  }

  _createSprite(color) {
    return this.renderer.createSprite({ color, innerColor: 'rgba(255,255,255,0.25)', size: this.size });
  }

  update(deltaSeconds, targetPosition) {
    const dx = targetPosition.x - this.position.x;
    const dy = targetPosition.y - this.position.y;
    const len = Math.hypot(dx, dy) || 1;
    this.position.x += (dx / len) * this.speed * deltaSeconds;
    this.position.y += (dy / len) * this.speed * deltaSeconds;
    this.sprite.x = this.position.x;
    this.sprite.y = this.position.y;

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
    this.renderer.removeSprite(this.sprite);
  }
}

export function createEnemy(renderer, type, multiplier = 1) {
  return new Enemy(type, renderer, multiplier);
}

export const enemyTypes = Object.keys(enemyPresets);

export default Enemy;
