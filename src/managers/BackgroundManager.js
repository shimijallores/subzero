// Manages the scrolling starfield background layers.
import { COLORS } from "../consts/Colors.js";

export default class BackgroundManager {
  constructor(scene) {
    this.scene = scene;
    this.bgLayer1 = null;
    this.bgLayer2 = null;
  }

  create() {
    // Background
    this.scene.cameras.main.setBackgroundColor(COLORS.BLACK);

    // Create TileSprites for infinite scrolling stars
    const starFieldGfx = this.scene.make.graphics({ x: 0, y: 0, add: false });
    starFieldGfx.fillStyle(0x000000, 0);
    starFieldGfx.fillRect(0, 0, 512, 512);
    starFieldGfx.fillStyle(0xffffff, 0.5);

    for (let i = 0; i < 5; i++) {
      starFieldGfx.fillCircle(Math.random() * 512, Math.random() * 512, 1);
    }
    starFieldGfx.generateTexture("starfield1", 512, 512);

    const starFieldGfx2 = this.scene.make.graphics({ x: 0, y: 0, add: false });
    starFieldGfx2.fillStyle(0xffffff, 1);
    for (let i = 0; i < 5; i++) {
      starFieldGfx2.fillCircle(Math.random() * 512, Math.random() * 512, 1.5);
    }
    starFieldGfx2.generateTexture("starfield2", 512, 512);

    // Add TileSprites fixed to camera
    this.bgLayer1 = this.scene.add.tileSprite(400, 300, 800, 600, "starfield1");
    this.bgLayer1.setScrollFactor(0);
    this.bgLayer1.setDepth(-10);

    this.bgLayer2 = this.scene.add.tileSprite(400, 300, 800, 600, "starfield2");
    this.bgLayer2.setScrollFactor(0);
    this.bgLayer2.setDepth(-9);
  }

  update() {
    if (this.bgLayer1) {
      this.bgLayer1.tilePositionX = this.scene.cameras.main.scrollX * 0.1;
      this.bgLayer1.tilePositionY = this.scene.cameras.main.scrollY * 0.1;
    }
    if (this.bgLayer2) {
      this.bgLayer2.tilePositionX = this.scene.cameras.main.scrollX * 0.3;
      this.bgLayer2.tilePositionY = this.scene.cameras.main.scrollY * 0.3;
    }
  }
}
