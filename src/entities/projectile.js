class Projectile {
  constructor(origin, target, damage, size, renderer) {
    this.position = { x: origin.x, y: origin.y };
    this.target = { x: target.position.x, y: target.position.y };
    this.speed = 520;
    this.damage = damage;
    this.size = size;
    this.life = 1.5; // seconds
    this.renderer = renderer;
    this.sprite = this._createSprite(size);
  }

  _createSprite(size) {
    return this.renderer.createSprite({ color: '#8df', innerColor: 'rgba(255,0,255,0.4)', size });
  }

  update(deltaSeconds) {
    this.life -= deltaSeconds;
    const dx = this.target.x - this.position.x;
    const dy = this.target.y - this.position.y;
    const len = Math.hypot(dx, dy) || 1;
    this.position.x += (dx / len) * this.speed * deltaSeconds;
    this.position.y += (dy / len) * this.speed * deltaSeconds;
    this.sprite.x = this.position.x;
    this.sprite.y = this.position.y;
  }

  destroy() {
    this.renderer.removeSprite(this.sprite);
  }
}

export function createProjectile(origin, target, damage, size, renderer) {
  return new Projectile(origin, target, damage, size, renderer);
}

export default Projectile;
