// Controls the player ship, movement, shooting, and skills.
import { COLORS } from "../consts/Colors.js";

export default class Player extends Phaser.GameObjects.Triangle {
  constructor(scene, x, y, bulletsGroup) {
    super(scene, x, y, 0, 20, 10, 0, 20, 20, COLORS.WHITE);
    this.scene = scene;
    this.bullets = bulletsGroup;

    // Add to scene and physics
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5);
    this.body.setDrag(100);
    this.body.setMaxVelocity(200);

    // Stats
    this.health = 100;
    this.maxHealth = 100;
    this.lives = 3;
    this.isDebuffed = false;
    this.lastFired = 0;
    this.fireRate = 200;

    // Input
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
    });
    this.tabKey = scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.TAB
    );
    this.qKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    this.eKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // Systems
    this.setupOverdrive();
    this.setupShield();
    this.setupDash();
    this.setupVisuals();
  }

  setupOverdrive() {
    this.overdrive = {
      active: false,
      ready: true,
      timer: 0,
      duration: 7000,
      cooldownTimer: 0,
      cooldown: 10000,
    };
  }

  setupShield() {
    this.shield = {
      active: false,
      ready: true,
      timer: 0,
      duration: 5000,
      cooldownTimer: 0,
      cooldown: 15000,
    };

    this.shieldGfx = this.scene.add.graphics();
    this.shieldGfx.lineStyle(4, COLORS.ACCENT);
    this.shieldGfx.strokeCircle(0, 0, 30);
    this.shieldGfx.setVisible(false);
  }

  setupDash() {
    this.dash = {
      active: false,
      ready: true,
      timer: 0,
      duration: 200,
      cooldownTimer: 0,
      cooldown: 3000,
      speed: 1000,
    };
  }

  setupVisuals() {
    // Particles
    this.emitter = this.scene.add.particles(0, 0, "particle", {
      lifespan: 600,
      speed: { min: 10, max: 50 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 0.6, end: 0 },
      blendMode: "ADD",
      frequency: 10,
      emitting: false,
    });
    this.emitter.startFollow(this);

    // Time-Clone Ghost
    this.ghost = this.scene.add.graphics();
    this.ghost.lineStyle(2, COLORS.ACCENT, 0.5);
    this.ghost.strokeTriangle(0, 20, 10, 0, 20, 20);
    this.ghost.x = this.x;
    this.ghost.y = this.y;
  }

  update(time, delta) {
    this.handleMovement();
    this.handleRotation();
    this.handleShooting(time);
    this.handleSkills(time);
    this.updateVisuals();
  }

  handleMovement() {
    if (this.dash.active) return;

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

    if (accX !== 0 || accY !== 0) {
      const length = Math.sqrt(accX * accX + accY * accY);
      this.body.setAcceleration(
        (accX / length) * acceleration,
        (accY / length) * acceleration
      );
      this.emitter.start();
    } else {
      this.body.setAcceleration(0, 0);
      this.emitter.stop();
    }
  }

  handleRotation() {
    const pointer = this.scene.input.activePointer;
    this.rotation =
      Phaser.Math.Angle.Between(
        this.x,
        this.y,
        pointer.worldX,
        pointer.worldY
      ) +
      Math.PI / 2;
  }

  handleShooting(time) {
    if (this.scene.input.activePointer.isDown) {
      if (time > this.lastFired) {
        const pointer = this.scene.input.activePointer;
        let polarity = COLORS.WHITE;

        if (pointer.rightButtonDown()) {
          polarity = COLORS.ACCENT;
        }

        this.fireBullet(pointer, polarity);
        this.lastFired = time + this.fireRate;
      }
    }
  }

  fireBullet(pointer, polarity) {
    const bullet = this.bullets.get();
    if (bullet) {
      const angle = Phaser.Math.Angle.Between(
        this.x,
        this.y,
        pointer.worldX,
        pointer.worldY
      );

      if (this.overdrive.active) {
        bullet.fire(this.x, this.y, angle, false, COLORS.RED);
        bullet.isOverdrive = true;
        this.scene.sound.play("laser", {
          volume: 0.4,
          detune: 1200,
          rate: 2,
        });
      } else {
        bullet.fire(this.x, this.y, angle, true, polarity);
        bullet.isOverdrive = false;
        this.scene.sound.play("laser", {
          volume: 0.3,
          detune: Math.random() * 200 - 100,
        });
      }
    }
  }

  handleSkills(time) {
    // Overdrive
    if (Phaser.Input.Keyboard.JustDown(this.tabKey)) {
      if (this.overdrive.ready) {
        this.overdrive.active = true;
        this.overdrive.ready = false;
        this.overdrive.timer = time + this.overdrive.duration;
        this.fireRate = 50;
        this.scene.cameras.main.setBackgroundColor("#330000");
      }
    }

    if (this.overdrive.active) {
      this.scene.cameras.main.shake(50, 0.005);
      if (time > this.overdrive.timer) {
        this.overdrive.active = false;
        this.overdrive.cooldownTimer = time + this.overdrive.cooldown;
        this.fireRate = 200;
        this.scene.cameras.main.setBackgroundColor(COLORS.BLACK);
      }
    } else if (!this.overdrive.ready) {
      if (time > this.overdrive.cooldownTimer) {
        this.overdrive.ready = true;
      }
    }

    // Shield
    if (Phaser.Input.Keyboard.JustDown(this.qKey)) {
      if (this.shield.ready) {
        this.shield.active = true;
        this.shield.ready = false;
        this.shield.timer = time + this.shield.duration;
        this.shieldGfx.setVisible(true);
      }
    }

    if (this.shield.active) {
      this.shieldGfx.setPosition(this.x, this.y);
      this.shieldGfx.rotation += 0.1;
      if (time > this.shield.timer) {
        this.shield.active = false;
        this.shield.cooldownTimer = time + this.shield.cooldown;
        this.shieldGfx.setVisible(false);
      }
    } else if (!this.shield.ready) {
      if (time > this.shield.cooldownTimer) {
        this.shield.ready = true;
      }
    }

    // Dash
    if (Phaser.Input.Keyboard.JustDown(this.eKey) && this.dash.ready) {
      this.dash.active = true;
      this.dash.ready = false;
      this.dash.timer = time + this.dash.duration;
      this.dash.cooldownTimer = time + this.dash.cooldown;

      const angle = this.rotation - Math.PI / 2;
      this.body.setMaxVelocity(this.dash.speed);
      this.scene.physics.velocityFromRotation(
        angle,
        this.dash.speed,
        this.body.velocity
      );
    }

    if (this.dash.active) {
      this.createDashTrail();
      if (time > this.dash.timer) {
        this.dash.active = false;
        this.body.setMaxVelocity(200);
      }
    } else if (!this.dash.ready) {
      if (time > this.dash.cooldownTimer) {
        this.dash.ready = true;
      }
    }
  }

  createDashTrail() {
    const ghost = this.scene.add.triangle(
      this.x,
      this.y,
      0,
      20,
      10,
      0,
      20,
      20,
      COLORS.WHITE
    );
    ghost.setOrigin(0.5);
    ghost.rotation = this.rotation;
    ghost.alpha = 0.5;
    this.scene.tweens.add({
      targets: ghost,
      alpha: 0,
      duration: 200,
      onComplete: () => ghost.destroy(),
    });
  }

  updateVisuals() {
    // Ghost flickers
    if (Math.random() > 0.9) {
      this.ghost.alpha = Math.random();
    }
    this.ghost.x = Phaser.Math.Linear(this.ghost.x, this.x, 0.1);
    this.ghost.y = Phaser.Math.Linear(this.ghost.y, this.y, 0.1);
    this.ghost.rotation = this.rotation;
  }

  takeDamage(amount) {
    if (this.shield.active) {
      this.scene.cameras.main.shake(20, 0.005);
      return false;
    }

    this.health -= amount;
    this.scene.cameras.main.shake(100, 0.02);
    this.scene.sound.play("damage", { volume: 0.6 });
    this.scene.uiManager.triggerDamageVignette();

    if (this.health <= 0) {
      this.lives--;
      if (this.lives > 0) {
        this.health = 100;
        // Optional: Add temporary invulnerability
      } else {
        // Game Over logic handled by scene usually, but we can emit or just let scene check lives
      }
    }
    return true;
  }

  applyVelocityDebuff() {
    if (this.isDebuffed) return;

    this.isDebuffed = true;
    this.body.setMaxVelocity(50);
    // Visual feedback handled by UI or Scene

    this.scene.time.delayedCall(2000, () => {
      this.isDebuffed = false;
      this.body.setMaxVelocity(200);
    });
  }
}
