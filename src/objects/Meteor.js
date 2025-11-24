import { COLORS } from "../consts/Colors.js";

export default class Meteor extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "meteor");
    this.scene = scene;
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);

    // Randomize physics
    this.setVelocity(
      Phaser.Math.Between(-50, 50),
      Phaser.Math.Between(-50, 50)
    );
    this.setAngularVelocity(Phaser.Math.Between(-50, 50));
    this.setBounce(1);
    this.setDrag(0);

    // Randomize size/scale slightly
    const scale = Phaser.Math.FloatBetween(0.8, 1.5);
    this.setScale(scale);

    // Stats
    this.health = 50 * scale;
    this.scoreValue = 10;
  }

  takeDamage(amount) {
    this.health -= 10; // Fixed damage for now or passed amount
    this.scene.cameras.main.shake(20, 0.005);

    // Flash
    this.setTint(0xff0000);
    this.scene.time.delayedCall(50, () => {
      this.clearTint();
    });

    if (this.health <= 0) {
      this.destroy();
      return true;
    }
    return false;
  }
}
