import { COLORS } from "../consts/Colors.js";
import Bullet from "../objects/Bullet.js";
import Prism from "../objects/Prism.js";
import FluxStrider from "../objects/enemies/FluxStrider.js";
import ChronoLoomer from "../objects/enemies/ChronoLoomer.js";
import VoidSentinel from "../objects/enemies/VoidSentinel.js";
import NegativeSpaceVoid from "../objects/enemies/NegativeSpaceVoid.js";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  preload() {
    this.load.audio("laser", "assets/sounds/laser.mp3");
    this.load.audio("damage", "assets/sounds/damage.mp3");
    this.load.audio("enemy-hit", "assets/sounds/enemy-hit.mp3");
  }

  create() {
    // Disable context menu for right-click shooting
    this.input.mouse.disableContextMenu();

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
      runChildUpdate: true,
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
    this.player.health = 100;
    this.player.maxHealth = 100;
    this.player.isDebuffed = false;
    this.score = 0;
    this.lastFired = 0;
    this.fireRate = 200; // ms between shots

    // Particles
    this.emitter = this.add.particles(0, 0, "particle", {
      lifespan: 600,
      speed: { min: 10, max: 50 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 0.6, end: 0 },
      blendMode: "ADD",
      frequency: 10,
      emitting: false,
    });
    this.emitter.startFollow(this.player);

    // Physics
    this.physics.add.existing(this.player);
    this.player.body.setDrag(100);
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

    // Level Setup (Test)
    this.prisms.add(new Prism(this, 200, 200));
    this.prisms.add(new Prism(this, 600, 400));

    // Initial Spawns
    this.spawnEntities();

    // Collisions
    this.physics.add.collider(this.bullets, this.prisms, (bullet, prism) => {
      bullet.reflect();
    });

    this.physics.add.overlap(this.bullets, this.enemies, (bullet, enemy) => {
      const killed = enemy.takeDamage(bullet.polarity);
      if (killed) {
        this.addScore(enemy.scoreValue || 100);
        this.sound.play("enemy-hit", { volume: 0.5 });
      }
      bullet.disableBody(true, true); // Destroy bullet
    });

    // Player vs Enemies Collision
    this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
      this.takeDamage(10);
      enemy.destroy();
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

    this.hpText = this.add
      .text(10, 50, "HP: 100%", {
        fontFamily: "Courier New, monospace",
        fontSize: "16px",
        color: COLORS.WHITE_STRING,
      })
      .setScrollFactor(0);

    this.scoreText = this.add
      .text(10, 70, "SCORE: 0", {
        fontFamily: "Courier New, monospace",
        fontSize: "16px",
        color: COLORS.WHITE_STRING,
      })
      .setScrollFactor(0);
  }

  takeDamage(amount) {
    this.player.health -= amount;
    this.hpText.setText(`HP: ${this.player.health}%`);
    this.cameras.main.shake(100, 0.02);
    this.sound.play("damage", { volume: 0.6 });

    if (this.player.health <= 0) {
      this.scene.restart();
    }
  }

  applyVelocityDebuff() {
    if (this.player.isDebuffed) return;

    this.player.isDebuffed = true;
    this.player.body.setMaxVelocity(50);
    this.hpText.setColor("#ff0000");

    this.time.delayedCall(2000, () => {
      this.player.isDebuffed = false;
      this.player.body.setMaxVelocity(200); // Restore speed
      this.hpText.setColor(COLORS.WHITE_STRING);
    });
  }

  createTextures() {
    // Bullet Texture (Laser-like)
    const bulletGfx = this.make.graphics({ x: 0, y: 0, add: false });
    bulletGfx.fillStyle(0xffffff);
    bulletGfx.fillRect(0, 0, 24, 4); // Long and thin
    bulletGfx.generateTexture("bullet", 24, 4);

    // Prism Texture (Diamond)
    const prismGfx = this.make.graphics({ x: 0, y: 0, add: false });
    prismGfx.lineStyle(2, 0xffffff);
    prismGfx.strokeRect(0, 0, 32, 32);
    // We'll rotate the sprite, not the texture drawing
    prismGfx.generateTexture("prism", 32, 32);

    // Particle Texture (Soft Glow)
    const particleGfx = this.make.graphics({ x: 0, y: 0, add: false });
    particleGfx.fillStyle(COLORS.WHITE);
    particleGfx.fillCircle(4, 4, 4);
    particleGfx.generateTexture("particle", 8, 8);

    // Flux Strider Texture (Triangle Cluster)
    const fluxGfx = this.make.graphics({ x: 0, y: 0, add: false });
    fluxGfx.lineStyle(2, 0xffffff);
    fluxGfx.strokeTriangle(0, 20, 10, 0, 20, 20);
    fluxGfx.strokeTriangle(10, 20, 20, 0, 30, 20);
    fluxGfx.generateTexture("flux-strider", 32, 32);

    // Chrono Loomer Texture (Segmented)
    const chronoGfx = this.make.graphics({ x: 0, y: 0, add: false });
    chronoGfx.lineStyle(2, 0xffffff);
    chronoGfx.strokeCircle(16, 16, 14);
    chronoGfx.strokeRect(10, 10, 12, 12);
    chronoGfx.generateTexture("chrono-loomer", 32, 32);

    // Void Sentinel Texture (Large Hollow)
    const voidGfx = this.make.graphics({ x: 0, y: 0, add: false });
    voidGfx.lineStyle(4, 0xffffff);
    voidGfx.strokeRect(0, 0, 64, 64);
    voidGfx.lineStyle(2, 0xffffff);
    voidGfx.strokeRect(16, 16, 32, 32);
    voidGfx.generateTexture("void-sentinel", 64, 64);

    // Negative Space Void (Boss) - Icosahedron-ish
    const bossGfx = this.make.graphics({ x: 0, y: 0, add: false });
    bossGfx.lineStyle(4, 0xffffff);
    // Outer Hexagon
    bossGfx.strokePoints(
      [
        { x: 64, y: 0 },
        { x: 120, y: 32 },
        { x: 120, y: 96 },
        { x: 64, y: 128 },
        { x: 8, y: 96 },
        { x: 8, y: 32 },
        { x: 64, y: 0 },
      ],
      true
    );
    // Inner connections
    bossGfx.lineStyle(2, COLORS.ACCENT);
    bossGfx.strokeCircle(64, 64, 30);
    bossGfx.generateTexture("negative-space-void", 128, 128);
  }

  fireBullet(pointer, polarity = COLORS.WHITE) {
    const bullet = this.bullets.get();
    if (bullet) {
      const angle = Phaser.Math.Angle.Between(
        this.player.x,
        this.player.y,
        pointer.worldX,
        pointer.worldY
      );
      bullet.fire(this.player.x, this.player.y, angle, true, polarity);
      this.sound.play("laser", {
        volume: 0.3,
        detune: Math.random() * 200 - 100,
      });
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

    if (this.enemies.countActive() < 5) {
      const pos = this.getSpawnPos(playerPos);
      const rand = Math.random();

      // Boss Spawn Logic (Simple chance for now, or score based)
      // Let's make it rare but possible for testing, or strictly score based
      if (this.score > 1000 && !this.bossActive && Math.random() < 0.05) {
        this.bossActive = true;
        const boss = new NegativeSpaceVoid(this, pos.x, pos.y);
        this.enemies.add(boss);

        // Reset boss active flag when destroyed
        boss.once("destroy", () => {
          this.bossActive = false;
        });
      } else if (rand < 0.6) {
        this.enemies.add(new FluxStrider(this, pos.x, pos.y));
      } else if (rand < 0.9) {
        this.enemies.add(new ChronoLoomer(this, pos.x, pos.y));
      } else {
        this.enemies.add(new VoidSentinel(this, pos.x, pos.y));
      }
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

    // Auto-Fire Logic
    if (this.input.activePointer.isDown) {
      if (time > this.lastFired) {
        const pointer = this.input.activePointer;
        let polarity = COLORS.WHITE;

        if (pointer.rightButtonDown()) {
          polarity = COLORS.ACCENT;
        }

        this.fireBullet(pointer, polarity);
        this.lastFired = time + this.fireRate;
      }
    }

    // Player Rotation (Face Cursor)
    const pointer = this.input.activePointer;
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

  addScore(points) {
    this.score += points;
    this.scoreText.setText(`SCORE: ${this.score}`);
  }
}
