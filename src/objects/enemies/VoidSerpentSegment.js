import BaseEnemy from "./BaseEnemy.js";
import { COLORS } from "../../consts/Colors.js";

export default class VoidSerpentSegment extends BaseEnemy {
  constructor(scene, x, y, parent) {
    super(scene, x, y, "void-serpent-body");
    this.parentSerpent = parent;
    this.scoreValue = 50;
    this.health = 30; // Segments have health
  }

  update(time, delta) {}

  takeDamage(bulletPolarity) {
    if (bulletPolarity === this.polarity) {
      this.health -= 10;
      this.scene.tweens.add({
        targets: this,
        alpha: 0.2,
        duration: 50,
        yoyo: true,
      });

      if (this.health <= 0) {
        this.destroy();
        return true;
      }
      return false;
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
    if (this.parentSerpent && this.parentSerpent.active) {
      this.parentSerpent.removeSegment(this);
    }
    super.destroy();
  }
}
