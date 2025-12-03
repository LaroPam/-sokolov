const SPRITE_SOURCES = {
  playerIdle: './assets/player_idle.svg',
  playerWalk1: './assets/player_walk1.svg',
  playerWalk2: './assets/player_walk2.svg',
  playerAttack: './assets/player_attack.svg',
  playerHurt: './assets/player_hurt.svg',
  enemyUndead1: './assets/enemy_undead_1.svg',
  enemyUndead2: './assets/enemy_undead_2.svg',
  enemyVampire1: './assets/enemy_vampire_1.svg',
  enemyVampire2: './assets/enemy_vampire_2.svg',
  enemySkeleton1: './assets/enemy_skeleton_1.svg',
  enemySkeleton2: './assets/enemy_skeleton_2.svg',
  enemyBoss1: './assets/enemy_boss_1.svg',
  enemyBoss2: './assets/enemy_boss_2.svg',
  projectileSword: './assets/projectile_sword.svg',
  projectileKnife: './assets/projectile_knife.svg',
  projectileBolt: './assets/projectile_bolt.svg',
  projectileArrow: './assets/projectile_arrow.svg',
  projectileOrb: './assets/projectile_orb.svg',
  orbitalCore: './assets/orbital_core.svg',
  weaponSwordIcon: './assets/weapon_sword_icon.svg',
  weaponKnifeIcon: './assets/weapon_knife_icon.svg',
  weaponCrossbowIcon: './assets/weapon_crossbow_icon.svg',
  weaponBowIcon: './assets/weapon_bow_icon.svg',
  weaponStaffIcon: './assets/weapon_staff_icon.svg',
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
  icons: {
    sword: 'weaponSwordIcon',
    knife: 'weaponKnifeIcon',
    crossbow: 'weaponCrossbowIcon',
    bow: 'weaponBowIcon',
    staff: 'weaponStaffIcon',
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
