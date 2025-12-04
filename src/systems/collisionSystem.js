import { distance } from '../utils/math.js';

class CollisionSystem {
  static handleProjectiles(projectiles, enemies, onHit) {
    projectiles.forEach((proj) => {
      if (!proj.isAlive) return;
      for (const enemy of enemies) {
        if (!enemy.isAlive) continue;
        const hit = CollisionSystem.projectileHits(proj, enemy);
        if (!hit) continue;
        if (proj.splashRadius && proj.splashRadius > 0) {
          enemies.forEach((aoeTarget) => {
            if (!aoeTarget.isAlive) return;
            if (distance(aoeTarget.position, enemy.position) <= proj.splashRadius) {
              onHit?.(aoeTarget, proj.damage);
            }
          });
        } else {
          onHit?.(enemy, proj.damage);
        }
        if (proj.pierce > 0) {
          proj.pierce -= 1;
          if (proj.pierce < 0) proj.isAlive = false;
        } else if (proj.pierce === 0) {
          proj.isAlive = false;
        }
        if (!proj.isAlive) break;
      }
    });
  }

  static projectileHits(proj, enemy) {
    if (proj.kind === 'melee') {
      const d = distance(proj.position, enemy.position);
      if (d > (proj.arc ? proj.arc * 80 : 120)) return false;
      const angleToEnemy = Math.atan2(enemy.position.y - proj.position.y, enemy.position.x - proj.position.x);
      const diff = Math.abs(((angleToEnemy - proj.rotation + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
      return diff <= (proj.arc || Math.PI / 2);
    }
    return distance(proj.position, enemy.position) < enemy.size;
  }

  static handlePlayer(enemies, player, onTouch) {
    for (const enemy of enemies) {
      if (!enemy.isAlive) continue;
      const hitRadius = enemy.size + 14;
      if (distance(enemy.position, player.position) < hitRadius) {
        onTouch?.(enemy);
      }
    }
  }
}

export default CollisionSystem;
