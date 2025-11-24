// Represents a static obstacle that reflects bullets.
import { COLORS } from "../consts/Colors.js";

export default class Prism extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "prism");
    this.scene = scene;
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);

    this.setImmovable(true);
    this.setTint(COLORS.WHITE);
  }
}
