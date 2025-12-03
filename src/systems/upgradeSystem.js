class UpgradeSystem {
  constructor() {
    this.createPool();
  }

  reset() {
    this.createPool();
  }

  createPool() {
    this.options = [
      {
        title: 'Сверхскорость',
        description: '+20% к скорости перемещения',
        apply: (player) => {
          player.stats.speed *= 1.2;
        },
      },
      {
        title: 'Оптимизация кода',
        description: '-18% к перезарядке автоатаки',
        apply: (player) => {
          player.stats.attackCooldown *= 0.82;
        },
      },
      {
        title: 'Усиленные пакеты',
        description: '+25% к урону снарядов',
        apply: (player) => {
          player.stats.damage *= 1.25;
        },
      },
      {
        title: 'Расширенная зона',
        description: '+18% к радиусу автоатаки',
        apply: (player) => {
          player.stats.attackRadius *= 1.18;
        },
      },
      {
        title: 'Патч регенерации',
        description: 'Мгновенно восстанавливает 45 HP и увеличивает максимум на 20',
        apply: (player) => {
          player.maxHealth += 20;
          player.health = Math.min(player.maxHealth, player.health + 45);
        },
      },
      {
        title: 'Орбитальные искры',
        description: 'Добавляет импульсный разряд вокруг игрока каждые 3.5 секунды',
        apply: (player, game) => {
          if (!game.orbitTimer) game.orbitTimer = 0;
          const originalUpdate = player.update.bind(player);
          player.update = (dt, input) => {
            originalUpdate(dt, input);
            game.orbitTimer += dt;
            if (game.orbitTimer >= 3.5) {
              game.orbitTimer = 0;
              game.entities.enemies.forEach((enemy) => {
                if (!enemy.isAlive) return;
                const dist = Math.hypot(enemy.position.x - player.position.x, enemy.position.y - player.position.y);
                if (dist < 160) {
                  enemy.takeDamage(player.stats.damage * 1.5);
                }
              });
            }
          };
        },
      },
      {
        title: 'Электрический разряд',
        description: 'При попадании снаряда цепная искра наносит 45% урона еще одной цели',
        apply: (player, game) => {
          game.chainLightning = true;
        },
      },
      {
        title: 'ASCII-дробовик',
        description: 'Автоатака выпускает +1 символ с небольшим разбросом',
        apply: (player) => {
          player.weapon.count = Math.min(player.weapon.count + 1, 4);
          player.weapon.spread += 0.06;
        },
      },
      {
        title: 'Стабильная сборка',
        description: '-12% входящего урона, +10% к максимуму HP',
        apply: (player) => {
          player.stats.mitigation = Math.min(0.35, player.stats.mitigation + 0.12);
          player.maxHealth = Math.round(player.maxHealth * 1.1);
          player.health = Math.min(player.maxHealth, player.health + 15);
        },
      },
      {
        title: 'Орбитальный дрон',
        description: 'Добавляет дрон-* вокруг героя, наносящий урон в ближнем бою',
        apply: (player) => {
          player.addOrbital({ radius: 78, speed: 2.4, damage: player.stats.damage * 0.5, sprite: 'default' });
        },
      },
      {
        title: 'Глитч-щит',
        description: '+20% к скорости снарядов, +1 к количеству снарядов, короткий свечащийся барьер',
        apply: (player) => {
          player.stats.projectileSpeed *= 1.2;
          player.weapon.count = Math.min(player.weapon.count + 1, 4);
          player.addOrbital({ radius: 48, speed: 3.6, damage: player.stats.damage * 0.35, sprite: 'default' });
        },
      },
      {
        title: 'Глитч-магнит',
        description: '+25% к радиусу автоатаки и небольшой авто-лечащий тик',
        apply: (player) => {
          player.stats.attackRadius *= 1.25;
          const originalUpdate = player.update.bind(player);
          player.update = (dt, input) => {
            originalUpdate(dt, input);
            player.health = Math.min(player.maxHealth, player.health + dt * 2.5);
          };
        },
      },
    ];
  }

  getChoices() {
    const shuffled = [...this.options].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }
}

export default UpgradeSystem;
