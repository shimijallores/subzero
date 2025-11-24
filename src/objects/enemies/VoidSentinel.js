import BaseEnemy from "./BaseEnemy.js";

export default class VoidSentinel extends BaseEnemy {
  constructor(scene, x, y) {
    super(scene, x, y, "void-sentinel");
    this.setImmovable(true); // It's a heavy object
  }

  update(time, delta) {
    if (!this.active) return;

    // Slow rotation
    this.rotation -= 0.005;

    // Maybe push player away if too close? (Disruption field)
    const dist = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      this.scene.player.x,
      this.scene.player.y
    );
    if (dist < 200) {
      const angle = Phaser.Math.Angle.Between(
        this.x,
        this.y,
        this.scene.player.x,
        this.scene.player.y
      );
      this.scene.player.body.velocity.x += Math.cos(angle) * 10;
      this.scene.player.body.velocity.y += Math.sin(angle) * 10;
    }
  }
}
