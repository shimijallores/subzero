// Main gameplay scene handling the game loop and collisions.
import { COLORS } from "../consts/Colors.js";
import Bullet from "../objects/Bullet.js";
import Prism from "../objects/Prism.js";
import Meteor from "../objects/Meteor.js";
import Player from "../objects/Player.js";
import TextureGenerator from "../utils/TextureGenerator.js";
import BackgroundManager from "../managers/BackgroundManager.js";
import UIManager from "../managers/UIManager.js";
import SpawnManager from "../managers/SpawnManager.js";
import UpgradeManager from "../managers/UpgradeManager.js";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  init(data) {
    this.playerName = data.playerName || "PILOT";
  }

  preload() {
    this.load.audio("laser", "assets/sounds/laser.mp3");
    this.load.audio("dash", "assets/sounds/dash.mp3");
    this.load.audio("shield", "assets/sounds/shield.mp3");
    this.load.audio("damage", "assets/sounds/damage.mp3");
    this.load.audio("enemy-hit", "assets/sounds/enemy-hit.mp3");
    this.load.audio("background", "assets/sounds/background.mp3");
  }

  create() {
    // Disable context menu for right-click shooting
    this.input.mouse.disableContextMenu();

    // Generate Textures
    new TextureGenerator(this).generate();

    // Background
    this.backgroundManager = new BackgroundManager(this);
    this.backgroundManager.create();

    // Music
    if (!this.sound.get("background")) {
      this.music = this.sound.add("background", { volume: 0.5, loop: true });
      this.music.play();
    } else {
      this.music = this.sound.get("background");
      if (!this.music.isPlaying) {
        this.music.play();
      }
    }

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

    // Player
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;
    this.player = new Player(this, centerX, centerY, this.bullets);

    // Camera
    this.cameras.main.startFollow(this.player);
    this.cameras.main.zoom = 1.5;

    // UI
    this.uiManager = new UIManager(this);
    this.uiManager.create();

    // Spawner
    this.spawnManager = new SpawnManager(this);

    // Upgrades
    this.upgradeManager = new UpgradeManager(this);
    this.upgradeManager.create();

    // Game State
    this.score = 0;

    // Level Setup (Test)
    this.prisms.add(new Prism(this, 200, 200));
    this.prisms.add(new Prism(this, 600, 400));

    // Collisions
    this.setupCollisions();
  }

  setupCollisions() {
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
        this.sound.play("enemy-hit", { volume: 0.5, rate: 1.5 });

        // Boss handling
        if (enemy.health) {
          enemy.health -= 50;
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
      bullet.disableBody(true, true);
    });

    // Player vs Enemies Collision
    this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
      player.takeDamage(10);
      enemy.destroy();
    });

    this.physics.add.overlap(this.player, this.meteors, (player, meteor) => {
      player.takeDamage(20);
      meteor.destroy();
    });
  }

  update(time, delta) {
    // Skip update if showing upgrades
    if (this.upgradeManager.isShowingUpgrades) return;

    this.backgroundManager.update();
    this.player.update(time, delta);
    this.spawnManager.update(time, delta);
    this.upgradeManager.update(time, delta);
    this.spawnManager.spawn(
      this.player,
      this.prisms,
      this.enemies,
      this.meteors,
      this.score
    );

    // Update UI
    this.uiManager.updateScore(this.score);
    this.uiManager.updateHP(this.player.health, this.player.lives);

    if (this.player.isDebuffed) {
      this.uiManager.setHPColor("#ff0000");
    } else {
      this.uiManager.setHPColor(COLORS.WHITE_STRING);
    }

    this.updateSkillUI(time);

    if (this.player.lives <= 0) {
      this.music.stop();
      this.uiManager.hide();
      this.upgradeManager.destroy();
      this.scene.start("GameOverScene", {
        score: this.score,
        playerName: this.playerName,
      });
    }
  }

  updateSkillUI(time) {
    // Overdri
    if (this.player.overdrive.active) {
      this.uiManager.updateOverdriveStatus("ACTIVE", COLORS.RED_STRING);
    } else if (!this.player.overdrive.ready) {
      const remaining = Math.ceil(
        (this.player.overdrive.cooldownTimer - time) / 1000
      );
      this.uiManager.updateOverdriveStatus(
        `COOLDOWN (${remaining})`,
        COLORS.WHITE_STRING
      );
    } else {
      this.uiManager.updateOverdriveStatus("READY [F]", COLORS.ACCENT_STRING);
    }

    // Shield
    if (this.player.shield.active) {
      this.uiManager.updateShieldStatus("ACTIVE", COLORS.WHITE_STRING);
    } else if (!this.player.shield.ready) {
      const remaining = Math.ceil(
        (this.player.shield.cooldownTimer - time) / 1000
      );
      this.uiManager.updateShieldStatus(
        `COOLDOWN (${remaining})`,
        COLORS.WHITE_STRING
      );
    } else {
      this.uiManager.updateShieldStatus("READY [Q]", COLORS.ACCENT_STRING);
    }

    // Dash
    if (this.player.dash.active) {
      this.uiManager.updateDashStatus("ACTIVE", COLORS.WHITE_STRING);
    } else if (!this.player.dash.ready) {
      const remaining = Math.ceil(
        (this.player.dash.cooldownTimer - time) / 1000
      );
      this.uiManager.updateDashStatus(
        `COOLDOWN (${remaining})`,
        COLORS.WHITE_STRING
      );
    } else {
      this.uiManager.updateDashStatus("READY [E]", COLORS.ACCENT_STRING);
    }
  }

  addScore(points) {
    this.score += points;
  }
}
