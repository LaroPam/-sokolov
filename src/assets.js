const SPRITE_SOURCES = {
  playerIdle: './assets/player_idle.svg',
  playerWalk1: './assets/player_walk1.svg',
  playerWalk2: './assets/player_walk2.svg',
  playerAttack: './assets/player_attack.svg',
  playerHurt: './assets/player_hurt.svg',
  glitch1: './assets/enemy_glitch_1.svg',
  glitch2: './assets/enemy_glitch_2.svg',
  leech1: './assets/enemy_leech_1.svg',
  leech2: './assets/enemy_leech_2.svg',
  crawler1: './assets/enemy_crawler_1.svg',
  crawler2: './assets/enemy_crawler_2.svg',
  wraith1: './assets/enemy_wraith_1.svg',
  wraith2: './assets/enemy_wraith_2.svg',
  projectileShard: './assets/projectile_shard.svg',
  projectileArc: './assets/projectile_arc.svg',
  orbitalCore: './assets/orbital_core.svg',
  backgroundTile: './assets/background_tile.svg',
};

const SPRITE_SETS = {
  player: {
    idle: ['playerIdle'],
    walk: ['playerWalk1', 'playerWalk2'],
    attack: ['playerAttack'],
    hurt: ['playerHurt'],
  },
  enemies: {
    glitchBug: ['glitch1', 'glitch2'],
    dataLeech: ['leech1', 'leech2'],
    corruptedCrawler: ['crawler1', 'crawler2'],
    nullWraith: ['wraith1', 'wraith2'],
  },
  projectiles: {
    shard: 'projectileShard',
    arc: 'projectileArc',
  },
  orbitals: {
    default: 'orbitalCore',
  },
  background: 'backgroundTile',
};

async function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function loadAssets() {
  const entries = Object.entries(SPRITE_SOURCES);
  const cache = {};
  await Promise.all(
    entries.map(([key, src]) =>
      loadImage(src)
        .then((img) => {
          cache[key] = img;
        })
        .catch((err) => {
          console.error('Не удалось загрузить ассет', key, err);
        }),
    ),
  );
  return { images: cache, sets: SPRITE_SETS };
}

export { SPRITE_SOURCES, SPRITE_SETS, loadAssets };
