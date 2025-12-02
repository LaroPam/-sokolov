class Renderer {
  constructor(container) {
    this.container = container;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.container.appendChild(this.canvas);
    this.camera = { x: 0, y: 0 };
    this.bgNoise = this.createNoisePattern();
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

  drawGlyph(glyph, x, y, color = '#0ff', size = 20, glow = '#0ff', jitter = 0) {
    this.ctx.save();
    this.ctx.translate(x + (Math.random() - 0.5) * jitter, y + (Math.random() - 0.5) * jitter);
    this.ctx.font = `${size}px "Courier New", monospace`;
    this.ctx.shadowColor = glow;
    this.ctx.shadowBlur = 12;
    this.ctx.fillStyle = color;
    this.ctx.fillText(glyph, 0, 0);
    this.ctx.restore();
  }

  drawPlayer(player) {
    const { x, y } = this.worldToScreen(player.position);
    const bob = Math.sin(player.walkCycle * 8) * 3;
    const hurtGlow = player.hurtTimer > 0 ? '#ff4d7a' : '#0ff';
    const hue = player.attackFlash > 0 ? '#aef' : '#d8fff7';
    this.drawGlyph('@', x, y + bob, hue, 26, hurtGlow, 0.6);
    this.drawGlyph('Δ', x, y - 18 + bob, '#8dff6c', 16, '#8dff6c', 0.4);
    this.drawGlyph('◯', x, y + 18 + bob, '#0ff', 14, hurtGlow, 0);
    player.orbitals.forEach((orb) => {
      const ox = x + Math.cos(orb.angle) * orb.radius;
      const oy = y + Math.sin(orb.angle) * orb.radius;
      this.drawGlyph(orb.glyph, ox, oy, orb.color, 16, '#fff', 0.5);
    });
  }

  drawEnemy(enemy) {
    const { x, y } = this.worldToScreen(enemy.position);
    const bob = Math.sin(enemy.walkCycle * 8) * 2;
    const hurt = enemy.hurtTimer > 0 ? '#fff5' : enemy.color;
    this.drawGlyph(enemy.glyph, x, y + bob, hurt, 22, enemy.color, 0.3);
    this.drawGlyph(':', x, y + bob - 16, enemy.color, 14, enemy.color, 0);
  }

  drawProjectile(projectile) {
    const { x, y } = this.worldToScreen(projectile.position);
    this.drawGlyph(projectile.glyph, x, y, projectile.color, 18, '#8df', 0.2);
  }

  drawBackground(time, center) {
    this.ctx.save();
    this.ctx.translate(this.canvas.width / 2 - (center.x % 160), this.canvas.height / 2 - (center.y % 160));
    const chars = ['░', '▒', '▓', '≋'];
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const idx = Math.abs(Math.floor((i + j + Math.round(time)) % chars.length));
        const glyph = chars[idx];
        const cx = i * 160;
        const cy = j * 160;
        this.ctx.fillStyle = 'rgba(0,255,200,0.04)';
        this.ctx.fillRect(cx, cy, 160, 160);
        this.drawGlyph(glyph.repeat(2), cx + 80, cy + 80, '#144', 32, '#0ff', 0);
      }
    }
    this.ctx.restore();
  }
}

export default Renderer;
