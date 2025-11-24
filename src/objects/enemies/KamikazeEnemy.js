import BaseEnemy from "./BaseEnemy.js";
import { COLORS } from "../../consts/Colors.js";

export default class KamikazeEnemy extends BaseEnemy {
  constructor(scene, x, y) {
    super(scene, x, y, "kamikaze");
    this.speed = 250;
    this.detectionRange = 150;
    this.explosionRadius = 200;
    this.damage = 40;
    this.isExploding = false;
    this.scoreValue = 200;
  }

  update(time, delta) {
    if (!this.active) return;

    // If exploding, don't move
    if (this.isExploding) return;

    const player = this.scene.player;
    if (!player || !player.active) return;

    const dist = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      player.x,
      player.y
    );

    if (dist < this.detectionRange) {
      this.startExplosionSequence();
    } else {
      this.scene.physics.moveToObject(this, player, this.speed);
      // Rotate towards player
      this.rotation =
        Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y) +
        Math.PI / 2;
    }
  }

  swapPolarity() {
    if (this.isExploding) return;
    super.swapPolarity();
  }

  startExplosionSequence() {
    this.isExploding = true;
    this.setVelocity(0, 0);

    // Flash warning - Rapidly flash red
    this.setTint(COLORS.RED);

    this.scene.tweens.add({
      targets: this,
      scale: 1.5,
      duration: 500,
      yoyo: false,
      onUpdate: (tween) => {
        // Flicker effect
        this.setVisible(Math.random() > 0.2);
      },
      onComplete: () => {
        this.setVisible(true);
        this.explode();
      },
    });
  }

  explode() {
    if (!this.active) return;

    // Visual effect for explosion
    const explosion = this.scene.add.circle(this.x, this.y, 10, COLORS.RED);
    this.scene.tweens.add({
      targets: explosion,
      scale: 20,
      alpha: 0,
      duration: 400,
      onComplete: () => explosion.destroy(),
    });

    this.scene.cameras.main.shake(100, 0.02);
    // Use existing sound
    if (this.scene.sound.get("damage")) {
      this.scene.sound.play("damage", { volume: 0.5, rate: 0.5 });
    }

    // Check damage to player
    const player = this.scene.player;
    if (player && player.active) {
      const dist = Phaser.Math.Distance.Between(
        this.x,
        this.y,
        player.x,
        player.y
      );
      if (dist < this.explosionRadius) {
        player.takeDamage(this.damage);
      }
    }

    this.destroy();
  }
}
