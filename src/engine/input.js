// Handles keyboard input for movement
class Input {
  constructor() {
    this.keys = new Set();
    this.movement = { x: 0, y: 0 };
    window.addEventListener('keydown', (e) => this.onKey(e, true));
    window.addEventListener('keyup', (e) => this.onKey(e, false));
  }

  onKey(event, down) {
    const key = event.key.toLowerCase();
    const tracked = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'];
    if (!tracked.includes(key)) return;
    event.preventDefault();
    if (down) {
      this.keys.add(key);
    } else {
      this.keys.delete(key);
    }
    this.computeMovement();
  }

  computeMovement() {
    let x = 0;
    let y = 0;
    if (this.keys.has('w') || this.keys.has('arrowup')) y -= 1;
    if (this.keys.has('s') || this.keys.has('arrowdown')) y += 1;
    if (this.keys.has('a') || this.keys.has('arrowleft')) x -= 1;
    if (this.keys.has('d') || this.keys.has('arrowright')) x += 1;
    const len = Math.hypot(x, y) || 1;
    this.movement = { x: x / len, y: y / len };
  }
}

export default Input;
