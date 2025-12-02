function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalize(x, y) {
  const len = Math.hypot(x, y) || 1;
  return { x: x / len, y: y / len };
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export { clamp, normalize, distance };
