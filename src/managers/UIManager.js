import { COLORS } from "../consts/Colors.js";

export default class UIManager {
  constructor(scene) {
    this.scene = scene;
    this.scoreText = null;
    this.hpText = null;
    this.overdriveText = null;
    this.shieldText = null;
    this.dashText = null;
  }

  create() {
    const width = this.scene.scale.width;
    const height = this.scene.scale.height;

    // UI - Top Left
    this.scene.add
      .text(10, 10, `SYSTEM: Z8k // PILOT: ${this.scene.playerName}`, {
        fontFamily: "Courier New, monospace",
        fontSize: "16px",
        color: COLORS.WHITE_STRING,
      })
      .setScrollFactor(0);

    this.scene.add
      .text(10, 30, "STATUS: UNSTABLE", {
        fontFamily: "Courier New, monospace",
        fontSize: "16px",
        color: COLORS.ACCENT_STRING,
      })
      .setScrollFactor(0);

    this.scoreText = this.scene.add
      .text(10, 50, "SCORE: 0", {
        fontFamily: "Courier New, monospace",
        fontSize: "16px",
        color: COLORS.WHITE_STRING,
      })
      .setScrollFactor(0);

    // Round UI
    this.roundText = this.scene.add
      .text(width / 2, 80, "ROUND: 1 | TIME: 30", {
        fontFamily: "Courier New, monospace",
        fontSize: "20px",
        color: COLORS.ACCENT_STRING,
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    this.nextRoundText = this.scene.add
      .text(width / 2, height / 2, "ROUND 2", {
        fontFamily: "Courier New, monospace",
        fontSize: "64px",
        color: COLORS.WHITE_STRING,
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setAlpha(0)
      .setDepth(200);

    // UI - Top Right
    this.hpText = this.scene.add
      .text(width - 10, 10, "HP: 100% | LIVES: 3", {
        fontFamily: "Courier New, monospace",
        fontSize: "16px",
        color: COLORS.WHITE_STRING,
      })
      .setOrigin(1, 0)
      .setScrollFactor(0);

    // UI - Bottom Right (Skills)
    // Overdrive
    this.scene.add
      .image(width - 26, height - 100, "icon-overdrive")
      .setScrollFactor(0);
    this.overdriveText = this.scene.add
      .text(width - 50, height - 100, "READY [TAB]", {
        fontFamily: "Courier New, monospace",
        fontSize: "16px",
        color: COLORS.ACCENT_STRING,
      })
      .setOrigin(1, 0.5)
      .setScrollFactor(0);

    // Shield
    this.scene.add
      .image(width - 26, height - 60, "icon-shield")
      .setScrollFactor(0);
    this.shieldText = this.scene.add
      .text(width - 50, height - 60, "READY [Q]", {
        fontFamily: "Courier New, monospace",
        fontSize: "16px",
        color: COLORS.ACCENT_STRING,
      })
      .setOrigin(1, 0.5)
      .setScrollFactor(0);

    // Dash
    this.scene.add
      .image(width - 26, height - 20, "icon-dash")
      .setScrollFactor(0);
    this.dashText = this.scene.add
      .text(width - 50, height - 20, "READY [E]", {
        fontFamily: "Courier New, monospace",
        fontSize: "16px",
        color: COLORS.ACCENT_STRING,
      })
      .setOrigin(1, 0.5)
      .setScrollFactor(0);

    // Damage Vignette
    this.vignette = this.scene.add
      .image(width / 2, height / 2, "vignette")
      .setScrollFactor(0)
      .setAlpha(0)
      .setDepth(100);
  }

  triggerDamageVignette() {
    this.vignette.setAlpha(1);
    this.scene.tweens.add({
      targets: this.vignette,
      alpha: 0,
      duration: 500,
      ease: "Power2",
    });
  }

  updateScore(score) {
    this.scoreText.setText(`SCORE: ${score}`);
  }

  updateHP(health, lives) {
    this.hpText.setText(`HP: ${health}% | LIVES: ${lives}`);
  }

  setHPColor(color) {
    this.hpText.setColor(color);
  }

  updateOverdriveStatus(text, color) {
    this.overdriveText.setText(text);
    if (color) this.overdriveText.setColor(color);
  }

  updateShieldStatus(text, color) {
    this.shieldText.setText(text);
    if (color) this.shieldText.setColor(color);
  }

  updateDashStatus(text, color) {
    this.dashText.setText(text);
    if (color) this.dashText.setColor(color);
  }

  updateRound(round, timeRemaining) {
    const seconds = Math.ceil(timeRemaining / 1000);
    this.roundText.setText(`ROUND: ${round} | TIME: ${seconds}`);
  }

  showNextRound(round) {
    this.nextRoundText.setText(`ROUND ${round}`);
    this.nextRoundText.setAlpha(1);
    this.nextRoundText.setScale(0.5);

    this.scene.tweens.add({
      targets: this.nextRoundText,
      scale: 1.2,
      duration: 500,
      ease: "Back.out",
      onComplete: () => {
        this.scene.tweens.add({
          targets: this.nextRoundText,
          alpha: 0,
          delay: 1000,
          duration: 500,
        });
      },
    });
  }
}
