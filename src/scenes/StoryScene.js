// Animated storyboard scene with lore
import { COLORS } from "../consts/Colors.js";

const STORY_PANELS = [
  {
    title: "THE COSMIC WAR",
    text: "Eons ago, two ancient civilizations waged war across the galaxy.\nTheir conflict scarred the very fabric of space itself.",
    image: "war",
    color: 0xff4444,
  },
  {
    title: "THE FACTORIES",
    text: "They built autonomous factories to fuel their endless battle.\nMassive forges that consumed entire planets for resources.",
    image: "factory",
    color: 0xff8800,
  },
  {
    title: "THE WEAPONS",
    text: "They engineered weaponized fauna—living ships and bio-weapons.\nCreatures born only to destroy.",
    image: "fauna",
    color: 0x44ff44,
  },
  {
    title: "THE ROGUE STARS",
    text: "They hurled stars as projectiles, leaving gravitational chaos.\nDead suns now drift aimlessly through the void.",
    image: "stars",
    color: 0xffff44,
  },
  {
    title: "THE SILENCE",
    text: "Then... silence. Both civilizations vanished without a trace.\nOnly their war machines remained.",
    image: "silence",
    color: 0x8844ff,
  },
  {
    title: "THE FORGETTING",
    text: "The machines forgot their original purpose.\nNow they attack anything that moves.",
    image: "forget",
    color: 0x4488ff,
  },
  {
    title: "YOU",
    text: "You are SUBZERO. A strange bio-ship that refuses to stay dead.\nYour origin is unknown. Your purpose... survival.",
    image: "player",
    color: 0x00ffff,
  },
];

export default class StoryScene extends Phaser.Scene {
  constructor() {
    super("StoryScene");
  }

  init(data) {
    this.playerName = data.playerName || "PILOT";
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    this.currentPanel = 0;
    this.isTransitioning = false;

    // Dark background
    this.cameras.main.setBackgroundColor(0x000000);

    // Particle starfield
    const starGfx = this.make.graphics({ x: 0, y: 0, add: false });
    starGfx.fillStyle(0xffffff);
    starGfx.fillCircle(1, 1, 1);
    starGfx.generateTexture("star_story", 2, 2);

    this.add.particles(0, 0, "star_story", {
      x: { min: 0, max: width },
      y: { min: 0, max: height },
      quantity: 50,
      lifespan: 3000,
      alpha: { start: 0.3, end: 0 },
      scale: { min: 0.5, max: 1.5 },
      frequency: 200,
    });

    // Container for panel content
    this.panelContainer = this.add.container(width / 2, height / 2);

    // Panel frame
    this.panelFrame = this.add.graphics();
    this.panelContainer.add(this.panelFrame);

    // Panel background
    this.panelBg = this.add.graphics();
    this.panelContainer.add(this.panelBg);

    // Panel image area
    this.imageGfx = this.add.graphics();
    this.panelContainer.add(this.imageGfx);

    // Title text
    this.titleText = this.add
      .text(0, -180, "", {
        fontFamily: "'Space Nova', 'Courier New', monospace",
        fontSize: "48px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    this.panelContainer.add(this.titleText);

    // Story text
    this.storyText = this.add
      .text(0, 100, "", {
        fontFamily: "Courier New, monospace",
        fontSize: "22px",
        color: "#cccccc",
        align: "center",
        lineSpacing: 12,
        wordWrap: { width: 600 },
      })
      .setOrigin(0.5);
    this.panelContainer.add(this.storyText);

    // Progress indicator
    this.progressContainer = this.add.container(width / 2, height - 80);
    this.progressDots = [];
    for (let i = 0; i < STORY_PANELS.length; i++) {
      const dot = this.add.circle(
        (i - (STORY_PANELS.length - 1) / 2) * 30,
        0,
        6,
        0x333333
      );
      this.progressDots.push(dot);
      this.progressContainer.add(dot);
    }

    // Skip button
    this.skipText = this.add
      .text(width - 30, 30, "[ SKIP >> ]", {
        fontFamily: "Courier New, monospace",
        fontSize: "18px",
        color: "#666666",
      })
      .setOrigin(1, 0)
      .setInteractive({ useHandCursor: true });

    this.skipText.on("pointerover", () => this.skipText.setColor("#ffffff"));
    this.skipText.on("pointerout", () => this.skipText.setColor("#666666"));
    this.skipText.on("pointerdown", () => this.skipToGame());

    // Continue prompt
    this.continueText = this.add
      .text(width / 2, height - 30, "Click or press SPACE to continue", {
        fontFamily: "Courier New, monospace",
        fontSize: "16px",
        color: "#666666",
      })
      .setOrigin(0.5);

    // Continue prompt
    this.skipText = this.add
      .text(width / 2, height - 50, "Click or press TAB to skip", {
        fontFamily: "Courier New, monospace",
        fontSize: "16px",
        color: "#666666",
      })
      .setOrigin(0.5);

    // Pulsing continue text
    this.tweens.add({
      targets: this.continueText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // Pulsing skip text
    this.tweens.add({
      targets: this.skipText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // Input handlers
    this.input.on("pointerdown", () => this.nextPanel());
    this.input.keyboard.on("keydown-SPACE", () => this.nextPanel());
    this.input.keyboard.on("keydown-ENTER", () => this.nextPanel());
    this.input.keyboard.on("keydown-TAB", () => this.skipToGame());

    // Show first panel
    this.showPanel(0);
  }

  showPanel(index) {
    if (index >= STORY_PANELS.length) {
      this.skipToGame();
      return;
    }

    const panel = STORY_PANELS[index];
    this.currentPanel = index;
    this.isTransitioning = true;

    // Update progress dots
    this.progressDots.forEach((dot, i) => {
      dot.setFillStyle(
        i === index ? panel.color : i < index ? 0x666666 : 0x333333
      );
    });

    // Fade out current content
    this.tweens.add({
      targets: [this.titleText, this.storyText, this.imageGfx],
      alpha: 0,
      duration: 300,
      onComplete: () => {
        // Update content
        this.titleText.setText(panel.title);
        this.titleText.setColor(
          "#" + panel.color.toString(16).padStart(6, "0")
        );
        this.storyText.setText(panel.text);

        // Draw panel visuals
        this.drawPanelFrame(panel.color);
        this.drawPanelImage(panel.image, panel.color);

        // Fade in new content
        this.tweens.add({
          targets: [this.titleText, this.storyText],
          alpha: 1,
          duration: 500,
        });

        // Animate image appearance
        this.imageGfx.alpha = 0;
        this.tweens.add({
          targets: this.imageGfx,
          alpha: 1,
          duration: 800,
          onComplete: () => {
            this.isTransitioning = false;
          },
        });
      },
    });
  }

  drawPanelFrame(color) {
    this.panelFrame.clear();
    this.panelFrame.lineStyle(3, color, 0.8);

    // Decorative frame corners
    const w = 350;
    const h = 180;
    const cornerSize = 20;

    // Top-left corner
    this.panelFrame.moveTo(-w, -h + cornerSize);
    this.panelFrame.lineTo(-w, -h);
    this.panelFrame.lineTo(-w + cornerSize, -h);

    // Top-right corner
    this.panelFrame.moveTo(w - cornerSize, -h);
    this.panelFrame.lineTo(w, -h);
    this.panelFrame.lineTo(w, -h + cornerSize);

    // Bottom-left corner
    this.panelFrame.moveTo(-w, h - cornerSize);
    this.panelFrame.lineTo(-w, h);
    this.panelFrame.lineTo(-w + cornerSize, h);

    // Bottom-right corner
    this.panelFrame.moveTo(w - cornerSize, h);
    this.panelFrame.lineTo(w, h);
    this.panelFrame.lineTo(w, h - cornerSize);

    this.panelFrame.strokePath();

    // Background gradient effect
    this.panelBg.clear();
    this.panelBg.fillStyle(color, 0.05);
    this.panelBg.fillRect(-w, -h, w * 2, h * 2);
  }

  drawPanelImage(imageType, color) {
    this.imageGfx.clear();
    const cx = 0;
    const cy = -40;

    switch (imageType) {
      case "war":
        // Two clashing forces
        this.imageGfx.fillStyle(0xff4444, 0.6);
        this.drawExplosion(cx - 60, cy, 40, color);
        this.imageGfx.fillStyle(0x4444ff, 0.6);
        this.drawExplosion(cx + 60, cy, 40, 0x4444ff);
        this.imageGfx.lineStyle(2, 0xffffff, 0.8);
        this.imageGfx.lineBetween(cx - 20, cy, cx + 20, cy);
        break;

      case "factory":
        // Industrial structure
        this.imageGfx.fillStyle(color, 0.4);
        this.imageGfx.fillRect(cx - 50, cy - 20, 30, 60);
        this.imageGfx.fillRect(cx - 10, cy - 40, 40, 80);
        this.imageGfx.fillRect(cx + 40, cy, 25, 40);
        // Smoke
        this.imageGfx.fillStyle(0x666666, 0.3);
        this.imageGfx.fillCircle(cx + 5, cy - 60, 15);
        this.imageGfx.fillCircle(cx + 15, cy - 75, 12);
        break;

      case "fauna":
        // Bio creature
        this.imageGfx.lineStyle(3, color, 0.8);
        this.imageGfx.strokeCircle(cx, cy, 35);
        // Tendrils
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          const x1 = cx + Math.cos(angle) * 35;
          const y1 = cy + Math.sin(angle) * 35;
          const x2 = cx + Math.cos(angle) * 60;
          const y2 = cy + Math.sin(angle) * 60;
          this.imageGfx.lineBetween(x1, y1, x2, y2);
        }
        // Eye
        this.imageGfx.fillStyle(color, 1);
        this.imageGfx.fillCircle(cx, cy, 10);
        break;

      case "stars":
        // Rogue stars
        this.imageGfx.fillStyle(color, 0.8);
        this.drawStar(cx - 50, cy - 20, 20, 5);
        this.drawStar(cx + 40, cy + 10, 15, 5);
        this.drawStar(cx, cy - 10, 25, 5);
        // Orbital lines
        this.imageGfx.lineStyle(1, color, 0.3);
        this.imageGfx.strokeCircle(cx, cy, 60);
        this.imageGfx.strokeCircle(cx, cy, 45);
        break;

      case "silence":
        // Empty void with debris
        this.imageGfx.lineStyle(1, 0x444444, 0.5);
        for (let i = 0; i < 8; i++) {
          const x = cx + (Math.random() - 0.5) * 150;
          const y = cy + (Math.random() - 0.5) * 80;
          const size = Math.random() * 10 + 5;
          this.imageGfx.strokeRect(x, y, size, size);
        }
        // Faint glow
        this.imageGfx.fillStyle(color, 0.1);
        this.imageGfx.fillCircle(cx, cy, 50);
        break;

      case "forget":
        // Glitching machine
        this.imageGfx.lineStyle(2, color, 0.6);
        this.imageGfx.strokeRect(cx - 30, cy - 30, 60, 60);
        // Glitch lines
        this.imageGfx.lineStyle(1, 0xff0000, 0.4);
        this.imageGfx.lineBetween(cx - 40, cy - 10, cx + 40, cy - 10);
        this.imageGfx.lineStyle(1, 0x00ff00, 0.4);
        this.imageGfx.lineBetween(cx - 35, cy + 5, cx + 35, cy + 5);
        // Question mark
        this.imageGfx.fillStyle(color, 0.8);
        this.imageGfx.fillCircle(cx, cy + 15, 4);
        break;

      case "player":
        // The bio-ship (triangle evolving)
        this.imageGfx.fillStyle(color, 0.8);
        this.imageGfx.lineStyle(3, 0xffffff, 1);
        // Triangle
        this.imageGfx.beginPath();
        this.imageGfx.moveTo(cx, cy - 40);
        this.imageGfx.lineTo(cx - 30, cy + 30);
        this.imageGfx.lineTo(cx + 30, cy + 30);
        this.imageGfx.closePath();
        this.imageGfx.fillPath();
        this.imageGfx.strokePath();
        // Glow
        this.imageGfx.lineStyle(1, color, 0.3);
        this.imageGfx.strokeCircle(cx, cy, 50);
        this.imageGfx.strokeCircle(cx, cy, 60);
        break;
    }
  }

  drawExplosion(x, y, size, color) {
    this.imageGfx.fillStyle(color, 0.6);
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const dist = size * 0.6;
      this.imageGfx.fillCircle(
        x + Math.cos(angle) * dist,
        y + Math.sin(angle) * dist,
        size * 0.3
      );
    }
    this.imageGfx.fillCircle(x, y, size * 0.4);
  }

  drawStar(x, y, size, points) {
    this.imageGfx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
      const radius = i % 2 === 0 ? size : size * 0.4;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      if (i === 0) {
        this.imageGfx.moveTo(px, py);
      } else {
        this.imageGfx.lineTo(px, py);
      }
    }
    this.imageGfx.closePath();
    this.imageGfx.fillPath();
  }

  nextPanel() {
    if (this.isTransitioning) return;
    this.showPanel(this.currentPanel + 1);
  }

  skipToGame() {
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.time.delayedCall(500, () => {
      this.scene.start("GameScene", { playerName: this.playerName });
    });
  }
}
