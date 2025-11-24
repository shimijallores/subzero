// Enemy type that moves in a specific pattern and leaves a trail.
import BaseEnemy from "./BaseEnemy.js";
import { COLORS } from "../../consts/Colors.js";

export default class ChronoLoomer extends BaseEnemy {
  constructor(scene, x, y) {
    super(scene, x, y, "chrono-loomer");
    this.speed = 100;
    this.trailTimer = 0;
    this.scoreValue = 300;

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
    const scene = this.scene;
    // Create a static body as a "ribbon"
    const trail = scene.add.rectangle(this.x, this.y, 10, 10, COLORS.ACCENT);
    scene.physics.add.existing(trail, true); // Static body

    // Collision with player: Damage + Debuff
    scene.physics.add.collider(scene.player, trail, (player) => {
      player.takeDamage(2);
      player.applyVelocityDebuff();
      trail.destroy();
    });

    // Fade out trail
    scene.tweens.add({
      targets: trail,
      alpha: 0,
      duration: 5000,
      onComplete: () => trail.destroy(),
    });
  }
}
