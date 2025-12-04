class UpgradeSystem {
  constructor() {
    this.weapon = null;
    this.createPool();
  }

  configureForWeapon(weaponDef) {
    this.weapon = weaponDef;
    this.createPool();
  }

  createPool() {
    this.options = this.weapon?.upgrades ? [...this.weapon.upgrades] : [];
  }

  getChoices() {
    const shuffled = [...this.options].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }
}

export default UpgradeSystem;
