// Simple canvas-based renderer with a virtual camera and glitchy background
class Renderer {
  constructor(container) {
    this.container = container;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.sprites = [];
    this.backgroundTiles = [];
    this.flashAlpha = 0;
    this.camera = { x: 0, y: 0 };
  }

  async init() {
    this._resize();
    window.addEventListener('resize', () => this._resize());
    this._buildBackground();
    this.container.innerHTML = '';
    this.container.appendChild(this.canvas);
  }

  _resize() {
    this.canvas.width = this.container.clientWidth;
    this.canvas.height = this.container.clientHeight;
  }

  _buildBackground() {
    this.backgroundTiles = [];
    const { width, height } = this.canvas;
    for (let i = 0; i < 80; i++) {
      const w = 60 + Math.random() * 80;
      const h = 40 + Math.random() * 60;
      const x = Math.random() * width;
      const y = Math.random() * height;
      const hue = Math.floor(Math.random() * 360);
      this.backgroundTiles.push({ x, y, w, h, hue, alpha: 0.05 });
    }
  }

  reset() {
    this.sprites = this.sprites.filter((s) => !s._destroyed);
    this._buildBackground();
  }

  createSprite({ color = '#0ff', innerColor = null, size = 20 }) {
    const sprite = {
      x: 0,
      y: 0,
      size,
      color,
      innerColor,
      alpha: 0.95,
      _destroyed: false,
    };
    this.sprites.push(sprite);
    return sprite;
  }

  removeSprite(sprite) {
    sprite._destroyed = true;
    this.sprites = this.sprites.filter((s) => s !== sprite);
  }

  centerCamera(position) {
    this.camera.x = position.x - this.canvas.width / 2;
    this.camera.y = position.y - this.canvas.height / 2;
  }

  flash() {
    this.flashAlpha = 0.4;
  }

  render() {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background tiles (screen-space for a glitchy HUD vibe)
    for (const tile of this.backgroundTiles) {
      ctx.fillStyle = `hsla(${tile.hue}, 90%, 55%, ${tile.alpha})`;
      ctx.fillRect(tile.x, tile.y, tile.w, tile.h);
    }

    // Draw sprites relative to camera
    for (const sprite of this.sprites) {
      if (sprite._destroyed) continue;
      const screenX = sprite.x - this.camera.x;
      const screenY = sprite.y - this.camera.y;
      ctx.save();
      ctx.globalAlpha = sprite.alpha;
      ctx.fillStyle = sprite.color;
      ctx.fillRect(screenX - sprite.size / 2, screenY - sprite.size / 2, sprite.size, sprite.size);
      if (sprite.innerColor) {
        ctx.fillStyle = sprite.innerColor;
        const innerSize = sprite.size * 0.6;
        ctx.fillRect(screenX - innerSize / 2, screenY - innerSize / 2, innerSize, innerSize);
      }
      ctx.restore();
    }

    // Flash overlay
    if (this.flashAlpha > 0) {
      ctx.fillStyle = `rgba(255,255,255,${this.flashAlpha})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      this.flashAlpha = Math.max(0, this.flashAlpha - 0.02);
    }
  }
}

export default Renderer;
