import * as PIXI from 'https://cdn.jsdelivr.net/npm/pixi.js@7/dist/pixi.min.mjs';

class Player {
  constructor(stage) {
    this.position = { x: 0, y: 0 };
    this.speed = 220;
    this.health = 100;
    this.maxHealth = 100;
    this.damage = 10;
    this.attackDelay = 600; // ms
    this.attackCooldown = 0;
    this.attackRadius = 340;
    this.bulletSize = 10;

    this.level = 1;
    this.xp = 0;
    this.nextLevelXp = 25;

    this.sprite = this._createSprite(stage);
  }

  _createSprite(stage) {
    const g = new PIXI.Graphics();
    g.rect(-14, -14, 28, 28).fill({ color: 0x00ffff, alpha: 0.9 });
    g.rect(-8, -8, 16, 16).fill({ color: 0xff00ff, alpha: 0.6 });
    g.filters = [new PIXI.NoiseFilter(0.2)];
    stage.addChild(g);
    return g;
  }

  update(deltaSeconds, movement) {
    this.position.x += movement.x * this.speed * deltaSeconds;
    this.position.y += movement.y * this.speed * deltaSeconds;
    this.sprite.position.set(this.position.x, this.position.y);
  }

  gainXp(amount, onLevelUp) {
    this.xp += amount;
    while (this.xp >= this.nextLevelXp) {
      this.xp -= this.nextLevelXp;
      this.level += 1;
      this.nextLevelXp = Math.floor(this.nextLevelXp * 1.35);
      onLevelUp?.();
    }
  }
}

export function createPlayer(stage) {
  return new Player(stage);
}

export default Player;
