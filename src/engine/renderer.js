import * as PIXI from 'https://cdn.jsdelivr.net/npm/pixi.js@7/dist/pixi.min.mjs';

// Simple wrapper around PixiJS renderer and stage
class Renderer {
  constructor(container) {
    this.container = container;
    this.app = null;
    this.stage = null;
    this.flashOverlay = null;
  }

  async init() {
    this.app = new PIXI.Application({
      resizeTo: this.container,
      backgroundColor: 0x050510,
      antialias: true,
      powerPreference: 'high-performance',
      autoDensity: true,
    });
    await this.app.init({ resizeTo: this.container });
    this.stage = this.app.stage;
    this._buildBackground();
    this.container.appendChild(this.app.canvas);
  }

  _buildBackground() {
    this.stage.removeChildren();
    // Create glitchy background tiles
    const bg = new PIXI.Graphics();
    for (let i = 0; i < 80; i++) {
      const w = 60 + Math.random() * 80;
      const h = 40 + Math.random() * 60;
      const x = Math.random() * this.container.clientWidth;
      const y = Math.random() * this.container.clientHeight;
      const color = PIXI.Color.shared
        .setValue(`hsl(${Math.random() * 360}, 90%, 50%)`)
        .toNumber();
      bg.rect(x, y, w, h).fill({ color, alpha: 0.05 });
    }
    bg.filters = [new PIXI.NoiseFilter(0.25)];
    this.stage.addChild(bg);

    // Flash overlay
    this.flashOverlay = new PIXI.Graphics();
    this.flashOverlay
      .rect(0, 0, this.container.clientWidth, this.container.clientHeight)
      .fill({ color: 0xffffff, alpha: 0 });
    this.flashOverlay.eventMode = 'none';
    this.stage.addChild(this.flashOverlay);
  }

  reset() {
    this._buildBackground();
  }

  centerCamera(position) {
    // Keep player centered via stage pivot
    if (!this.stage) return;
    this.stage.pivot.set(position.x, position.y);
    this.stage.position.set(this.container.clientWidth / 2, this.container.clientHeight / 2);
  }

  createSprite(color = 0x00ffff, size = 20) {
    const g = new PIXI.Graphics();
    g.rect(-size / 2, -size / 2, size, size).fill({ color, alpha: 0.95 });
    g.filters = [new PIXI.NoiseFilter(0.15)];
    return g;
  }

  flash() {
    if (!this.flashOverlay) return;
    this.flashOverlay.alpha = 0.3;
    const ticker = PIXI.Ticker.shared;
    const fade = () => {
      this.flashOverlay.alpha -= 0.02;
      if (this.flashOverlay.alpha <= 0) {
        this.flashOverlay.alpha = 0;
        ticker.remove(fade);
      }
    };
    ticker.add(fade);
  }
}

export default Renderer;
