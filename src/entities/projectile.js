class Projectile {
  constructor({ x, y, vx, vy, damage, lifespan = 1.5, glyph = '•', color = '#8df' }) {
    this.position = { x, y };
    this.velocity = { x: vx, y: vy };
    this.damage = damage;
    this.lifespan = lifespan;
    this.glyph = glyph;
    this.color = color;
    this.isAlive = true;
  }

  update(dt) {
    if (!this.isAlive) return;
    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;
    this.lifespan -= dt;
    if (this.lifespan <= 0) {
      this.isAlive = false;
    }
  }
}

export default Projectile;
