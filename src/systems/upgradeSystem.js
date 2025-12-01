const upgradePool = [
  {
    name: 'Увеличение скорости',
    description: '+15% к скорости перемещения',
    apply: (player) => {
      player.speed = Math.round(player.speed * 1.15);
    },
  },
  {
    name: 'Снижение перезарядки',
    description: '-15% к задержке автоатаки',
    apply: (player) => {
      player.attackDelay = Math.max(150, Math.round(player.attackDelay * 0.85));
    },
  },
  {
    name: 'Усиление урона',
    description: '+20% к урону',
    apply: (player) => {
      player.damage = Math.round(player.damage * 1.2);
    },
  },
  {
    name: 'Орбитальная атака',
    description: 'Пульсирующая сфера наносит урон рядом',
    apply: (player) => {
      player.orbital = player.orbital || { timer: 0, damage: 6, radius: 120 };
      player.orbital.damage += 2;
    },
  },
  {
    name: 'Электрический разряд',
    description: 'Периодически бьёт ближайших врагов',
    apply: (player) => {
      player.chain = player.chain || { timer: 0, damage: 7, radius: 220 };
      player.chain.damage += 2;
    },
  },
  {
    name: 'Глитч-амплификатор',
    description: '+10% к области умений и радиусу атаки',
    apply: (player) => {
      player.attackRadius = Math.round(player.attackRadius * 1.1);
    },
  },
];

class UpgradeSystem {
  constructor(panelEl, onSelect) {
    this.panelEl = panelEl;
    this.onSelect = onSelect;
    this.deathOverlay = null;
  }

  reset() {
    this.panelEl.style.display = 'none';
    this.panelEl.innerHTML = '';
  }

  offer(player) {
    const options = this._pickRandom(upgradePool, 3);
    this.panelEl.style.display = 'flex';
    this.panelEl.innerHTML = '';
    options.forEach((upgrade) => {
      const card = document.createElement('div');
      card.className = 'upgrade-card';
      card.innerHTML = `<strong>${upgrade.name}</strong><br/><small>${upgrade.description}</small>`;
      card.addEventListener('click', () => {
        this.panelEl.style.display = 'none';
        this.onSelect(upgrade);
      });
      this.panelEl.appendChild(card);
    });
  }

  showDeathScreen(onRestart) {
    this.panelEl.style.display = 'flex';
    this.panelEl.innerHTML = '';
    const container = document.createElement('div');
    container.style.maxWidth = '480px';
    container.innerHTML = `
      <h2>Вы стёрлись...</h2>
      <p>Цифровые руины поглотили вас, но глитчи шепчут о новой попытке.</p>
      <button id="restart-btn">Новый забег</button>
    `;
    const btn = container.querySelector('#restart-btn');
    btn.style.padding = '10px 14px';
    btn.style.background = 'linear-gradient(135deg, #0ff, #f0f)';
    btn.style.border = 'none';
    btn.style.cursor = 'pointer';
    btn.addEventListener('click', () => {
      this.panelEl.style.display = 'none';
      onRestart();
    });
    this.panelEl.appendChild(container);
  }

  _pickRandom(pool, count) {
    const copy = [...pool];
    const selected = [];
    while (selected.length < count && copy.length) {
      const idx = Math.floor(Math.random() * copy.length);
      selected.push(copy.splice(idx, 1)[0]);
    }
    return selected;
  }
}

export default UpgradeSystem;
