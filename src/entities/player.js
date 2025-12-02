class Player {
  constructor(renderer) {
    this.renderer = renderer;
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

    this.sprite = this._createSprite();
  }

  _createSprite() {
    return this.renderer.createSprite({ color: '#00ffff', innerColor: 'rgba(255,0,255,0.6)', size: 28 });
  }

  update(deltaSeconds, movement) {
    this.position.x += movement.x * this.speed * deltaSeconds;
    this.position.y += movement.y * this.speed * deltaSeconds;
    this.sprite.x = this.position.x;
    this.sprite.y = this.position.y;
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

export function createPlayer(renderer) {
  return new Player(renderer);
}

export default Player;
