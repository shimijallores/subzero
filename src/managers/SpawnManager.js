// Controls enemy and meteor spawning logic and round progression.
import Prism from "../objects/Prism.js";
import FluxStrider from "../objects/enemies/FluxStrider.js";
import ChronoLoomer from "../objects/enemies/ChronoLoomer.js";
import VoidSentinel from "../objects/enemies/VoidSentinel.js";
import NegativeSpaceVoid from "../objects/enemies/NegativeSpaceVoid.js";
import KamikazeEnemy from "../objects/enemies/KamikazeEnemy.js";
import VoidSerpent from "../objects/enemies/VoidSerpent.js";
import Meteor from "../objects/Meteor.js";

export default class SpawnManager {
  constructor(scene) {
    this.scene = scene;
    this.bossActive = false;

    // Round System
    this.currentRound = 1;
    this.roundTimer = 30000;
    this.roundDuration = 30000;
    this.enemyCap = 10;
    this.meteorCap = 20;
  }

  update(time, delta) {
    this.roundTimer -= delta;

    if (this.roundTimer <= 0) {
      this.nextRound();
    }

    // Update UI
    if (this.scene.uiManager) {
      this.scene.uiManager.updateRound(this.currentRound, this.roundTimer);
    }
  }

  nextRound() {
    this.currentRound++;
    this.roundTimer = this.roundDuration;

    // Increase Difficulty
    this.enemyCap = Math.floor(5 + this.currentRound * 1.5);
    this.meteorCap = Math.floor(10 + this.currentRound * 0.5);

    // Show UI
    if (this.scene.uiManager) {
      this.scene.uiManager.showNextRound(this.currentRound);
    }

    // Trigger upgrade selection every 3 rounds
    if (
      this.scene.upgradeManager &&
      this.scene.upgradeManager.shouldShowUpgrades(this.currentRound)
    ) {
      // Delay slightly to let round announcement show first
      this.scene.time.delayedCall(1500, () => {
        this.scene.upgradeManager.showUpgradeSelection();
      });
    }

    this.scene.addScore(500 * this.currentRound);
  }

  spawn(player, prisms, enemies, meteors, score) {
    // Keep enemies around
    const playerPos = new Phaser.Math.Vector2(player.x, player.y);

    // Kill mwhehehe distant entities
    this.cleanup(prisms, playerPos);
    this.cleanup(enemies, playerPos);
    this.cleanup(meteors, playerPos);

    // Spawn new ones
    if (prisms.countActive() < 5) {
      const pos = this.getSpawnPos(playerPos);
      prisms.add(new Prism(this.scene, pos.x, pos.y));
    }

    if (meteors.countActive() < this.meteorCap) {
      const pos = this.getSpawnPos(playerPos);
      meteors.add(new Meteor(this.scene, pos.x, pos.y));
    }

    if (enemies.countActive() < this.enemyCap) {
      const pos = this.getSpawnPos(playerPos);
      const rand = Math.random();

      // Boss Spawn Logic
      if (score > 1000 && !this.bossActive && Math.random() < 0.05) {
        this.bossActive = true;

        // Randomly choose between bosses
        const bossType = Math.random() > 0.5 ? NegativeSpaceVoid : VoidSerpent;
        const boss = new bossType(this.scene, pos.x, pos.y);

        enemies.add(boss);

        // Reset boss active flag when destroyed
        boss.once("destroy", () => {
          this.bossActive = false;
        });
      } else if (rand < 0.5) {
        enemies.add(new FluxStrider(this.scene, pos.x, pos.y));
      } else if (rand < 0.7) {
        enemies.add(new ChronoLoomer(this.scene, pos.x, pos.y));
      } else if (rand < 0.85) {
        enemies.add(new KamikazeEnemy(this.scene, pos.x, pos.y));
      } else {
        enemies.add(new VoidSentinel(this.scene, pos.x, pos.y));
      }
    }
  }

  cleanup(group, playerPos) {
    group.getChildren().forEach((entity) => {
      if (
        Phaser.Math.Distance.Between(
          entity.x,
          entity.y,
          playerPos.x,
          playerPos.y
        ) > 1500
      ) {
        entity.destroy();
      }
    });
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
}
