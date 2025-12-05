// Represents a projectile fired by the player with specific polarity.
import { COLORS } from "../consts/Colors.js";

export default class Bullet extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "bullet");

    this.scene = scene;
    this.speed = 600;
    this.polarity = COLORS.WHITE;
    this.canReflect = true;
    this.born = 0;
    this.lifespan = 2000;
    this.growthLevel = 0;
    this.startX = 0;
    this.startY = 0;
  }

  fire(x, y, angle, canReflect = true, polarity = COLORS.WHITE) {
    this.enableBody(true, x, y, true, true);
    this.setTint(polarity);
    this.polarity = polarity;
    this.canReflect = canReflect;

    // Store start position for growth calculation
    this.startX = x;
    this.startY = y;
    this.setScale(1);

    // Rotate bullet to face direction
    this.rotation = angle;

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
    if (!this.canReflect) return;

    if (this.polarity === COLORS.WHITE) {
      this.polarity = COLORS.ACCENT;
      this.setTint(COLORS.ACCENT);
    }
  }

  update(time, delta) {
    this.born += delta;
    if (this.born > this.lifespan) {
      this.disableBody(true, true);
      return;
    }

    // Growing bullets upgrade
    if (this.growthLevel > 0) {
      const distance = Phaser.Math.Distance.Between(
        this.startX,
        this.startY,
        this.x,
        this.y
      );
      // Grow based on distance traveled, max 3x size at level 3
      const growthRate = 0.002 * this.growthLevel;
      const newScale = Math.min(
        1 + distance * growthRate,
        1 + this.growthLevel
      );
      this.setScale(newScale);
    }
  }
}
