// Basic game loop using requestAnimationFrame
class Loop {
  constructor(callback) {
    this.callback = callback;
    this.running = false;
    this.lastTime = 0;
    this.frame = this.frame.bind(this);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this.frame);
  }

  stop() {
    this.running = false;
  }

  frame(timestamp) {
    if (!this.running) return;
    const delta = timestamp - this.lastTime;
    this.lastTime = timestamp;
    this.callback(delta);
    requestAnimationFrame(this.frame);
  }
}

export default Loop;
