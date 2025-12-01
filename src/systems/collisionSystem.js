import { distance } from '../utils/math.js';

class CollisionSystem {
  handle(player, enemies, projectiles, onPlayerHit) {
    // Player/enemy collisions
    for (const enemy of enemies) {
      const d = distance(player.position, enemy.position);
      if (d < 26) {
        player.health -= enemy.damage * 0.5; // contact damage mitigated by tick
        onPlayerHit?.();
      }
    }

    // Projectiles vs enemies
    for (const projectile of [...projectiles]) {
      for (const enemy of [...enemies]) {
        const d = distance(projectile.position, enemy.position);
        if (d < enemy.size / 2 + projectile.size / 2) {
          enemy.applyDamage(projectile.damage);
          projectile.life = 0;
        }
      }
    }
  }
}

export default CollisionSystem;
