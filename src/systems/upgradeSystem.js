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
        description: '-15% к перезарядке автоатаки',
        apply: (player) => {
          player.stats.attackCooldown *= 0.85;
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
        description: 'Мгновенно восстанавливает 35 HP и увеличивает максимум на 15',
        apply: (player) => {
          player.maxHealth += 15;
          player.health = Math.min(player.maxHealth, player.health + 35);
        },
      },
      {
        title: 'Орбитальные искры',
        description: 'Добавляет импульсный разряд вокруг игрока каждые 4 секунды',
        apply: (player, game) => {
          if (!game.orbitTimer) game.orbitTimer = 0;
          const originalUpdate = player.update.bind(player);
          player.update = (dt, input) => {
            originalUpdate(dt, input);
            game.orbitTimer += dt;
            if (game.orbitTimer >= 4) {
              game.orbitTimer = 0;
              game.entities.enemies.forEach((enemy) => {
                if (!enemy.isAlive) return;
                const dist = Math.hypot(enemy.position.x - player.position.x, enemy.position.y - player.position.y);
                if (dist < 140) {
                  enemy.takeDamage(player.stats.damage * 1.5);
                }
              });
            }
          };
        },
      },
      {
        title: 'Электрический разряд',
        description: 'При попадании снаряда цепная искра наносит 40% урона еще одной цели',
        apply: (player, game) => {
          game.chainLightning = true;
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
