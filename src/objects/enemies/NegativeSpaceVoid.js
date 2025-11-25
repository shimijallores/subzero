// Boss enemy with high health and unique behavior.
import { COLORS } from "../../consts/Colors.js";
import BaseEnemy from "./BaseEnemy.js";

export default class NegativeSpaceVoid extends BaseEnemy {
  constructor(scene, x, y) {
    super(scene, x, y, "negative-space-void");

    this.scoreValue = 5000;
    this.health = 1000;
    this.maxHealth = 1000;

    // Override physics
    this.body.setCircle(60);
    this.setImmovable(true);

    // Rotation for the visual effect
    this.rotationSpeed = 0.01;

    // Attack Timer
    this.attackTimer = 0;
    this.attackInterval = 3000;
  }

  update(time, delta) {
    // Rotate the boss
    this.rotation += this.rotationSpeed;

    // Attack Logic
    this.attackTimer += delta;
    if (this.attackTimer > this.attackInterval) {
      this.omnipresentShroud();
      this.attackTimer = 0;
    }
  }

  omnipresentShroud() {
    // Fire bullets in 360 degrees
    const bulletCount = 20;
    const step = (Math.PI * 2) / bulletCount;

    for (let i = 0; i < bulletCount; i++) {
      const angle = i * step + this.rotation;

      // We need to access the bullet group from the scene
      const bullet = this.scene.bullets.get();
      if (bullet) {
        // Offset spawn to be outside the boss
        const spawnX = this.x + Math.cos(angle) * 70;
        const spawnY = this.y + Math.sin(angle) * 70;

        bullet.fire(spawnX, spawnY, angle, false);
        bullet.lifespan = 4000;
        bullet.speed = 200;

        this.scene.physics.velocityFromRotation(
          angle,
          200,
          bullet.body.velocity
        );
      }
    }
  }

  takeDamage(bulletPolarity) {
    // Boss takes damage but doesn't die immediately
    // It also follows polarity rules
    if (bulletPolarity === this.polarity) {
      this.health -= 10;
      this.scene.cameras.main.shake(50, 0.005);
      this.setTint(0xff0000); // Flash red briefly

      this.scene.time.delayedCall(100, () => {
        this.setTint(this.polarity);
      });

      if (this.health <= 0) {
        this.destroy();
        return true; // Killed
      }
      return false; // Not killed yet
    } else {
      // Deflect
      return super.takeDamage(bulletPolarity);
    }
  }
}
