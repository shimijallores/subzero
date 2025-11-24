import BaseEnemy from "./BaseEnemy.js";
import { COLORS } from "../../consts/Colors.js";

export default class ChronoLoomer extends BaseEnemy {
  constructor(scene, x, y) {
    super(scene, x, y, "chrono-loomer");
    this.speed = 100;
    this.trailTimer = 0;

    this.setImmovable(false);
  }

  update(time, delta) {
    if (!this.active) return;

    // Move towards player but slower
    const player = this.scene.player;
    this.scene.physics.moveToObject(this, player, this.speed);

    // Leave trail
    this.trailTimer += delta;
    if (this.trailTimer > 200) {
      this.leaveTrail();
      this.trailTimer = 0;
    }

    this.rotation += 0.02;
  }

  leaveTrail() {
    // Create a static body as a "ribbon"
    // For now, just a small square that blocks movement?
    // Or maybe just visual for now to save performance
    const trail = this.scene.add.rectangle(
      this.x,
      this.y,
      10,
      10,
      COLORS.ACCENT
    );
    this.scene.physics.add.existing(trail, true); // Static body
    this.scene.physics.add.collider(this.scene.player, trail); // Player hits trail

    // Fade out trail
    this.scene.tweens.add({
      targets: trail,
      alpha: 0,
      duration: 5000,
      onComplete: () => trail.destroy(),
    });
  }
}
