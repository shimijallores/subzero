import { COLORS } from "../consts/Colors.js";

export default class Bullet extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "bullet");

    this.scene = scene;
    this.speed = 600;
    this.polarity = COLORS.WHITE;
    this.born = 0;
    this.lifespan = 2000; // ms
  }

  fire(x, y, angle) {
    this.enableBody(true, x, y, true, true);
    this.setTint(COLORS.WHITE);
    this.polarity = COLORS.WHITE;

    // Physics
    this.scene.physics.velocityFromRotation(
      angle,
      this.speed,
      this.body.velocity
    );
    this.body.setBounce(1);

    this.born = 0;
  }

  reflect() {
    if (this.polarity === COLORS.WHITE) {
      this.polarity = COLORS.ACCENT;
      this.setTint(COLORS.ACCENT);
    }
  }

  update(time, delta) {
    this.born += delta;
    if (this.born > this.lifespan) {
      this.disableBody(true, true);
    }
  }
}
