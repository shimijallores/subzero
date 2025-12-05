// Manages roguelite upgrades, showing selection UI every 3 rounds.
import { COLORS } from "../consts/Colors.js";

// Upgrade definitions
const UPGRADES = {
  // Weapon Upgrades
  splitCannon: {
    id: "splitCannon",
    name: "SPLIT CANNON",
    description: "Fire 3 bullets in a spread pattern",
    category: "weapon",
    icon: "⟨⟩",
    maxLevel: 3,
    effect: (player, level) => {
      player.upgrades.splitCannon = level;
    },
  },
  growingBullets: {
    id: "growingBullets",
    name: "PLASMA GROWTH",
    description: "Bullets grow larger over distance",
    category: "weapon",
    icon: "◉",
    maxLevel: 3,
    effect: (player, level) => {
      player.upgrades.growingBullets = level;
    },
  },
  fireRate: {
    id: "fireRate",
    name: "RAPID FIRE",
    description: "Increase fire rate by 20%",
    category: "weapon",
    icon: ">>",
    maxLevel: 5,
    effect: (player, level) => {
      player.upgrades.fireRateBonus = level * 0.2;
      player.fireRate = Math.max(
        50,
        player.baseFireRate * (1 - player.upgrades.fireRateBonus)
      );
    },
  },

  // Shield Upgrades
  flameShield: {
    id: "flameShield",
    name: "FLAME SHIELD",
    description: "Shield burns nearby enemies for 5 DPS",
    category: "shield",
    icon: "🔥",
    maxLevel: 3,
    effect: (player, level) => {
      player.upgrades.flameShield = level;
    },
  },
  shieldDuration: {
    id: "shieldDuration",
    name: "EXTENDED SHIELD",
    description: "Increase shield duration by 2s",
    category: "shield",
    icon: "⊕",
    maxLevel: 3,
    effect: (player, level) => {
      player.shield.duration = 5000 + level * 2000;
    },
  },

  // Misc Upgrades
  healthRecovery: {
    id: "healthRecovery",
    name: "REGENERATION",
    description: "Recover 1 HP every 3 seconds",
    category: "misc",
    icon: "+",
    maxLevel: 3,
    effect: (player, level) => {
      player.upgrades.healthRecovery = level;
    },
  },
  maxHealth: {
    id: "maxHealth",
    name: "REINFORCED HULL",
    description: "Increase max health by 25",
    category: "misc",
    icon: "♥",
    maxLevel: 4,
    effect: (player, level) => {
      const oldMax = player.maxHealth;
      player.maxHealth = 100 + level * 25;
      player.health += player.maxHealth - oldMax;
    },
  },
  dashCooldown: {
    id: "dashCooldown",
    name: "QUICK THRUSTERS",
    description: "Reduce dash cooldown by 0.5s",
    category: "misc",
    icon: "⇒",
    maxLevel: 4,
    effect: (player, level) => {
      player.dash.cooldown = Math.max(1000, 3000 - level * 500);
    },
  },
};

export default class UpgradeManager {
  constructor(scene) {
    this.scene = scene;
    this.upgradeModal = null;
    this.isShowingUpgrades = false;
    this.playerUpgradeLevels = {};
    this.lastUpgradeRound = 0;

    // Initialize upgrade levels
    Object.keys(UPGRADES).forEach((key) => {
      this.playerUpgradeLevels[key] = 0;
    });
  }

  create() {
    this.createUpgradeModal();
    this.upgradesList = document.getElementById("upgrades-list");
    this.updateUpgradesDisplay();
  }

  createUpgradeModal() {
    // Create modal container
    this.upgradeModal = document.createElement("div");
    this.upgradeModal.id = "upgrade-modal";
    this.upgradeModal.innerHTML = `
      <div class="upgrade-content">
        <h2 class="upgrade-title">SYSTEM UPGRADE</h2>
        <p class="upgrade-subtitle">Select an enhancement</p>
        <div class="upgrade-options"></div>
      </div>
    `;
    this.upgradeModal.style.display = "none";
    document.body.appendChild(this.upgradeModal);
  }

  shouldShowUpgrades(round) {
    // Show upgrades every 3 rounds, starting from round 3
    return round >= 1 && round % 1 === 0 && round !== this.lastUpgradeRound;
  }

  showUpgradeSelection() {
    if (this.isShowingUpgrades) return;

    this.isShowingUpgrades = true;
    this.lastUpgradeRound = this.scene.spawnManager.currentRound;

    // Pause game
    this.scene.physics.pause();
    this.scene.spawnManager.roundTimer = this.scene.spawnManager.roundDuration;

    // Get random upgrades (3 options)
    const availableUpgrades = this.getAvailableUpgrades();
    const selectedUpgrades = this.getRandomUpgrades(availableUpgrades, 3);

    // Build UI
    const optionsContainer =
      this.upgradeModal.querySelector(".upgrade-options");
    optionsContainer.innerHTML = "";

    selectedUpgrades.forEach((upgrade) => {
      const currentLevel = this.playerUpgradeLevels[upgrade.id];
      const nextLevel = currentLevel + 1;

      const card = document.createElement("div");
      card.className = "upgrade-card";
      card.innerHTML = `
        <div class="upgrade-icon">${upgrade.icon}</div>
        <div class="upgrade-name">${upgrade.name}</div>
        <div class="upgrade-desc">${upgrade.description}</div>
        <div class="upgrade-level">LVL ${nextLevel}/${upgrade.maxLevel}</div>
      `;

      card.addEventListener("click", () => this.selectUpgrade(upgrade));
      optionsContainer.appendChild(card);
    });

    // Show modal
    this.upgradeModal.style.display = "flex";
  }

  getAvailableUpgrades() {
    return Object.values(UPGRADES).filter((upgrade) => {
      return this.playerUpgradeLevels[upgrade.id] < upgrade.maxLevel;
    });
  }

  getRandomUpgrades(upgrades, count) {
    const shuffled = [...upgrades].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  selectUpgrade(upgrade) {
    // Apply upgrade
    this.playerUpgradeLevels[upgrade.id]++;
    const newLevel = this.playerUpgradeLevels[upgrade.id];

    // Execute upgrade effect
    upgrade.effect(this.scene.player, newLevel);

    // Evolve player shape (add one side)
    this.scene.player.evolveShape();

    // Update upgrades display
    this.updateUpgradesDisplay();

    // Hide modal
    this.upgradeModal.style.display = "none";
    this.isShowingUpgrades = false;

    // Resume game
    this.scene.physics.resume();

    // Flash effect
    this.scene.cameras.main.flash(200, 0, 255, 255);
  }

  updateUpgradesDisplay() {
    if (!this.upgradesList) return;

    // Clear current list
    this.upgradesList.innerHTML = "";

    // Get all upgrades with level > 0
    const activeUpgrades = Object.entries(this.playerUpgradeLevels)
      .filter(([id, level]) => level > 0)
      .map(([id, level]) => ({
        ...UPGRADES[id],
        currentLevel: level,
      }));

    if (activeUpgrades.length === 0) {
      this.upgradesList.innerHTML =
        '<div style="color: #666; font-size: 11px;">No upgrades yet</div>';
      return;
    }

    // Create upgrade items
    activeUpgrades.forEach((upgrade) => {
      const item = document.createElement("div");
      item.className = `upgrade-item ${upgrade.category}`;
      item.innerHTML = `
        <span class="upgrade-item-icon">${upgrade.icon}</span>
        <span class="upgrade-item-name">${upgrade.name}</span>
        <span class="upgrade-item-level">${upgrade.currentLevel}/${upgrade.maxLevel}</span>
      `;
      this.upgradesList.appendChild(item);
    });
  }

  update(time, delta) {
    const player = this.scene.player;

    // Handle health recovery upgrade
    if (player.upgrades.healthRecovery > 0) {
      if (!this.lastRegenTime) this.lastRegenTime = time;

      if (time - this.lastRegenTime > 3000) {
        this.lastRegenTime = time;
        const regenAmount = player.upgrades.healthRecovery;
        player.health = Math.min(player.maxHealth, player.health + regenAmount);
      }
    }

    // Handle flame shield damage to nearby enemies
    if (player.upgrades.flameShield > 0 && player.shield.active) {
      const flameDamage = 5 * player.upgrades.flameShield; // 5/10/15 DPS based on level
      const flameRadius = 60; // Radius of flame effect

      // Damage enemies in range
      this.scene.enemies.getChildren().forEach((enemy) => {
        if (!enemy.active) return;

        const distance = Phaser.Math.Distance.Between(
          player.x,
          player.y,
          enemy.x,
          enemy.y
        );

        if (distance < flameRadius) {
          // Apply damage over time (scaled by delta)
          const damageThisTick = (flameDamage * delta) / 1000;

          if (enemy.health) {
            enemy.health -= damageThisTick;
            enemy.setTint(COLORS.RED);
            if (enemy.health <= 0) {
              this.scene.addScore(enemy.scoreValue || 100);
              enemy.destroy();
            }
          } else {
            // For enemies without health, track accumulated damage
            if (!enemy.flameDamageAccum) enemy.flameDamageAccum = 0;
            enemy.flameDamageAccum += damageThisTick;

            if (enemy.flameDamageAccum >= 20) {
              this.scene.addScore(enemy.scoreValue || 100);
              enemy.destroy();
            } else {
              enemy.setTint(COLORS.RED);
            }
          }
        }
      });

      // Also damage meteors
      this.scene.meteors.getChildren().forEach((meteor) => {
        if (!meteor.active) return;

        const distance = Phaser.Math.Distance.Between(
          player.x,
          player.y,
          meteor.x,
          meteor.y
        );

        if (distance < flameRadius) {
          const damageThisTick = (flameDamage * delta) / 1000;
          if (!meteor.flameDamageAccum) meteor.flameDamageAccum = 0;
          meteor.flameDamageAccum += damageThisTick;

          if (meteor.flameDamageAccum >= 10) {
            this.scene.addScore(meteor.scoreValue || 50);
            meteor.destroy();
          } else {
            meteor.setTint(COLORS.RED);
          }
        }
      });
    }
  }

  destroy() {
    if (this.upgradeModal && this.upgradeModal.parentNode) {
      this.upgradeModal.parentNode.removeChild(this.upgradeModal);
    }
  }
}

export { UPGRADES };
