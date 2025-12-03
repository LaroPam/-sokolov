const WEAPON_DEFS = [
  {
    id: 'shard',
    name: 'Осколочный резонатор',
    description: 'Сбалансированное оружие: средний урон, базовый темп и умеренный разброс.',
    icon: './assets/weapon_shard_icon.svg',
    stats: {
      damage: 12,
      attackCooldown: 0.9,
      attackRadius: 280,
      projectileSpeed: 340,
    },
    weapon: {
      count: 1,
      spread: 0.12,
      projectile: 'shard',
      lifespan: 1.7,
    },
    startingOrbitals: 0,
    upgrades: [
      {
        title: 'Дуплекс-осколок',
        description: '+1 снаряд и чуть больший веер удара',
        apply: (player) => {
          player.weapon.count = Math.min(player.weapon.count + 1, 5);
          player.weapon.spread += 0.06;
        },
      },
      {
        title: 'Сжатая сборка',
        description: '-15% к перезарядке автоатаки',
        apply: (player) => {
          player.stats.attackCooldown *= 0.85;
        },
      },
      {
        title: 'Кристальный урон',
        description: '+25% к урону осколков',
        apply: (player) => {
          player.stats.damage *= 1.25;
        },
      },
      {
        title: 'Инерция пакетов',
        description: '+20% к скорости снарядов',
        apply: (player) => {
          player.stats.projectileSpeed *= 1.2;
        },
      },
    ],
  },
  {
    id: 'arc',
    name: 'Дуга данных',
    description: 'Тяжелые дуговые копья: высокий урон, чуть медленнее перезарядка.',
    icon: './assets/weapon_arc_icon.svg',
    stats: {
      damage: 18,
      attackCooldown: 1.05,
      attackRadius: 320,
      projectileSpeed: 380,
    },
    weapon: {
      count: 1,
      spread: 0.05,
      projectile: 'arc',
      lifespan: 1.9,
    },
    startingOrbitals: 0,
    upgrades: [
      {
        title: 'Двойная дуга',
        description: '+1 дуговой снаряд с плотным конусом',
        apply: (player) => {
          player.weapon.count = Math.min(player.weapon.count + 1, 3);
          player.weapon.spread = Math.max(0.04, player.weapon.spread - 0.01);
        },
      },
      {
        title: 'Глубокий прожиг',
        description: '+30% к урону дуги',
        apply: (player) => {
          player.stats.damage *= 1.3;
        },
      },
      {
        title: 'Импульс ускорения',
        description: '-18% к перезарядке дуги',
        apply: (player) => {
          player.stats.attackCooldown *= 0.82;
        },
      },
      {
        title: 'Цепная искра',
        description: 'Попадания дуги дают искру, которая бьет еще одну цель (45% урона)',
        apply: (player, game) => {
          game.chainLightning = true;
        },
      },
    ],
  },
  {
    id: 'fan',
    name: 'Веер импульсов',
    description: 'Сразу три импульсных выстрела, большой веер и быстрый темп.',
    icon: './assets/weapon_fan_icon.svg',
    stats: {
      damage: 9,
      attackCooldown: 0.85,
      attackRadius: 260,
      projectileSpeed: 360,
    },
    weapon: {
      count: 3,
      spread: 0.35,
      projectile: 'shard',
      lifespan: 1.4,
    },
    startingOrbitals: 0,
    upgrades: [
      {
        title: 'Расщепленный веер',
        description: '+2 импульса и шире конус',
        apply: (player) => {
          player.weapon.count = Math.min(player.weapon.count + 2, 7);
          player.weapon.spread += 0.05;
        },
      },
      {
        title: 'Фокусировка луча',
        description: 'Сужает веер и ускоряет импульсы',
        apply: (player) => {
          player.weapon.spread = Math.max(0.22, player.weapon.spread - 0.08);
          player.stats.projectileSpeed *= 1.18;
        },
      },
      {
        title: 'Рекурсивная подача',
        description: '-16% к перезарядке и +10% урона импульсов',
        apply: (player) => {
          player.stats.attackCooldown *= 0.84;
          player.stats.damage *= 1.1;
        },
      },
      {
        title: 'Сканер сети',
        description: '+20% радиуса автоатаки',
        apply: (player) => {
          player.stats.attackRadius *= 1.2;
        },
      },
    ],
  },
  {
    id: 'mine',
    name: 'Импульсные мины',
    description: 'Медленные, тяжелые снаряды, которые висят чуть дольше.',
    icon: './assets/weapon_mine_icon.svg',
    stats: {
      damage: 22,
      attackCooldown: 1.35,
      attackRadius: 260,
      projectileSpeed: 230,
    },
    weapon: {
      count: 1,
      spread: 0.02,
      projectile: 'arc',
      lifespan: 2.2,
    },
    startingOrbitals: 0,
    upgrades: [
      {
        title: 'Дуплекс-мины',
        description: 'Выстреливает +1 мину рядом с основной',
        apply: (player) => {
          player.weapon.count = Math.min(player.weapon.count + 1, 3);
          player.weapon.spread = Math.max(player.weapon.spread, 0.06);
        },
      },
      {
        title: 'Растянутый импульс',
        description: '+20% к длительности и урону мин',
        apply: (player) => {
          player.weapon.lifespan *= 1.2;
          player.stats.damage *= 1.2;
        },
      },
      {
        title: 'Протокол ускорения',
        description: '-15% к перезарядке мин',
        apply: (player) => {
          player.stats.attackCooldown *= 0.85;
        },
      },
      {
        title: 'Гравитационный якорь',
        description: 'Мины двигаются быстрее и точнее',
        apply: (player) => {
          player.stats.projectileSpeed *= 1.22;
          player.weapon.spread = Math.max(0.015, player.weapon.spread - 0.01);
        },
      },
    ],
  },
  {
    id: 'orbit',
    name: 'Орбитальный копьевой',
    description: 'Базовая автоатака и стартовые орбитальные дроны.',
    icon: './assets/weapon_orbit_icon.svg',
    stats: {
      damage: 11,
      attackCooldown: 1,
      attackRadius: 300,
      projectileSpeed: 320,
    },
    weapon: {
      count: 1,
      spread: 0.04,
      projectile: 'shard',
      lifespan: 1.6,
    },
    startingOrbitals: 2,
    upgrades: [
      {
        title: 'Дополнительный дрон',
        description: '+1 орбитальный дрон',
        apply: (player) => {
          player.addOrbital({ radius: 78, speed: 2.4, damage: player.stats.damage * 0.55, sprite: 'default' });
        },
      },
      {
        title: 'Сжатое копьё',
        description: '-18% перезарядки и более быстрый выстрел',
        apply: (player) => {
          player.stats.attackCooldown *= 0.82;
          player.stats.projectileSpeed *= 1.15;
        },
      },
      {
        title: 'Лезвие орбиты',
        description: 'Орбитальные дроны наносят +30% урона и вращаются быстрее',
        apply: (player) => {
          player.orbitals.forEach((orb) => {
            orb.damage *= 1.3;
            orb.speed *= 1.15;
          });
        },
      },
      {
        title: 'Усиленный шип',
        description: '+1 снаряд и плотнее прицеливание',
        apply: (player) => {
          player.weapon.count = Math.min(player.weapon.count + 1, 3);
          player.weapon.spread = Math.max(0.02, player.weapon.spread - 0.01);
        },
      },
    ],
  },
];

function getWeaponById(id) {
  return WEAPON_DEFS.find((w) => w.id === id) || WEAPON_DEFS[0];
}

export { WEAPON_DEFS, getWeaponById };
