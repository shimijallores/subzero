// Base class for enemy entities with polarity switching logic.
import { COLORS } from "../consts/Colors.js";

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "enemy");
    this.scene = scene;
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);

    this.setImmovable(true);

    this.polarity = COLORS.WHITE;
    this.setTint(COLORS.WHITE);

    // Polarity Swap Timer
    this.scene.time.addEvent({
      delay: 1500,
      callback: this.swapPolarity,
      callbackScope: this,
      loop: true,
    });
  }

  swapPolarity() {
    if (this.polarity === COLORS.WHITE) {
      this.polarity = COLORS.ACCENT;
      this.setTint(COLORS.ACCENT);
      this.alpha = 0.8;
    } else {
      this.polarity = COLORS.WHITE;
      this.setTint(COLORS.WHITE);
      this.alpha = 1;
    }
  }

  takeDamage(bulletPolarity) {
    if (bulletPolarity === this.polarity) {
      // Match! 100% Damage
      this.scene.cameras.main.shake(50, 0.01);
      this.destroy();
      return true;
    } else {
      // Mismatch - Glancing hit
      this.setAlpha(0.5);
      this.scene.tweens.add({
        targets: this,
        alpha: this.polarity === COLORS.ACCENT ? 0.8 : 1,
        duration: 100,
      });
      return false;
    }
  }
}
