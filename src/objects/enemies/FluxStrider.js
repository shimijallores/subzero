import BaseEnemy from "./BaseEnemy.js";

export default class FluxStrider extends BaseEnemy {
  constructor(scene, x, y) {
    super(scene, x, y, "flux-strider");
    this.speed = 200;
    this.timeOffset = Math.random() * 1000;

    // Physics
    this.setImmovable(false);
    this.body.setBounce(1);
    this.body.setDrag(100);
    this.scoreValue = 100;
  }

  update(time, delta) {
    if (!this.active) return;

    // Sine-wave movement towards player
    const player = this.scene.player;
    const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);

    // Add sine wave perpendicular to direction
    const sine = Math.sin((time + this.timeOffset) * 0.005) * 200;

    this.scene.physics.velocityFromRotation(
      angle,
      this.speed,
      this.body.velocity
    );

    // Apply sine wave offset to velocity (simplified "strafing")
    this.body.velocity.x += Math.cos(angle + Math.PI / 2) * sine;
    this.body.velocity.y += Math.sin(angle + Math.PI / 2) * sine;

    this.rotation = angle + Math.PI / 2;

    // Shoot occasionally
    if (Math.random() < 0.01) {
      this.fire();
    }
  }

  fire() {
    const scene = this.scene;
    // Simple pellet
    const pellet = scene.add.rectangle(this.x, this.y, 4, 4, 0xffffff);
    scene.physics.add.existing(pellet);
    scene.physics.moveToObject(pellet, scene.player, 400);

    // Add to a group in scene if we want proper collision,
    // but for now let's just add a collider here for simplicity
    scene.physics.add.overlap(scene.player, pellet, (player, p) => {
      player.takeDamage(5);
      p.destroy();
    });

    // Destroy after 2 seconds
    scene.time.delayedCall(2000, () => pellet.destroy());
  }
}
