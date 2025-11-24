import { COLORS } from "../consts/Colors.js";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  create() {
    // Background - Absolute Void
    this.cameras.main.setBackgroundColor(COLORS.BLACK);

    // Player Ship - Solid White Triangle
    this.player = this.add.triangle(
      400,
      300,
      0,
      20,
      10,
      0,
      20,
      20,
      COLORS.WHITE
    );
    this.player.setOrigin(0.5);

    // Physics
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);

    // Input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });

    // Time-Clone Ghost - Semi-transparent Accent Color Wireframe
    this.ghost = this.add.graphics();
    this.ghost.lineStyle(2, COLORS.ACCENT, 0.5); // 0.5 alpha

    // Draw triangle relative to the graphics object's origin (0,0)
    // Shape: (0, 20), (10, 0), (20, 20) - same dimensions as player
    this.ghost.strokeTriangle(0, 20, 10, 0, 20, 20);

    this.ghost.x = 350;
    this.ghost.y = 290; // Offset slightly

    // Add some text to verify font style (Monospace)
    this.add.text(10, 10, "SYSTEM: ZERO-K // EPOCH ECHO", {
      fontFamily: "Courier New, monospace",
      fontSize: "16px",
      color: COLORS.WHITE_STRING,
    });

    this.add.text(10, 30, "STATUS: UNSTABLE", {
      fontFamily: "Courier New, monospace",
      fontSize: "16px",
      color: COLORS.ACCENT_STRING,
    });
  }

  update(time, delta) {
    // Player Movement
    const speed = 300;
    let velocityX = 0;
    let velocityY = 0;

    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      velocityX = -1;
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      velocityX = 1;
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      velocityY = -1;
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      velocityY = 1;
    }

    // Normalize diagonal movement
    if (velocityX !== 0 || velocityY !== 0) {
      const length = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
      this.player.body.setVelocity(
        (velocityX / length) * speed,
        (velocityY / length) * speed
      );
    } else {
      this.player.body.setVelocity(0, 0);
    }

    // Ghost flickers
    if (Math.random() > 0.9) {
      this.ghost.alpha = Math.random();
    }

    // Ghost follows player (Echo effect)
    this.ghost.x = Phaser.Math.Linear(this.ghost.x, this.player.x, 0.1);
    this.ghost.y = Phaser.Math.Linear(this.ghost.y, this.player.y, 0.1);
  }
}
