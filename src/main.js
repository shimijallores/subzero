import GameScene from "./scenes/GameScene.js";

const config = {
  type: Phaser.WEBGL, // WebGL is required for shaders
  width: 800,
  height: 600,
  backgroundColor: "#000000",
  parent: "game-container",
  scene: [GameScene],
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
};

const game = new Phaser.Game(config);
