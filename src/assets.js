const INLINE_PLAYER_SPRITES = {
  playerIdle:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKoAAAEECAYAAAC4F6+oAAADqElEQVR42u3dsU3DUBiF0UzhgoICeoQoGSBDMEmGYCGa1B6CXUB0EUoky3qO//ve+aTbUsRHjvQUm8NBkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiSpSS/vrz8+BZVHejmfiCKgQqs4qNAqDiqwioIKreKgQqs4qMAqCiq0ioMKreKgAqsoqNAqDiq0ioMKrGKQQqtIqNAKVIEKqnaBOk1TiblioIIqUEEVqAIVVIEKqnqF6pgKVFAFKqjaHCmoAhVU9QoVVlBBFaigClSBWhEqrKCCKlBBFagCFVSBuhIqrKCCqjykoApUUDUCVFhBBVWggipQBSqoAnUlVFhB9UpKgQqqQBWosApUUNUzUlBBBVWggqrhoMIKKqgCFXKBCiqooApUUAUlqKCCKlBBBdVAhRRUgQoqqKAKVFAFKqiggipQQRWooIIKqkAFFVQDFVRQBSqooIIqUEEVpKCCCqpABVWgggoqqAIVVFANVFAv93GsORpABVWgggoqqAIVVIEKKqigClRQVeWwH1SBCiqooApUUAUqqKCCKlBBFaigggqqQAUVVFAFanmonpECFVSBCiqooGpMpKAK1AZQYQUVVIEKKqigCtSKUGEFFVSBCiqooGo8qA9PjyUHKqhxUGEFFVSBCiqooApUUFUKacrxFKyggipQQQUVVIFaFSqsoIIqUEEFFVSBCqpABRXUnqHCCiqoAnVvqF/nGXBQQQV1MKin+fvqWnz1wwoqqKCC+h8qrKCCKlArQIU1FGq1Z6VuQZ1Pn1cHKqjdQoUVVFBhBbUlVFhBBRVUUFtChTUIasrxFKigDg0VVlBBBRXUllBhbQj1+Pa8yUAFtSnWUaH+Aao4UEEFFVRQQQUVVFBBBRVUUEEFFVRQQQW1HlZQQR0a6totuZhr/i6onUFdCwFUUN1RQQV1FKi3dutHKfd4FaUfrIAKKqhjQYUVVFBBXY4V1H2hwgrqoi15CgJUUEGFtQbUqu/yBzUcaus7Vg9QYXVHBRVUUNOgClRQ07FuBTT5H6OBCmosVFhBBVWgggoqqAIVVFBBBRXUnqHCWuDgf5Q3T4MKKqgCFVRQQQUVVFAF6g5QYQUVVIEKKqygClRQQQUVVlBBFaigggoqqKCCKlBBhRVUWEEFVaCCCiqoFIEKqkAFFdShoMIKKqi6L1ZQBSqooIIKKqgdQYUVVFAFKqiggipQQdUmVYXqyghUgQqqQBWooApUUAUqQAVVoIIqUDfrFyokpsG8xPp4AAAAAElFTkSuQmCC',
  playerWalk1:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKoAAAEECAYAAAC4F6+oAAADsElEQVR42u3dsU3DQBSA4UzhgoICeoQoGSBDMEmGYCGa1B6CXUB0EYoly7qz37v3/dJrU9ifbOlsX04nSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZKkJr28v/44CgqP9HYcEaWACq3SQYVW6aACq1RQoVU6qNAqHVRglQoqtEoHFVqlgwqsUkGFVumgQqt0UIFVGqTQKiVUaAWqQAVVh0CdpinEOGOggipQQRWoAhVUgQqqRoVqmQpUUAUqqOqOFFSBCqpGhQorqKAKVFAFqkCNCBVWUEEVqKAKVIEKqkDdCBVWUEFVPqSgClRQVQEqrKCCKlBBFagCFVSBuhEqrKDaklKggipQBSqsAhVUjYwUVFBBFaigqhxUWEEFVaBCLlBBBRVUgQqqoAQVVFAFKqigGlAhBVWgggoqqAIVVIEKKqigClRQBSqooIIqUEEF1YAKKqgCFVRQQRWooApSUEEFVaCCKlBBBRVUgQoqqAZUUG/n4xxzaAAVVIEKKqigClRQBSqooIIqUEFVlMV+UAUqqKCCKlBBFaigggqqQAVVoIIKKqgCFVRQQRWo4aH6RgpUUAUqqKCCqppIQRWoDaDCCiqoAhVUUEEVqBGhwgoqqAIVVFBBVT2oD0+PIQdUUNNBhRVUUAUqqKCCKlBBVSikWZanYAUVVIEKKqigCtSoUGEFFVSBCiqooApUUAUqqKCODBVWUEEVqEdD/brOgIMKKqjFoF7m77vT4tYPK6igggrqf6iwggqqQI0AFdakUKN9K7UEdb583h1QQR0WKqygggorqC2hwgoqqKCC2hIqrImgZlmeAhXU0lBhBRVUUEFtCRXWhlDPb89dBlRQm2KtCvUPUMQBFVRQQQUVVFBBBRVUUEEFFVRQQQUVVFDjYQUV1NJQt86ak7nld0EdDOpWCKCC6ooKKqhVoC7N0kspe2xF6YUVUEEFtRZUWEEFFdT1WEE9FiqsoK6aNV9BgAoqqLDGgNrqESiooHZ9MjUCVFhdUUEFFdRsUAUqqNmx9gLaeseUozcmpgfUFFBhBRVUjQN1z/9EBRVUUAUqqKCCCiqoWaDCGmDhv8rO06CCCqpABRVUUEEFFVSBetAjWYpABVWgggorqAIVVFBBhRVUUAUqqKCCCiqooApUUGEFFVZQQRWooIIKqkAFVaCCCmoZqLCCCqr2xQqqQAUVVFBBBXUgqLCCCqpABRVUUAUqqOpSVKjOjEAVqKAKVIEKqkAFVaAKVFAFKqgCtVu/mv6difHPxZoAAAAASUVORK5CYII=',
  playerWalk2:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKoAAAEECAYAAAC4F6+oAAADsElEQVR42u3dv2nDQBjGYU/hIkWKpA8hkSFGhMiRN/kFUFEshchbqm0cZOG1BBlQHxAMtJooYCV5zKP6e/3nu+kzXiflpBgn2kZxw6SZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZLUtN79908rg8JDeA0hQYVVoEKKqjkqoMKqUEEVVMdAhRVWkAFFVScUVGBVBSio4qqACqigipgqAoqqQBWooMqY6BSioooEqaolhLUVVIEKKqjipgBooIIqYKoKKqkAFFRQQVUwVSnRVgwqsgoQVVXBVgQopqOiqgAqqqAKmCoCiqpAhRUVFVBhVQcVUlUEFVEgQqqoIqY6CCiqgClgwqqqKqqqAKmCoCiqpABRVUUFVMFUp1VYIKraR6lqoMJqQAUVVHBVQQVUUAUVUEEVNFVOUh1VMJSUUUFFVJBBS2lFBRVQQVUwVQVUUAFVUAUV1FRjTBqVUEFFRB1VQQVVXlRRUUFVMFVBFVRQBVVBBRbRXUaLXVYQQVUUFVMFUFVFAAUVEEFVRUVNMJpVQQUVEEVVFBRVWeUVFFBVTAUUVUEFVUAUV1ExjTJqUUEFFRB1VQQVVXlRRUUFVMFVBFVRQBVVBBRbRzU7njBKKqgigippCKqqMKqqKAKqAqKoCgqqoIKqaAqqoAKqaCKmuqHKjBJqqiCiimpoAqqqACqmgKqqgAqpsIKqbB6lqoMJqQAUVVHBVQQVUUAUVUEEVNFVOUh1VMJSUUUFFVJBBS2lFBRVQQVUwVQVUUAFVUAUV1FRjTBqVUEFFRB1VQQVVXlRRUUFVMFVBFVRQBVVBBRbRXUaLXVYQQVUUFVMFUFVFAAUVEEFVRUVNMJpVQQUVEEVVFBRVWeUVFFBVTAUUVUEFVUAUV1ExjTJqUUEFFRB1VQQVVXlRRUUFVMFVBFVRQBVVBBRbRzU7njBKKqgigippCKqqMKqqKAKqAqKoCgqqoIKqaAqqoAKqaCKmuqHKjBJqqiCiimpoAqqqACqmgeclSxks3M5/ZNz6GHBJrk1rzI5KfF25AAAABJRU5ErkJggg=='
};

const SPRITE_SOURCES = {
  ...INLINE_PLAYER_SPRITES,
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
