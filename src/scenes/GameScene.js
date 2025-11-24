import { COLORS } from "../consts/Colors.js";
import Bullet from "../objects/Bullet.js";
import Prism from "../objects/Prism.js";
import FluxStrider from "../objects/enemies/FluxStrider.js";
import ChronoLoomer from "../objects/enemies/ChronoLoomer.js";
import VoidSentinel from "../objects/enemies/VoidSentinel.js";
import NegativeSpaceVoid from "../objects/enemies/NegativeSpaceVoid.js";
import Meteor from "../objects/Meteor.js";

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
    this.createBackground();

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

    this.meteors = this.physics.add.group({
      classType: Meteor,
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
    this.player.lives = 3;
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

    this.physics.add.overlap(this.bullets, this.meteors, (bullet, meteor) => {
      const killed = meteor.takeDamage(10);
      if (killed) {
        this.addScore(meteor.scoreValue);
        this.sound.play("enemy-hit", { volume: 0.5 });
      }
      bullet.disableBody(true, true);
    });

    this.physics.add.overlap(this.bullets, this.enemies, (bullet, enemy) => {
      // Overdrive Logic
      if (bullet.isOverdrive) {
        this.addScore(enemy.scoreValue || 100);
        this.sound.play("enemy-hit", { volume: 0.5, rate: 1.5 }); // Higher pitch

        // Boss handling
        if (enemy.health) {
          enemy.health -= 50; // Massive damage
          enemy.setTint(COLORS.RED);
          if (enemy.health <= 0) enemy.destroy();
        } else {
          enemy.destroy();
        }

        bullet.disableBody(true, true);
        return;
      }

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

    this.physics.add.overlap(this.player, this.meteors, (player, meteor) => {
      this.takeDamage(20);
      meteor.destroy();
    });

    // Time-Clone Ghost - Semi-transparent Accent Color Wireframe
    this.ghost = this.add.graphics();
    this.ghost.lineStyle(2, COLORS.ACCENT, 0.5); // 0.5 alpha

    // Draw triangle relative to the graphics object's origin (0,0)
    // Shape: (0, 20), (10, 0), (20, 20) - same dimensions as player
    this.ghost.strokeTriangle(0, 20, 10, 0, 20, 20);

    this.ghost.x = 350;
    this.ghost.y = 290; // Offset slightly

    const width = this.scale.width;
    const height = this.scale.height;

    // UI - Top Left
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

    this.scoreText = this.add
      .text(10, 50, "SCORE: 0", {
        fontFamily: "Courier New, monospace",
        fontSize: "16px",
        color: COLORS.WHITE_STRING,
      })
      .setScrollFactor(0);

    // UI - Top Right
    this.hpText = this.add
      .text(width - 10, 10, "HP: 100% | LIVES: 3", {
        fontFamily: "Courier New, monospace",
        fontSize: "16px",
        color: COLORS.WHITE_STRING,
      })
      .setOrigin(1, 0)
      .setScrollFactor(0);

    // Overdrive System
    this.overdrive = {
      active: false,
      ready: true,
      timer: 0,
      duration: 7000,
      cooldownTimer: 0,
      cooldown: 10000,
    };

    // UI - Bottom Right (Skills)
    // Overdrive
    this.add
      .image(width - 26, height - 100, "icon-overdrive")
      .setScrollFactor(0);
    this.overdriveText = this.add
      .text(width - 50, height - 100, "READY [TAB]", {
        fontFamily: "Courier New, monospace",
        fontSize: "16px",
        color: COLORS.ACCENT_STRING,
      })
      .setOrigin(1, 0.5)
      .setScrollFactor(0);

    this.tabKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.TAB
    );

    // Shield System
    this.shield = {
      active: false,
      ready: true,
      timer: 0,
      duration: 5000,
      cooldownTimer: 0,
      cooldown: 15000,
    };

    // Shield
    this.add.image(width - 26, height - 60, "icon-shield").setScrollFactor(0);
    this.shieldText = this.add
      .text(width - 50, height - 60, "READY [Q]", {
        fontFamily: "Courier New, monospace",
        fontSize: "16px",
        color: COLORS.ACCENT_STRING,
      })
      .setOrigin(1, 0.5)
      .setScrollFactor(0);

    this.qKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);

    // Shield Visual
    this.shieldGfx = this.add.graphics();
    this.shieldGfx.lineStyle(4, COLORS.ACCENT);
    this.shieldGfx.strokeCircle(0, 0, 30);
    this.shieldGfx.setVisible(false);

    // Dash System
    this.dash = {
      active: false,
      ready: true,
      timer: 0,
      duration: 200,
      cooldownTimer: 0,
      cooldown: 3000,
      speed: 1000,
    };

    // Dash
    this.add.image(width - 26, height - 20, "icon-dash").setScrollFactor(0);
    this.dashText = this.add
      .text(width - 50, height - 20, "READY [E]", {
        fontFamily: "Courier New, monospace",
        fontSize: "16px",
        color: COLORS.ACCENT_STRING,
      })
      .setOrigin(1, 0.5)
      .setScrollFactor(0);

    this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
  }

  takeDamage(amount) {
    if (this.shield.active) {
      this.cameras.main.shake(20, 0.005); // Minor shake on deflect
      return;
    }

    this.player.health -= amount;
    this.hpText.setText(
      `HP: ${this.player.health}% | LIVES: ${this.player.lives}`
    );
    this.cameras.main.shake(100, 0.02);
    this.sound.play("damage", { volume: 0.6 });

    if (this.player.health <= 0) {
      this.player.lives--;
      if (this.player.lives > 0) {
        this.player.health = 100;
        this.hpText.setText(`HP: 100% | LIVES: ${this.player.lives}`);
        // Optional: Add temporary invulnerability or visual feedback here
      } else {
        this.scene.restart();
      }
    }
  }

  applyVelocityDebuff() {
    if (this.player.isDebuffed) return;

    this.player.isDebuffed = true;
    this.player.body.setMaxVelocity(50);
    this.hpText.setColor("#ff0000");

    this.time.delayedCall(2000, () => {
      this.player.isDebuffed = false;
      this.player.body.setMaxVelocity(200);
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

    // Meteor Texture (Jagged Rock)
    const meteorGfx = this.make.graphics({ x: 0, y: 0, add: false });
    meteorGfx.lineStyle(2, 0x888888);
    meteorGfx.strokePoints(
      [
        { x: 16, y: 0 },
        { x: 32, y: 10 },
        { x: 24, y: 28 },
        { x: 8, y: 32 },
        { x: 0, y: 16 },
        { x: 16, y: 0 },
      ],
      true
    );
    meteorGfx.generateTexture("meteor", 32, 32);

    // Star Texture
    const starGfx = this.make.graphics({ x: 0, y: 0, add: false });
    starGfx.fillStyle(0xffffff);
    starGfx.fillCircle(1, 1, 1);
    starGfx.generateTexture("star", 2, 2);

    // UI Icons
    // Overdrive (Square)
    const odIcon = this.make.graphics({ x: 0, y: 0, add: false });
    odIcon.lineStyle(2, COLORS.RED);
    odIcon.strokeRect(4, 4, 24, 24);
    odIcon.fillStyle(COLORS.RED, 0.5);
    odIcon.fillRect(4, 4, 24, 24);
    odIcon.generateTexture("icon-overdrive", 32, 32);

    // Shield (Circle)
    const shieldIcon = this.make.graphics({ x: 0, y: 0, add: false });
    shieldIcon.lineStyle(2, COLORS.ACCENT);
    shieldIcon.strokeCircle(16, 16, 12);
    shieldIcon.fillStyle(COLORS.ACCENT, 0.5);
    shieldIcon.fillCircle(16, 16, 12);
    shieldIcon.generateTexture("icon-shield", 32, 32);

    // Dash (Triangle)
    const dashIcon = this.make.graphics({ x: 0, y: 0, add: false });
    dashIcon.lineStyle(2, COLORS.WHITE);
    dashIcon.strokeTriangle(16, 4, 28, 28, 4, 28);
    dashIcon.fillStyle(COLORS.WHITE, 0.5);
    dashIcon.fillTriangle(16, 4, 28, 28, 4, 28);
    dashIcon.generateTexture("icon-dash", 32, 32);
  }

  createBackground() {
    // Create TileSprites for infinite scrolling stars
    // We need a texture that repeats. The 'star' texture is 2x2.
    // Let's create a larger texture with random stars on it for the TileSprite

    const starFieldGfx = this.make.graphics({ x: 0, y: 0, add: false });
    starFieldGfx.fillStyle(0x000000, 0); // Transparent background
    starFieldGfx.fillRect(0, 0, 512, 512);
    starFieldGfx.fillStyle(0xffffff, 0.5);

    for (let i = 0; i < 5; i++) {
      starFieldGfx.fillCircle(Math.random() * 512, Math.random() * 512, 1);
    }
    starFieldGfx.generateTexture("starfield1", 512, 512);

    const starFieldGfx2 = this.make.graphics({ x: 0, y: 0, add: false });
    starFieldGfx2.fillStyle(0xffffff, 1);
    for (let i = 0; i < 5; i++) {
      starFieldGfx2.fillCircle(Math.random() * 512, Math.random() * 512, 1.5);
    }
    starFieldGfx2.generateTexture("starfield2", 512, 512);

    // Add TileSprites fixed to camera
    this.bgLayer1 = this.add.tileSprite(400, 300, 800, 600, "starfield1");
    this.bgLayer1.setScrollFactor(0);
    this.bgLayer1.setDepth(-10);

    this.bgLayer2 = this.add.tileSprite(400, 300, 800, 600, "starfield2");
    this.bgLayer2.setScrollFactor(0);
    this.bgLayer2.setDepth(-9);
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

      // Overdrive Override
      if (this.overdrive.active) {
        bullet.fire(this.player.x, this.player.y, angle, false, COLORS.RED);
        bullet.isOverdrive = true;
        this.sound.play("laser", {
          volume: 0.4,
          detune: 1200, // High pitch laser
          rate: 2,
        });
      } else {
        bullet.fire(this.player.x, this.player.y, angle, true, polarity);
        bullet.isOverdrive = false;
        this.sound.play("laser", {
          volume: 0.3,
          detune: Math.random() * 200 - 100,
        });
      }
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

    this.meteors.getChildren().forEach((meteor) => {
      if (
        Phaser.Math.Distance.Between(
          meteor.x,
          meteor.y,
          playerPos.x,
          playerPos.y
        ) > 1500
      ) {
        meteor.destroy();
      }
    });

    // Spawn new ones if count is low
    if (this.prisms.countActive() < 5) {
      const pos = this.getSpawnPos(playerPos);
      this.prisms.add(new Prism(this, pos.x, pos.y));
    }

    if (this.meteors.countActive() < 10) {
      const pos = this.getSpawnPos(playerPos);
      this.meteors.add(new Meteor(this, pos.x, pos.y));
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
    // Let's fix the starfield logic to be simpler:
    // We'll just use a large TileSprite that covers the screen and set its tilePosition
    if (this.bgLayer1) {
      this.bgLayer1.tilePositionX = this.cameras.main.scrollX * 0.1;
      this.bgLayer1.tilePositionY = this.cameras.main.scrollY * 0.1;
    }
    if (this.bgLayer2) {
      this.bgLayer2.tilePositionX = this.cameras.main.scrollX * 0.3;
      this.bgLayer2.tilePositionY = this.cameras.main.scrollY * 0.3;
    }

    // Overdrive Logic
    if (Phaser.Input.Keyboard.JustDown(this.tabKey)) {
      if (this.overdrive.ready) {
        this.overdrive.active = true;
        this.overdrive.ready = false;
        this.overdrive.timer = this.time.now + this.overdrive.duration;

        // Visuals ON
        this.cameras.main.setBackgroundColor("#330000"); // Dark Red BG
        this.overdriveText.setText("ACTIVE");
        this.overdriveText.setColor(COLORS.RED_STRING);
        this.fireRate = 50; // Machine Gun Speed
      }
    }

    if (this.overdrive.active) {
      // Shake screen constantly
      this.cameras.main.shake(50, 0.005);

      if (this.time.now > this.overdrive.timer) {
        // Deactivate
        this.overdrive.active = false;
        this.overdrive.cooldownTimer = this.time.now + this.overdrive.cooldown;

        // Visuals OFF
        this.cameras.main.setBackgroundColor(COLORS.BLACK);
        this.overdriveText.setText("COOLDOWN");
        this.overdriveText.setColor(COLORS.WHITE_STRING);
        this.fireRate = 200; // Reset Speed
      }
    } else if (!this.overdrive.ready) {
      // Cooldown Logic
      if (this.time.now > this.overdrive.cooldownTimer) {
        this.overdrive.ready = true;
        this.overdriveText.setText("READY [TAB]");
        this.overdriveText.setColor(COLORS.ACCENT_STRING);
      } else {
        const remaining = Math.ceil(
          (this.overdrive.cooldownTimer - this.time.now) / 1000
        );
        this.overdriveText.setText(`COOLDOWN (${remaining})`);
      }
    }

    // Shield Logic
    if (Phaser.Input.Keyboard.JustDown(this.qKey)) {
      if (this.shield.ready) {
        this.shield.active = true;
        this.shield.ready = false;
        this.shield.timer = this.time.now + this.shield.duration;

        this.shieldGfx.setVisible(true);
        this.shieldText.setText("ACTIVE");
        this.shieldText.setColor(COLORS.WHITE_STRING);
      }
    }

    if (this.shield.active) {
      this.shieldGfx.setPosition(this.player.x, this.player.y);
      this.shieldGfx.rotation += 0.1; // Spin effect

      if (this.time.now > this.shield.timer) {
        this.shield.active = false;
        this.shield.cooldownTimer = this.time.now + this.shield.cooldown;
        this.shieldGfx.setVisible(false);

        this.shieldText.setText("COOLDOWN");
        this.shieldText.setColor(COLORS.WHITE_STRING);
      }
    } else if (!this.shield.ready) {
      if (this.time.now > this.shield.cooldownTimer) {
        this.shield.ready = true;
        this.shieldText.setText("READY [Q]");
        this.shieldText.setColor(COLORS.ACCENT_STRING);
      } else {
        const remaining = Math.ceil(
          (this.shield.cooldownTimer - this.time.now) / 1000
        );
        this.shieldText.setText(`COOLDOWN (${remaining})`);
      }
    }

    // Dash Logic
    if (Phaser.Input.Keyboard.JustDown(this.eKey) && this.dash.ready) {
      this.dash.active = true;
      this.dash.ready = false;
      this.dash.timer = this.time.now + this.dash.duration;
      this.dash.cooldownTimer = this.time.now + this.dash.cooldown;

      this.dashText.setText("ACTIVE");
      this.dashText.setColor(COLORS.WHITE_STRING);

      // Apply Dash Velocity (Towards Facing Direction)
      const angle = this.player.rotation - Math.PI / 2;
      this.player.body.setMaxVelocity(this.dash.speed);
      this.physics.velocityFromRotation(
        angle,
        this.dash.speed,
        this.player.body.velocity
      );
    }

    if (this.dash.active) {
      // Create trail effect
      const ghost = this.add.triangle(
        this.player.x,
        this.player.y,
        0,
        20,
        10,
        0,
        20,
        20,
        COLORS.WHITE
      );
      ghost.setOrigin(0.5);
      ghost.rotation = this.player.rotation;
      ghost.alpha = 0.5;
      this.tweens.add({
        targets: ghost,
        alpha: 0,
        duration: 200,
        onComplete: () => ghost.destroy(),
      });

      if (this.time.now > this.dash.timer) {
        this.dash.active = false;
        this.player.body.setMaxVelocity(200); // Reset max velocity
        this.dashText.setText("COOLDOWN");
      }
    } else if (!this.dash.ready) {
      if (this.time.now > this.dash.cooldownTimer) {
        this.dash.ready = true;
        this.dashText.setText("READY [E]");
        this.dashText.setColor(COLORS.ACCENT_STRING);
      } else {
        const remaining = Math.ceil(
          (this.dash.cooldownTimer - this.time.now) / 1000
        );
        this.dashText.setText(`COOLDOWN (${remaining})`);
      }
    }

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
    if (!this.dash.active) {
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
