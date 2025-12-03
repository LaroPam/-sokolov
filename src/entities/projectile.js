class Projectile {
  constructor({ x, y, vx, vy, damage, lifespan = 1.5, sprite = 'shard', rotation = 0 }) {
    this.position = { x, y };
    this.velocity = { x: vx, y: vy };
    this.damage = damage;
    this.lifespan = lifespan;
    this.sprite = sprite;
    this.rotation = rotation;
    this.isAlive = true;
  }

  update(dt) {
    if (!this.isAlive) return;
    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;
    this.rotation += dt * 8;
    this.lifespan -= dt;
    if (this.lifespan <= 0) {
      this.isAlive = false;
    }
  }
}

export default Projectile;
