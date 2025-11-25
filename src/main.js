// Entry point that initializes the Phaser game instance and config.
import GameScene from "./scenes/GameScene.js";
import MainMenuScene from "./scenes/MainMenuScene.js";
import GameOverScene from "./scenes/GameOverScene.js";

const config = {
  type: Phaser.WEBGL,
  backgroundColor: "#000000",
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
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
