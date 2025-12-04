const weaponIcon = (color, glyph) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 72 72'><rect width='72' height='72' rx='10' ry='10' fill='rgba(0,0,0,0.7)'/><rect x='3' y='3' width='66' height='66' fill='none' stroke='${color}' stroke-width='3'/><text x='36' y='44' font-size='34' font-family='Courier New' font-weight='700' fill='${color}' text-anchor='middle'>${glyph}</text></svg>`)});

const WEAPON_DEFS = [
  {
    id: 'sword',
    name: 'Клинок стража',
    description: 'Ближний sweeping удар. Высокий урон, но нужно подойти к врагам.',
    icon: weaponIcon('#f2c94c', 'S'),
    stats: {
      damage: 26,
      attackCooldown: 0.95,
      attackRadius: 210,
      projectileSpeed: 0,
      speed: 190,
    },
    weapon: {
      kind: 'melee',
      arc: 1.35,
      range: 130,
      count: 1,
      sprite: 'sword',
    },
    startingOrbitals: 0,
    upgrades: [
      {
        title: 'Широкий размах',
        description: '+25% шире дуга клинка и небольшой push к скорости',
        apply: (player) => {
          player.weapon.arc *= 1.25;
          player.stats.speed += 10;
        },
      },
      {
        title: 'Закалённая сталь',
        description: '+20% к урону меча',
        apply: (player) => {
          player.stats.damage *= 1.2;
        },
      },
      {
        title: 'Укороченная стойка',
        description: '-18% к перезарядке удара',
        apply: (player) => {
          player.stats.attackCooldown *= 0.82;
        },
      },
      {
        title: 'Парирование',
        description: 'После удара получаете 10% уворота (митиг.) на 3с',
        apply: (player, game) => {
          game.parryBuff = 3;
          game.parryMitigation = 0.1;
        },
      },
    ],
  },
  {
    id: 'knife',
    name: 'Метательные клинки',
    description: 'Быстрые ножи вылетают один за другим, пробивая щели в орде.',
    icon: weaponIcon('#d97757', 'K'),
    stats: {
      damage: 12,
      attackCooldown: 0.55,
      attackRadius: 320,
      projectileSpeed: 420,
    },
    weapon: {
      kind: 'ranged',
      count: 1,
      spread: 0.08,
      projectile: 'knife',
      lifespan: 1.6,
      pierce: 0,
    },
    startingOrbitals: 0,
    upgrades: [
      {
        title: 'Двойной выпад',
        description: '+1 нож в очереди, плотнее конус',
        apply: (player) => {
          player.weapon.count = Math.min(player.weapon.count + 1, 4);
          player.weapon.spread = Math.max(0.05, player.weapon.spread - 0.015);
        },
      },
      {
        title: 'Отточенные лезвия',
        description: '+25% к урону ножей',
        apply: (player) => {
          player.stats.damage *= 1.25;
        },
      },
      {
        title: 'Быстрый бросок',
        description: '-15% к перезарядке',
        apply: (player) => {
          player.stats.attackCooldown *= 0.85;
        },
      },
      {
        title: 'Теневой шаг',
        description: '+12% скорости передвижения',
        apply: (player) => {
          player.stats.speed *= 1.12;
        },
      },
    ],
  },
  {
    id: 'crossbow',
    name: 'Арбалетный болт',
    description: 'Медленный, но тяжелый выстрел, проходящий насквозь.',
    icon: weaponIcon('#9ac3ff', 'X'),
    stats: {
      damage: 34,
      attackCooldown: 1.25,
      attackRadius: 360,
      projectileSpeed: 520,
    },
    weapon: {
      kind: 'ranged',
      count: 1,
      spread: 0,
      projectile: 'bolt',
      lifespan: 2.2,
      pierce: 2,
    },
    startingOrbitals: 0,
    upgrades: [
      {
        title: 'Проникающий наконечник',
        description: '+2 к пронзанию',
        apply: (player) => {
          player.weapon.pierce = (player.weapon.pierce || 0) + 2;
        },
      },
      {
        title: 'Тяжёлое плечо',
        description: '+30% к урону болтов',
        apply: (player) => {
          player.stats.damage *= 1.3;
        },
      },
      {
        title: 'Перезарядка на бедре',
        description: '-16% к перезарядке',
        apply: (player) => {
          player.stats.attackCooldown *= 0.84;
        },
      },
      {
        title: 'Дубовая колодка',
        description: '+25 к максимуму здоровья',
        apply: (player) => {
          player.maxHealth += 25;
          player.health += 25;
        },
      },
    ],
  },
  {
    id: 'bow',
    name: 'Лучные залпы',
    description: 'Несколько медленных стрел летят дугой, расчищая коридор.',
    icon: weaponIcon('#b8d08c', 'B'),
    stats: {
      damage: 11,
      attackCooldown: 1.05,
      attackRadius: 360,
      projectileSpeed: 340,
    },
    weapon: {
      kind: 'ranged',
      count: 3,
      spread: 0.35,
      projectile: 'arrow',
      lifespan: 1.8,
      pierce: 1,
    },
    startingOrbitals: 0,
    upgrades: [
      {
        title: 'Дополнительная тетива',
        description: '+1 стрела в залпе',
        apply: (player) => {
          player.weapon.count = Math.min(player.weapon.count + 1, 5);
        },
      },
      {
        title: 'Усиленное перо',
        description: '+15% урона и +10% скорости стрел',
        apply: (player) => {
          player.stats.damage *= 1.15;
          player.stats.projectileSpeed *= 1.1;
        },
      },
      {
        title: 'Быстрый взвод',
        description: '-14% к перезарядке',
        apply: (player) => {
          player.stats.attackCooldown *= 0.86;
        },
      },
      {
        title: 'Дальний прицел',
        description: '+20% радиуса автоатаки',
        apply: (player) => {
          player.stats.attackRadius *= 1.2;
        },
      },
    ],
  },
];

function getWeaponById(id) {
  return WEAPON_DEFS.find((w) => w.id === id) || WEAPON_DEFS[0];
}

export { WEAPON_DEFS, getWeaponById };
