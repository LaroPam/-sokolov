const COLOR_PALETTE = {
  playerIdle: '#d9ecde',
  playerWalk: '#c0e4cf',
  playerAttack: '#f5d36c',
  playerHurt: '#f26b6b',
  undead: '#7ebf86',
  vampire: '#c97ba3',
  skeleton: '#b7c7d3',
  boss: '#e0ad6b',
  projectileSword: '#f2c94c',
  projectileKnife: '#d97757',
  projectileBolt: '#9ac3ff',
  projectileArrow: '#b8d08c',
  projectileOrb: '#9ce0d9',
  orbital: '#82f0c8',
  background: '#0f1514',
};

function makeImage(draw, size = 72) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  draw(ctx, size);
  const img = new Image();
  img.src = canvas.toDataURL('image/png');
  return img;
}

function ensureImageLoaded(img) {
  return new Promise((resolve) => {
    if (!img) return resolve();
    if (img.complete) return resolve();
    img.onload = () => resolve();
    img.onerror = () => resolve();
  });
}

function circle(ctx, size, color, radiusFactor = 0.35) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * radiusFactor, 0, Math.PI * 2);
  ctx.fill();
}

function makeSprites() {
  const sprites = {};
  sprites.playerIdle = makeImage((ctx, s) => {
    circle(ctx, s, COLOR_PALETTE.playerIdle, 0.32);
    ctx.fillStyle = '#132a2b';
    ctx.fillRect(s / 2 - 6, s / 2 - 4, 4, 8);
    ctx.fillRect(s / 2 + 2, s / 2 - 4, 4, 8);
  });
  sprites.playerWalk1 = makeImage((ctx, s) => {
    circle(ctx, s, COLOR_PALETTE.playerWalk, 0.32);
    ctx.fillStyle = '#132a2b';
    ctx.fillRect(s / 2 - 8, s / 2 - 2, 5, 10);
    ctx.fillRect(s / 2 + 4, s / 2 - 6, 5, 14);
  });
  sprites.playerWalk2 = makeImage((ctx, s) => {
    circle(ctx, s, COLOR_PALETTE.playerWalk, 0.32);
    ctx.fillStyle = '#132a2b';
    ctx.fillRect(s / 2 - 6, s / 2 - 6, 5, 14);
    ctx.fillRect(s / 2 + 2, s / 2 - 2, 5, 10);
  });
  sprites.playerAttack = makeImage((ctx, s) => {
    circle(ctx, s, COLOR_PALETTE.playerAttack, 0.34);
    ctx.strokeStyle = '#ffe69c';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(s / 2, s / 2, s * 0.34, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
  });
  sprites.playerHurt = makeImage((ctx, s) => {
    circle(ctx, s, COLOR_PALETTE.playerHurt, 0.34);
    ctx.strokeStyle = '#ffd7d7';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(s / 2, s / 2, s * 0.24, 0, Math.PI * 2);
    ctx.stroke();
  });

  const makeEnemy = (color) =>
    makeImage((ctx, s) => {
      circle(ctx, s, color, 0.3);
      ctx.fillStyle = '#0c0f10';
      ctx.fillRect(s / 2 - 6, s / 2 - 10, 4, 8);
      ctx.fillRect(s / 2 + 2, s / 2 - 10, 4, 8);
    });

  sprites.enemyUndead1 = makeEnemy(COLOR_PALETTE.undead);
  sprites.enemyUndead2 = makeEnemy('#6ea976');
  sprites.enemyVampire1 = makeEnemy(COLOR_PALETTE.vampire);
  sprites.enemyVampire2 = makeEnemy('#a45c84');
  sprites.enemySkeleton1 = makeEnemy(COLOR_PALETTE.skeleton);
  sprites.enemySkeleton2 = makeEnemy('#dfe8f0');
  sprites.enemyBoss1 = makeEnemy(COLOR_PALETTE.boss);
  sprites.enemyBoss2 = makeEnemy('#d19152');

  const projectile = (color, widthFactor = 0.26, heightFactor = 0.08) =>
    makeImage((ctx, s) => {
      ctx.save();
      ctx.translate(s / 2, s / 2);
      ctx.rotate(-Math.PI / 6);
      ctx.fillStyle = color;
      ctx.fillRect((-s * widthFactor) / 2, (-s * heightFactor) / 2, s * widthFactor, s * heightFactor);
      ctx.restore();
    }, 56);

  sprites.projectileSword = projectile(COLOR_PALETTE.projectileSword, 0.55, 0.16);
  sprites.projectileKnife = projectile(COLOR_PALETTE.projectileKnife, 0.36, 0.12);
  sprites.projectileBolt = projectile(COLOR_PALETTE.projectileBolt, 0.5, 0.14);
  sprites.projectileArrow = projectile(COLOR_PALETTE.projectileArrow, 0.42, 0.12);
  sprites.projectileOrb = makeImage((ctx, s) => {
    circle(ctx, s, COLOR_PALETTE.projectileOrb, 0.22);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(s / 2, s / 2, s * 0.18, Math.PI / 4, Math.PI);
    ctx.stroke();
  }, 56);

  sprites.orbitalCore = makeImage((ctx, s) => {
    circle(ctx, s, COLOR_PALETTE.orbital, 0.18);
    ctx.strokeStyle = '#dfffee';
    ctx.lineWidth = 2;
    ctx.strokeRect(s / 2 - 8, s / 2 - 8, 16, 16);
  }, 48);

  sprites.backgroundTile = makeImage((ctx, s) => {
    ctx.fillStyle = COLOR_PALETTE.background;
    ctx.fillRect(0, 0, s, s);
    ctx.strokeStyle = '#0f2623';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, s - 2, s - 2);
    ctx.strokeStyle = '#1e3d34';
    ctx.beginPath();
    ctx.moveTo(0, s / 2);
    ctx.lineTo(s, s / 2);
    ctx.moveTo(s / 2, 0);
    ctx.lineTo(s / 2, s);
    ctx.stroke();
  }, 96);

  const icon = (color, glyph) =>
    makeImage((ctx, s) => {
      ctx.fillStyle = 'rgba(0,0,0,0.65)';
      ctx.fillRect(0, 0, s, s);
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(3, 3, s - 6, s - 6);
      ctx.fillStyle = color;
      ctx.font = 'bold 34px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(glyph, s / 2, s / 2 + 2);
    }, 72).src;

  const iconSources = {
    sword: icon('#f2c94c', 'S'),
    knife: icon('#d97757', 'K'),
    crossbow: icon('#9ac3ff', 'X'),
    bow: icon('#b8d08c', 'B'),
  };

  return { sprites, iconSources };
}

const SPRITE_SETS = {
  player: {
    idle: ['playerIdle'],
    walk: ['playerWalk1', 'playerWalk2'],
    attack: ['playerAttack'],
    hurt: ['playerHurt'],
  },
  enemies: {
    undead: ['enemyUndead1', 'enemyUndead2'],
    vampire: ['enemyVampire1', 'enemyVampire2'],
    skeleton: ['enemySkeleton1', 'enemySkeleton2'],
    graveLord: ['enemyBoss1', 'enemyBoss2'],
  },
  projectiles: {
    sword: 'projectileSword',
    knife: 'projectileKnife',
    bolt: 'projectileBolt',
    arrow: 'projectileArrow',
    orb: 'projectileOrb',
  },
  orbitals: {
    default: 'orbitalCore',
  },
  icons: {},
  background: 'backgroundTile',
};

async function loadAssets() {
  const { sprites, iconSources } = makeSprites();
  const cache = {};
  Object.entries(sprites).forEach(([key, img]) => {
    cache[key] = img;
  });
  SPRITE_SETS.icons = {
    sword: iconSources.sword,
    knife: iconSources.knife,
    crossbow: iconSources.crossbow,
    bow: iconSources.bow,
  };
  // Images created from in-memory canvases are immediately ready, but some
  // environments never fire onload for data URLs. Since we have everything
  // procedurally available already, return synchronously so the start button
  // can never be blocked by asset preloading.
  return { images: cache, sets: SPRITE_SETS };
}

export { SPRITE_SETS, loadAssets };
