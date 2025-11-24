import { COLORS } from "../consts/Colors.js";
import ScoreManager from "../managers/ScoreManager.js";

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super("GameOverScene");
  }

  init(data) {
    this.score = data.score || 0;
    this.playerName = data.playerName || "UNKNOWN";

    // Save score
    const scoreManager = new ScoreManager();
    scoreManager.saveScore(this.playerName, this.score);
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    this.cameras.main.setBackgroundColor(COLORS.BLACK);

    this.add
      .text(width / 2, height / 3, "SYSTEM FAILURE", {
        fontFamily: "Courier New, monospace",
        fontSize: "64px",
        color: COLORS.RED_STRING,
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2, `SCORE: ${this.score}`, {
        fontFamily: "Courier New, monospace",
        fontSize: "32px",
        color: COLORS.ACCENT_STRING,
      })
      .setOrigin(0.5);

    const restartBtn = this.add
      .text(width / 2, height / 2 + 100, "[ REBOOT SYSTEM ]", {
        fontFamily: "Courier New, monospace",
        fontSize: "32px",
        color: COLORS.ACCENT_STRING,
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    restartBtn.on("pointerover", () =>
      restartBtn.setColor(COLORS.WHITE_STRING)
    );
    restartBtn.on("pointerout", () =>
      restartBtn.setColor(COLORS.ACCENT_STRING)
    );
    restartBtn.on("pointerdown", () => {
      window.location.reload();
    });
  }
}
