class Renderer {
  constructor(container, assets) {
    this.container = container;
    this.assets = assets;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.container.appendChild(this.canvas);
    this.camera = { x: 0, y: 0 };
    this.bgNoise = this.createNoisePattern();
    this.tilePattern = null;
    this.resize();
    this.handleResize = () => this.resize();
    window.addEventListener('resize', this.handleResize);
  }

  destroy() {
    window.removeEventListener('resize', this.handleResize);
    this.container.removeChild(this.canvas);
  }

  resize() {
    this.canvas.width = this.container.clientWidth;
    this.canvas.height = this.container.clientHeight;
    this.ctx.font = '20px "Courier New", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
  }

  createNoisePattern() {
    const off = document.createElement('canvas');
    off.width = 80;
    off.height = 80;
    const c = off.getContext('2d');
    const imageData = c.createImageData(off.width, off.height);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const v = Math.random() * 80;
      imageData.data[i] = 0;
      imageData.data[i + 1] = v;
      imageData.data[i + 2] = v;
      imageData.data[i + 3] = 40;
    }
    c.putImageData(imageData, 0, 0);
    return this.ctx.createPattern(off, 'repeat');
  }

  clear(center, time) {
    this.camera.x = center.x;
    this.camera.y = center.y;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.globalAlpha = 1;
    this.ctx.fillStyle = '#050510';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.globalAlpha = 0.5;
    this.ctx.fillStyle = this.bgNoise;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.globalAlpha = 1;
    this.ctx.fillStyle = `rgba(0,255,200,0.08)`;
    const pulse = 10 + Math.sin(time * 0.5) * 5;
    for (let x = 0; x < this.canvas.width; x += 64) {
      for (let y = 0; y < this.canvas.height; y += 64) {
        this.ctx.fillRect(x, y, pulse, 1);
        this.ctx.fillRect(x, y, 1, pulse);
      }
    }
  }

  worldToScreen(pos) {
    const x = this.canvas.width / 2 + (pos.x - this.camera.x);
    const y = this.canvas.height / 2 + (pos.y - this.camera.y);
    return { x, y };
  }

  drawSprite(image, x, y, { scale = 1, alpha = 1, rotation = 0 } = {}) {
    if (!image) return;
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(rotation);
    this.ctx.globalAlpha = alpha;
    const w = image.width * scale;
    const h = image.height * scale;
    this.ctx.drawImage(image, -w / 2, -h / 2, w, h);
    this.ctx.restore();
  }

  drawPlayer(player, spriteSets) {
    const { x, y } = this.worldToScreen(player.position);
    const bob = Math.sin(player.walkCycle * 8) * 3;
    const set = spriteSets.player;
    let frame = this.assets.images[set.walk[Math.floor(player.walkCycle * 6) % set.walk.length]];
    if (player.hurtTimer > 0) {
      frame = this.assets.images[set.hurt[0]];
    } else if (player.attackFlash > 0) {
      frame = this.assets.images[set.attack[0]];
    } else if (Math.abs(player.velocity.x) < 2 && Math.abs(player.velocity.y) < 2) {
      frame = this.assets.images[set.idle[0]];
    }
    this.drawSprite(frame, x, y + bob, { scale: 1.5 });
    player.orbitals.forEach((orb) => {
      const ox = x + Math.cos(orb.angle) * orb.radius;
      const oy = y + Math.sin(orb.angle) * orb.radius;
      const orbKey = spriteSets.orbitals[orb.sprite] || spriteSets.orbitals.default;
      const orbImg = this.assets.images[orbKey];
      this.drawSprite(orbImg, ox, oy, { scale: 1, alpha: 0.95 });
    });
  }

  drawEnemy(enemy, spriteSets) {
    const { x, y } = this.worldToScreen(enemy.position);
    const bob = Math.sin(enemy.walkCycle * 8) * 2;
    const frames = spriteSets.enemies[enemy.type] || spriteSets.enemies.glitchBug;
    const frame = this.assets.images[frames[Math.floor(enemy.walkCycle * 4) % frames.length]];
    const alpha = enemy.hurtTimer > 0 ? 0.7 : 1;
    this.drawSprite(frame, x, y + bob, { scale: 1.5, alpha });
  }

  drawProjectile(projectile, spriteSets) {
    const { x, y } = this.worldToScreen(projectile.position);
    const spriteKey = spriteSets.projectiles[projectile.sprite] || spriteSets.projectiles.shard;
    const img = this.assets.images[spriteKey];
    this.drawSprite(img, x, y, { scale: 1.2, rotation: projectile.rotation || 0 });
  }

  drawBackground(center) {
    if (!this.tilePattern) {
      const tileImg = this.assets.images[this.assets.sets.background];
      if (tileImg) {
        const off = document.createElement('canvas');
        off.width = tileImg.width;
        off.height = tileImg.height;
        const ctx = off.getContext('2d');
        ctx.drawImage(tileImg, 0, 0);
        this.tilePattern = this.ctx.createPattern(off, 'repeat');
      }
    }
    if (!this.tilePattern) return;
    this.ctx.save();
    this.ctx.translate(this.canvas.width / 2 - (center.x % 128), this.canvas.height / 2 - (center.y % 128));
    this.ctx.fillStyle = this.tilePattern;
    this.ctx.globalAlpha = 0.75;
    this.ctx.fillRect(-128, -128, this.canvas.width + 256, this.canvas.height + 256);
    this.ctx.restore();
  }
}

export default Renderer;
