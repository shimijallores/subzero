// Entry point that initializes the Phaser game instance and config.
import GameScene from "./scenes/GameScene.js";
import MainMenuScene from "./scenes/MainMenuScene.js";
import GameOverScene from "./scenes/GameOverScene.js";

const config = {
  type: Phaser.WEBGL,
  width: 800,
  height: 600,
  backgroundColor: "#000000",
  parent: "game-container",
  dom: {
    createContainer: true,
  },
  scene: [MainMenuScene, GameScene, GameOverScene],
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
};

const game = new Phaser.Game(config);
