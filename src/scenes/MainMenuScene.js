// Scene for the main menu, name input, and leaderboard.
import { COLORS } from "../consts/Colors.js";
import ScoreManager from "../managers/ScoreManager.js";

export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super("MainMenuScene");
  }

  preload() {
    this.load.audio("background", "assets/sounds/background.mp3");
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    // Background Music
    if (!this.sound.get("background")) {
      this.sound.add("background", { volume: 0.5, loop: true }).play();
    } else if (!this.sound.get("background").isPlaying) {
      this.sound.get("background").play();
    }

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
        fontFamily: "'Space Nova', 'Courier New', monospace",
        fontSize: "164px",
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
        background-color: #000000; border: 2px solid #00ffff; padding: 5px; 
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

    // Leaderboard Button
    const leaderBtn = this.add
      .text(width / 2, height / 2 + 200, "[ HALL OF FAME ]", {
        fontFamily: "Courier New, monospace",
        fontSize: "24px",
        color: COLORS.WHITE_STRING,
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    leaderBtn.on("pointerover", () => leaderBtn.setColor(COLORS.ACCENT_STRING));
    leaderBtn.on("pointerout", () => leaderBtn.setColor(COLORS.WHITE_STRING));
    leaderBtn.on("pointerdown", () => this.toggleLeaderboard(true));

    // Instructions Panel (Hidden by default)
    this.createInstructionsPanel(width, height);

    // Leaderboard Panel (Hidden by default)
    this.createLeaderboardPanel(width, height);
  }

  createLeaderboardPanel(width, height) {
    this.leaderContainer = this.add
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
      .text(width / 2, 100, "HALL OF FAME", {
        fontFamily: "Courier New, monospace",
        fontSize: "32px",
        color: COLORS.ACCENT_STRING,
      })
      .setOrigin(0.5);

    // Get scores
    const scoreManager = new ScoreManager();
    const scores = scoreManager.getHighScores();

    let content = "";
    if (scores.length === 0) {
      content = "NO DATA FOUND";
    } else {
      scores.forEach((entry, index) => {
        content += `${index + 1}. ${entry.name} - ${entry.score}\n`;
      });
    }

    const text = this.add
      .text(width / 2, height / 2, content, {
        fontFamily: "Courier New, monospace",
        fontSize: "24px",
        color: COLORS.WHITE_STRING,
        align: "center",
        lineSpacing: 10,
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

    closeBtn.on("pointerdown", () => this.toggleLeaderboard(false));
    closeBtn.on("pointerover", () => closeBtn.setColor(COLORS.WHITE_STRING));
    closeBtn.on("pointerout", () => closeBtn.setColor(COLORS.RED_STRING));

    this.leaderContainer.add([bg, title, text, closeBtn]);
  }

  toggleLeaderboard(show) {
    this.leaderContainer.setVisible(show);
    if (show) {
      this.nameInput.setVisible(false);
    } else {
      this.nameInput.setVisible(true);
    }
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
