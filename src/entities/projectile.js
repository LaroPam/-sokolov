class Projectile {
  constructor({
    x,
    y,
    vx,
    vy,
    damage,
    lifespan = 1.5,
    sprite = 'sword',
    rotation = 0,
    pierce = 0,
    splashRadius = 0,
    kind = 'ranged',
    arc = 0,
    owner = null,
    follow = false,
  }) {
    this.position = { x, y };
    this.velocity = { x: vx, y: vy };
    this.damage = damage;
    this.lifespan = lifespan;
    this.sprite = sprite;
    this.rotation = rotation;
    this.pierce = pierce;
    this.splashRadius = splashRadius;
    this.kind = kind;
    this.arc = arc;
    this.owner = owner;
    this.follow = follow;
    this.isAlive = true;
  }

  update(dt) {
    if (!this.isAlive) return;
    if (this.follow && this.owner) {
      this.position.x = this.owner.position.x;
      this.position.y = this.owner.position.y;
    } else {
      this.position.x += this.velocity.x * dt;
      this.position.y += this.velocity.y * dt;
    }
    if (this.kind !== 'melee') {
      this.rotation += dt * 6;
    }
    this.lifespan -= dt;
    if (this.lifespan <= 0) {
      this.isAlive = false;
    }
  }
}

export default Projectile;
