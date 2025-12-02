import * as PIXI from 'https://cdn.jsdelivr.net/npm/pixi.js@7/dist/pixi.min.mjs';
import { normalize } from '../utils/math.js';

class Projectile {
  constructor(origin, target, damage, size, stage) {
    this.position = { ...origin };
    const dir = normalize({ x: target.position.x - origin.x, y: target.position.y - origin.y });
    this.velocity = { x: dir.x * 500, y: dir.y * 500 };
    this.damage = damage;
    this.life = 1.2; // seconds
    this.size = size;
    this.sprite = this._createSprite(stage);
  }

  _createSprite(stage) {
    const g = new PIXI.Graphics();
    g.rect(-this.size / 2, -this.size / 2, this.size, this.size).fill({ color: 0x9bf6ff, alpha: 0.85 });
    g.filters = [new PIXI.NoiseFilter(0.1)];
    stage.addChild(g);
    return g;
  }

  update(deltaSeconds) {
    this.position.x += this.velocity.x * deltaSeconds;
    this.position.y += this.velocity.y * deltaSeconds;
    this.sprite.position.set(this.position.x, this.position.y);
    this.life -= deltaSeconds;
  }

  destroy() {
    this.sprite.destroy();
  }
}

export function createProjectile(origin, target, damage, size, stage) {
  return new Projectile(origin, target, damage, size, stage);
}

export default Projectile;
