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

    // Show UI Layer
    const uiLayer = document.getElementById("ui-layer");
    if (uiLayer) {
        uiLayer.style.display = "flex";
    }

    // Initialize static text
    if (this.systemInfo) {
        this.systemInfo.innerText = `SYSTEM: Z8k // PILOT: ${this.scene.playerName || "PILOT"}`;
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
        if (typeof color === 'number') {
            color = '#' + color.toString(16).padStart(6, '0');
        }
        this.hpInfo.style.color = color;
        this.hpInfo.style.borderColor = color;
    }
  }

  updateOverdriveStatus(text, color) {
    if (this.overdriveText) {
        this.overdriveText.innerText = text;
        if (color) {
             if (typeof color === 'number') color = '#' + color.toString(16).padStart(6, '0');
            this.overdriveText.style.color = color;
        }
    }
  }

  updateShieldStatus(text, color) {
    if (this.shieldText) {
        this.shieldText.innerText = text;
        if (color) {
             if (typeof color === 'number') color = '#' + color.toString(16).padStart(6, '0');
            this.shieldText.style.color = color;
        }
    }
  }

  updateDashStatus(text, color) {
    if (this.dashText) {
        this.dashText.innerText = text;
        if (color) {
             if (typeof color === 'number') color = '#' + color.toString(16).padStart(6, '0');
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
  }
}
