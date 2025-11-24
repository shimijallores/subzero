import { COLORS } from "../consts/Colors.js";

export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super("MainMenuScene");
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    // Background
    this.cameras.main.setBackgroundColor(COLORS.BLACK);

    // Starfield effect (simplified)
    const starGfx = this.make.graphics({ x: 0, y: 0, add: false });
    starGfx.fillStyle(0xffffff);
    starGfx.fillCircle(1, 1, 1);
    starGfx.generateTexture("star_menu", 2, 2);

    this.add.particles(0, 0, "star_menu", {
      x: { min: 0, max: width },
      y: { min: 0, max: height },
      quantity: 100,
      lifespan: 2000,
      alpha: { start: 0.5, end: 0 },
      scale: { min: 0.5, max: 1.5 },
      frequency: 100,
    });

    // Title
    const title = this.add
      .text(width / 2, height / 3 - 50, "SUBZERO", {
        fontFamily: "Courier New, monospace",
        fontSize: "84px",
        color: COLORS.ACCENT_STRING,
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Glitch effect for title
    this.tweens.add({
      targets: title,
      alpha: 0.8,
      x: "+=2",
      y: "+=2",
      duration: 50,
      yoyo: true,
      repeat: -1,
      repeatDelay: 2000,
    });

    // Name Input
    // Using DOM element for input
    this.nameInput = this.add.dom(width / 2, height / 2).createFromHTML(`
        <input type="text" name="nameField" placeholder="ENTER PILOT NAME" 
        style="font-family: 'Courier New', monospace; font-size: 24px; color: #00ffff; 
        background-color: #000000; border: 2px solid #00ffff; padding: 10px; 
        text-align: center; width: 300px; outline: none;">
    `);
    this.nameInput.addListener("keydown");
    this.nameInput.on("keydown", (event) => {
      if (event.key === "Enter") {
        this.startGame();
      }
    });

    // Start Button
    const startBtn = this.add
      .text(width / 2, height / 2 + 80, "[ INITIATE SEQUENCE ]", {
        fontFamily: "Courier New, monospace",
        fontSize: "28px",
        color: COLORS.WHITE_STRING,
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    startBtn.on("pointerover", () => startBtn.setColor(COLORS.ACCENT_STRING));
    startBtn.on("pointerout", () => startBtn.setColor(COLORS.WHITE_STRING));
    startBtn.on("pointerdown", () => this.startGame());

    // Instructions Button
    const instrBtn = this.add
      .text(width / 2, height / 2 + 140, "[ MISSION BRIEFING ]", {
        fontFamily: "Courier New, monospace",
        fontSize: "24px",
        color: COLORS.WHITE_STRING,
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    instrBtn.on("pointerover", () => instrBtn.setColor(COLORS.ACCENT_STRING));
    instrBtn.on("pointerout", () => instrBtn.setColor(COLORS.WHITE_STRING));
    instrBtn.on("pointerdown", () => this.toggleInstructions(true));

    // Instructions Panel (Hidden by default)
    this.createInstructionsPanel(width, height);
  }

  createInstructionsPanel(width, height) {
    this.instrContainer = this.add
      .container(0, 0)
      .setVisible(false)
      .setDepth(100);

    // Dark overlay
    const bg = this.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0x000000,
      0.9
    );

    const title = this.add
      .text(width / 2, 100, "MISSION BRIEFING", {
        fontFamily: "Courier New, monospace",
        fontSize: "32px",
        color: COLORS.ACCENT_STRING,
      })
      .setOrigin(0.5);

    const content = `
      CONTROLS:
      [W,A,S,D] or [ARROWS] - Thrusters
      [MOUSE] - Aim
      [L-CLICK] - Fire Polarity A (White)
      [R-CLICK] - Fire Polarity B (Cyan)
      
      SKILLS:
      [TAB] - Overdrive (Rapid Fire)
      [Q] - Shield (Deflect)
      [E] - Dash (Evasive Maneuver)
      
      OBJECTIVE:
      Survive the void. 
      Match bullet polarity to enemies to destroy them.
      Avoid meteors and enemy fire.
      `;

    const text = this.add
      .text(width / 2 - 20, height / 2, content, {
        fontFamily: "Courier New, monospace",
        fontSize: "18px",
        color: COLORS.WHITE_STRING,
        align: "center",
        lineSpacing: 8,
      })
      .setOrigin(0.5);

    const closeBtn = this.add
      .text(width / 2, height - 100, "[ CLOSE ]", {
        fontFamily: "Courier New, monospace",
        fontSize: "24px",
        color: COLORS.RED_STRING,
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    closeBtn.on("pointerdown", () => this.toggleInstructions(false));
    closeBtn.on("pointerover", () => closeBtn.setColor(COLORS.WHITE_STRING));
    closeBtn.on("pointerout", () => closeBtn.setColor(COLORS.RED_STRING));

    this.instrContainer.add([bg, title, text, closeBtn]);
  }

  toggleInstructions(show) {
    this.instrContainer.setVisible(show);
    if (show) {
      this.nameInput.setVisible(false);
    } else {
      this.nameInput.setVisible(true);
    }
  }

  startGame() {
    const nameElement = this.nameInput.getChildByName("nameField");
    const name = nameElement.value.trim() || "PILOT";
    this.scene.start("GameScene", { playerName: name });
  }
}
