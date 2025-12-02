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
    this.ctx.fillStyle = '#070914';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.globalAlpha = 0.5;
    this.ctx.fillStyle = this.bgNoise;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.globalAlpha = 1;
    this.ctx.fillStyle = `rgba(0,255,200,0.1)`;
    const pulse = 8 + Math.sin(time * 0.5) * 4;
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

  drawPlayer(player) {
    const { x, y } = this.worldToScreen(player.position);
    const size = 24;
    const jitter = Math.sin(performance.now() / 80) * 1.5;
    this.ctx.fillStyle = '#0ff';
    this.ctx.fillRect(x - size / 2, y - size / 2, size, size);
    this.ctx.strokeStyle = '#f0f';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x - size / 2 - jitter, y - size / 2 + jitter, size, size);
  }

  drawEnemy(enemy) {
    const { x, y } = this.worldToScreen(enemy.position);
    const size = enemy.size;
    this.ctx.fillStyle = enemy.color;
    this.ctx.fillRect(x - size / 2, y - size / 2, size, size);
    this.ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    this.ctx.strokeRect(x - size / 2, y - size / 2, size, size);
  }

  drawProjectile(projectile) {
    const { x, y } = this.worldToScreen(projectile.position);
    const size = 8;
    this.ctx.fillStyle = '#8df';
    this.ctx.beginPath();
    this.ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawBackground(time, center) {
    // Already cleared with glitch noise; draw parallax fragments
    this.ctx.save();
    this.ctx.translate(this.canvas.width / 2 - (center.x % 200), this.canvas.height / 2 - (center.y % 200));
    const colors = ['#0c1824', '#0f1f30', '#0a1420'];
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        this.ctx.fillStyle = colors[(i + j + Math.round(time)) % colors.length];
        this.ctx.fillRect(i * 200, j * 200, 200, 200);
      }
    }
    this.ctx.restore();
  }
}

export default Renderer;
