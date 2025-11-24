import { COLORS } from "../consts/Colors.js";
import Bullet from "../objects/Bullet.js";
import Prism from "../objects/Prism.js";
import Enemy from "../objects/Enemy.js";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  create() {
    // Generate Textures
    this.createTextures();

    // Background - Absolute Void
    this.cameras.main.setBackgroundColor(COLORS.BLACK);

    // Groups
    this.bullets = this.physics.add.group({
      classType: Bullet,
      runChildUpdate: true,
    });

    this.prisms = this.physics.add.group({
      classType: Prism,
      immovable: true,
    });

    this.enemies = this.physics.add.group({
      classType: Enemy,
      immovable: true,
    });

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

    // Particles
    this.emitter = this.add.particles(0, 0, "particle", {
      lifespan: 300,
      speed: 0,
      scale: { start: 1, end: 0 },
      blendMode: "ADD",
      emitting: false,
    });
    this.emitter.startFollow(this.player);

    // Physics
    this.physics.add.existing(this.player);
    this.player.body.setDrag(200);
    this.player.body.setMaxVelocity(200);

    // Camera
    this.cameras.main.startFollow(this.player);

    // Input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
    });

    this.input.on("pointerdown", (pointer) => {
      this.fireBullet(pointer);
    });

    // Level Setup (Test)
    this.prisms.add(new Prism(this, 200, 200));
    this.prisms.add(new Prism(this, 600, 400));

    this.enemies.add(new Enemy(this, 400, 100));
    this.enemies.add(new Enemy(this, 100, 500));

    // Collisions
    this.physics.add.collider(this.bullets, this.prisms, (bullet, prism) => {
      bullet.reflect();
    });

    this.physics.add.overlap(this.bullets, this.enemies, (bullet, enemy) => {
      const killed = enemy.takeDamage(bullet.polarity);
      if (killed) {
        // Maybe spawn particles or something
      }
      bullet.disableBody(true, true); // Destroy bullet
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
    this.add
      .text(10, 10, "SYSTEM: ZERO-K // EPOCH ECHO", {
        fontFamily: "Courier New, monospace",
        fontSize: "16px",
        color: COLORS.WHITE_STRING,
      })
      .setScrollFactor(0);

    this.add
      .text(10, 30, "STATUS: UNSTABLE", {
        fontFamily: "Courier New, monospace",
        fontSize: "16px",
        color: COLORS.ACCENT_STRING,
      })
      .setScrollFactor(0);
  }

  createTextures() {
    // Bullet Texture
    const bulletGfx = this.make.graphics({ x: 0, y: 0, add: false });
    bulletGfx.fillStyle(0xffffff);
    bulletGfx.fillRect(0, 0, 8, 8);
    bulletGfx.generateTexture("bullet", 8, 8);

    // Prism Texture (Diamond)
    const prismGfx = this.make.graphics({ x: 0, y: 0, add: false });
    prismGfx.lineStyle(2, 0xffffff);
    prismGfx.strokeRect(0, 0, 32, 32);
    // We'll rotate the sprite, not the texture drawing
    prismGfx.generateTexture("prism", 32, 32);

    // Particle Texture
    const particleGfx = this.make.graphics({ x: 0, y: 0, add: false });
    particleGfx.fillStyle(COLORS.WHITE);
    particleGfx.fillRect(0, 0, 4, 4);
    particleGfx.generateTexture("particle", 4, 4);
  }

  fireBullet(pointer) {
    const bullet = this.bullets.get();
    if (bullet) {
      const angle = Phaser.Math.Angle.Between(
        this.player.x,
        this.player.y,
        pointer.worldX,
        pointer.worldY
      );
      bullet.fire(this.player.x, this.player.y, angle);
    }
  }

  spawnEntities() {
    // Keep a minimum number of prisms and enemies around
    const playerPos = new Phaser.Math.Vector2(this.player.x, this.player.y);

    // Cleanup distant entities
    this.prisms.getChildren().forEach((prism) => {
      if (
        Phaser.Math.Distance.Between(
          prism.x,
          prism.y,
          playerPos.x,
          playerPos.y
        ) > 1500
      ) {
        prism.destroy();
      }
    });

    this.enemies.getChildren().forEach((enemy) => {
      if (
        Phaser.Math.Distance.Between(
          enemy.x,
          enemy.y,
          playerPos.x,
          playerPos.y
        ) > 1500
      ) {
        enemy.destroy();
      }
    });

    // Spawn new ones if count is low
    if (this.prisms.countActive() < 5) {
      const pos = this.getSpawnPos(playerPos);
      this.prisms.add(new Prism(this, pos.x, pos.y));
    }

    if (this.enemies.countActive() < 3) {
      const pos = this.getSpawnPos(playerPos);
      this.enemies.add(new Enemy(this, pos.x, pos.y));
    }
  }

  getSpawnPos(playerPos) {
    // Spawn between 400 and 800 units away
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const distance = Phaser.Math.FloatBetween(400, 800);
    return {
      x: playerPos.x + Math.cos(angle) * distance,
      y: playerPos.y + Math.sin(angle) * distance,
    };
  }

  update(time, delta) {
    // Spawner Logic
    this.spawnEntities();

    // Player Rotation (Face Cursor)
    const pointer = this.input.activePointer;
    // Adjust rotation offset if necessary (triangle points up by default? Phaser triangles usually point up or right)
    // Phaser.GameObjects.Triangle default: point is at top? No, it's drawn with coords.
    // In create: 0, 20, 10, 0, 20, 20. This is a triangle pointing UP (10,0 is top).
    // Phaser rotation 0 is RIGHT. So we need to add 90 degrees (PI/2) to the angle.
    this.player.rotation =
      Phaser.Math.Angle.Between(
        this.player.x,
        this.player.y,
        pointer.worldX,
        pointer.worldY
      ) +
      Math.PI / 2;

    // Player Movement (Drift/Acceleration)
    const acceleration = 800;
    let accX = 0;
    let accY = 0;

    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      accX = -1;
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      accX = 1;
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      accY = -1;
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      accY = 1;
    }

    // Normalize acceleration
    if (accX !== 0 || accY !== 0) {
      const length = Math.sqrt(accX * accX + accY * accY);
      this.player.body.setAcceleration(
        (accX / length) * acceleration,
        (accY / length) * acceleration
      );
      this.emitter.start();
    } else {
      this.player.body.setAcceleration(0, 0);
      this.emitter.stop();
    }

    // Ghost flickers
    if (Math.random() > 0.9) {
      this.ghost.alpha = Math.random();
    }

    // Ghost follows player (Echo effect)
    this.ghost.x = Phaser.Math.Linear(this.ghost.x, this.player.x, 0.1);
    this.ghost.y = Phaser.Math.Linear(this.ghost.y, this.player.y, 0.1);
    this.ghost.rotation = this.player.rotation;
  }
}
