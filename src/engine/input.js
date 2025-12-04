class Input {
  constructor() {
    this.keys = new Set();
    this.handleKeyDown = (e) => this.onKeyDown(e);
    this.handleKeyUp = (e) => this.onKeyUp(e);
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  onKeyDown(event) {
    const key = event.key.toLowerCase();
    if (['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright'].includes(key)) {
      this.keys.add(key);
    }
  }

  onKeyUp(event) {
    const key = event.key.toLowerCase();
    this.keys.delete(key);
  }

  destroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }

  getDirection() {
    const up = this.keys.has('w') || this.keys.has('arrowup');
    const down = this.keys.has('s') || this.keys.has('arrowdown');
    const left = this.keys.has('a') || this.keys.has('arrowleft');
    const right = this.keys.has('d') || this.keys.has('arrowright');
    return { up, down, left, right };
  }
}

export default Input;
