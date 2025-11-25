// Manages the heads-up display, score, health, and skill cooldowns.
import { COLORS } from "../consts/Colors.js";

export default class UIManager {
  constructor(scene) {
    this.scene = scene;

    // DOM Elements
    this.systemInfo = null;
    this.scoreInfo = null;
    this.roundInfo = null;
    this.roundAnnounce = null;
    this.hpInfo = null;

    this.overdriveText = null;
    this.shieldText = null;
    this.dashText = null;

    this.damageVignette = null;
    this.uiLayer = null;
    this.leftPanel = null;
    this.rightPanel = null;
    this.centerPanel = null;

    // Mouse tracking
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;
    this.smoothing = 0.1;

    // Bind the mouse move handler
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.updateParallax = this.updateParallax.bind(this);
  }

  create() {
    // Get DOM elements
    this.systemInfo = document.getElementById("system-info");
    this.scoreInfo = document.getElementById("score-info");
    this.roundInfo = document.getElementById("round-info");
    this.roundAnnounce = document.getElementById("round-announce");
    this.hpInfo = document.getElementById("hp-info");

    this.overdriveText = document.getElementById("overdrive-text");
    this.shieldText = document.getElementById("shield-text");
    this.dashText = document.getElementById("dash-text");

    this.damageVignette = document.getElementById("damage-vignette");
    this.uiLayer = document.getElementById("ui-layer");
    this.leftPanel = document.querySelector(".left-panel");
    this.rightPanel = document.querySelector(".right-panel");
    this.centerPanel = document.querySelector(".center-panel");

    // Show UI Layer
    if (this.uiLayer) {
      this.uiLayer.style.display = "flex";
    }

    // Initialize static text
    if (this.systemInfo) {
      this.systemInfo.innerText = `SYSTEM: Z8k // PILOT: ${
        this.scene.playerName || "PILOT"
      }`;
    }

    // Add mouse move listener
    document.addEventListener("mousemove", this.handleMouseMove);

    // Start parallax animation loop
    this.startParallaxLoop();
  }

  handleMouseMove(event) {
    // Normalize mouse position to -1 to 1 range
    this.targetMouseX = (event.clientX / window.innerWidth) * 2 - 1;
    this.targetMouseY = (event.clientY / window.innerHeight) * 2 - 1;
  }

  startParallaxLoop() {
    const animate = () => {
      this.updateParallax();
      this.animationFrame = requestAnimationFrame(animate);
    };
    animate();
  }

  updateParallax() {
    // Smooth interpolation
    this.mouseX += (this.targetMouseX - this.mouseX) * this.smoothing;
    this.mouseY += (this.targetMouseY - this.mouseY) * this.smoothing;

    // Apply parallax effect to left panel
    if (this.leftPanel) {
      const translateX = 20 + this.mouseX * 15;
      const translateY = this.mouseY * 10;
      const rotateY = 15 + this.mouseX * 5;
      const rotateX = -this.mouseY * 3;

      this.leftPanel.style.transform = `perspective(1000px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) translateX(${translateX}px) translateY(${translateY}px)`;
    }

    // Apply parallax effect to right panel
    if (this.rightPanel) {
      const translateX = -20 + this.mouseX * 15;
      const translateY = this.mouseY * 10;
      const rotateY = -15 + this.mouseX * 5;
      const rotateX = -this.mouseY * 3;

      this.rightPanel.style.transform = `perspective(1000px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) translateX(${translateX}px) translateY(${translateY}px)`;
    }

    // Apply subtle effect to center panel
    if (this.centerPanel) {
      const translateY = this.mouseY * 5;
      const scale = 1 + Math.abs(this.mouseY) * 0.02;

      this.centerPanel.style.transform = `translateX(-50%) translateY(${translateY}px) scale(${scale})`;
    }
  }

  triggerDamageVignette() {
    if (!this.damageVignette) return;

    this.damageVignette.style.opacity = "1";

    setTimeout(() => {
      this.damageVignette.style.opacity = "0";
    }, 100);
  }

  updateScore(score) {
    if (this.scoreInfo) this.scoreInfo.innerText = `SCORE: ${score}`;
  }

  updateHP(health, lives) {
    if (this.hpInfo) this.hpInfo.innerText = `HP: ${health}% | LIVES: ${lives}`;
  }

  setHPColor(color) {
    if (this.hpInfo) {
      if (typeof color === "number") {
      }
      color = "#" + color.toString(16).padStart(6, "0");
      this.hpInfo.style.color = color;
      this.hpInfo.style.borderColor = color;
    }
  }

  updateOverdriveStatus(text, color) {
    if (this.overdriveText) {
      this.overdriveText.innerText = text;
      if (color) {
        if (typeof color === "number")
          color = "#" + color.toString(16).padStart(6, "0");
        this.overdriveText.style.color = color;
      }
    }
  }

  updateShieldStatus(text, color) {
    if (this.shieldText) {
      this.shieldText.innerText = text;
      if (color) {
        if (typeof color === "number")
          color = "#" + color.toString(16).padStart(6, "0");
        this.shieldText.style.color = color;
      }
    }
  }

  updateDashStatus(text, color) {
    if (this.dashText) {
      this.dashText.innerText = text;
      if (color) {
        if (typeof color === "number")
          color = "#" + color.toString(16).padStart(6, "0");
        this.dashText.style.color = color;
      }
    }
  }

  updateRound(round, timeRemaining) {
    if (this.roundInfo) {
      const seconds = Math.ceil(timeRemaining / 1000);
      this.roundInfo.innerText = `ROUND: ${round} | TIME: ${seconds}`;
    }
  }

  showNextRound(round) {
    if (this.roundAnnounce) {
      this.roundAnnounce.innerText = `ROUND ${round}`;
      this.roundAnnounce.style.opacity = "1";
      this.roundAnnounce.style.transform = "translate(-50%, -50%) scale(1.2)";

      setTimeout(() => {
        this.roundAnnounce.style.opacity = "0";
        this.roundAnnounce.style.transform = "translate(-50%, -50%) scale(1)";
      }, 2000);
    }
  }

  hide() {
    const uiLayer = document.getElementById("ui-layer");
    if (uiLayer) {
      uiLayer.style.display = "none";
    }

    // Clean up event listeners and animation frame
    document.removeEventListener("mousemove", this.handleMouseMove);
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  destroy() {
    // Clean up when manager is destroyed
    document.removeEventListener("mousemove", this.handleMouseMove);
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }
}
