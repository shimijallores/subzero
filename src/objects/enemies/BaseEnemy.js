import { COLORS } from "../../consts/Colors.js";

export default class BaseEnemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);
    this.scene = scene;
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);

    this.setImmovable(true);

    this.scoreValue = 100; // Default score
    this.polarity = COLORS.WHITE;
    this.setTint(COLORS.WHITE); // Polarity Swap Timer
    this.swapEvent = this.scene.time.addEvent({
      delay: 1500,
      callback: this.swapPolarity,
      callbackScope: this,
      loop: true,
    });
  }

  swapPolarity() {
    if (!this.active) return;

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
      this.scene.cameras.main.shake(50, 0.01);
      this.destroy();
      return true;
    } else {
      this.setAlpha(0.5);
      this.scene.tweens.add({
        targets: this,
        alpha: this.polarity === COLORS.ACCENT ? 0.8 : 1,
        duration: 100,
      });
      return false;
    }
  }

  destroy() {
    if (this.swapEvent) this.swapEvent.remove();
    super.destroy();
  }
}
