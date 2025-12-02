import { distance } from '../utils/math.js';

class CollisionSystem {
  static handleProjectiles(projectiles, enemies, onHit) {
    projectiles.forEach((proj) => {
      if (!proj.isAlive) return;
      for (const enemy of enemies) {
        if (!enemy.isAlive) continue;
        if (distance(proj.position, enemy.position) < enemy.size) {
          proj.isAlive = false;
          if (onHit) onHit(enemy, proj.damage);
          break;
        }
      }
    });
  }

  static handlePlayer(enemies, player, onTouch) {
    for (const enemy of enemies) {
      if (!enemy.isAlive) continue;
      const hitRadius = enemy.size + 14;
      if (distance(enemy.position, player.position) < hitRadius) {
        if (onTouch) onTouch(enemy);
      }
    }
  }
}

export default CollisionSystem;
