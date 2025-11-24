import BaseEnemy from "./BaseEnemy.js";
import VoidSerpentSegment from "./VoidSerpentSegment.js";
import { COLORS } from "../../consts/Colors.js";
import Bullet from "../Bullet.js";

export default class VoidSerpent extends BaseEnemy {
  constructor(scene, x, y) {
    super(scene, x, y, "void-serpent-head");
    this.speed = 180;
    this.scoreValue = 2000;
    this.health = 500;

    // Segment Management
    this.segments = [];
    this.history = [];
    this.historyLimit = 200;
    this.segmentSpacing = 8;

    // Create Segments
    this.createSegments(12);

    // Shooting
    this.shootTimer = this.scene.time.addEvent({
      delay: 2000,
      callback: this.shoot,
      callbackScope: this,
      loop: true,
    });
  }

  createSegments(count) {
    for (let i = 0; i < count; i++) {
      const segment = new VoidSerpentSegment(this.scene, this.x, this.y, this);

      // Alternate Polarity
      if (i % 2 === 0) {
        segment.polarity = COLORS.ACCENT;
        segment.setTint(COLORS.ACCENT);
      } else {
        segment.polarity = COLORS.WHITE;
        segment.setTint(COLORS.WHITE);
      }

      this.scene.enemies.add(segment);
      this.segments.push(segment);
    }
  }

  removeSegment(segment) {
    const index = this.segments.indexOf(segment);
    if (index > -1) {
      this.segments.splice(index, 1);
    }
  }

  update(time, delta) {
    if (!this.active) return;

    const player = this.scene.player;
    if (!player || !player.active) return;

    // Move towards player
    this.scene.physics.moveToObject(this, player, this.speed);
    this.rotation =
      Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y) +
      Math.PI / 2;

    // Record History
    this.history.unshift({ x: this.x, y: this.y, rotation: this.rotation });
    if (this.history.length > this.historyLimit) {
      this.history.pop();
    }

    // Update Segments
    this.segments.forEach((segment, index) => {
      if (segment.active) {
        const historyIndex = (index + 1) * this.segmentSpacing;
        if (historyIndex < this.history.length) {
          const pos = this.history[historyIndex];
          segment.x = pos.x;
          segment.y = pos.y;
          segment.rotation = pos.rotation;
        } else {
          // If history isn't long enough yet (just spawned), stack at end
          const lastPos = this.history[this.history.length - 1];
          segment.x = lastPos.x;
          segment.y = lastPos.y;
        }
      }
    });
  }

  shoot() {
    if (!this.active) return;

    // Shoot 3 bullets in a spread
    const angles = [-0.3, 0, 0.3];
    angles.forEach((angleOffset) => {
      const bullet = this.scene.bullets.get(this.x, this.y);
      if (bullet) {
        bullet.fire(
          this.x,
          this.y,
          this.rotation - Math.PI / 2 + angleOffset,
          this.polarity
        );
        // Clean up the unused bullet
        bullet.destroy();
      }
    });

    // Alternative Ability: Speed Boost
    this.scene.tweens.add({
      targets: this,
      speed: 300,
      duration: 500,
      yoyo: true,
      onUpdate: () => {
        if (this.body) this.body.velocity.normalize().scale(this.speed);
      },
    });
  }

  takeDamage(bulletPolarity) {
    if (bulletPolarity === this.polarity) {
      this.health -= 10;
      this.scene.cameras.main.shake(20, 0.005);
      this.setTint(0xff0000);
      this.scene.time.delayedCall(100, () => {
        if (this.active) this.setTint(this.polarity);
      });

      if (this.health <= 0) {
        this.die();
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

  die() {
    // Kill all segments
    this.segments.forEach((seg) => {
      if (seg.active) {
        seg.destroy();
        // Explosion effect for each segment
      }
    });
    this.destroy();
  }

  destroy() {
    if (this.shootTimer) this.shootTimer.remove();
    super.destroy();
  }
}
