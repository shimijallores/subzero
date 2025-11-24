// Stationary enemy type that acts as a turret.
import BaseEnemy from "./BaseEnemy.js";

export default class VoidSentinel extends BaseEnemy {
  constructor(scene, x, y) {
    super(scene, x, y, "void-sentinel");
    this.setImmovable(true);
    this.scoreValue = 500;
  }

  update(time, delta) {
    if (!this.active) return;

    // Slow rotation
    this.rotation -= 0.005;

    // Disruption Field
    const dist = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      this.scene.player.x,
      this.scene.player.y
    );
    if (dist < 300) {
      // Visual feedback for field
      if (Math.random() > 0.8) {
        this.scene.cameras.main.shake(10, 0.005);
      }

      // Randomly rotate player slightly to mess up aim
      if (Math.random() > 0.9) {
        this.scene.player.rotation += (Math.random() - 0.5) * 0.2;
      }
    }
  }
}
