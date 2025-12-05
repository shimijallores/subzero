# SUBZERO

A high-speed, polarity-switching space shooter built with Phaser 3.

## 🎮 Controls

| Action                 | Key                    |
| ---------------------- | ---------------------- |
| Move                   | `WASD` or `Arrow Keys` |
| Aim                    | Mouse                  |
| Fire White Bullets     | `Left Click`           |
| Fire Cyan Bullets      | `Right Click`          |
| Overdrive (Rapid Fire) | `TAB`                  |
| Shield                 | `Q`                    |
| Dash                   | `E`                    |

## ⚔️ Core Mechanics

### Polarity System

- Enemies are colored either **White** or **Cyan**
- Match your bullet color to the enemy color to deal damage
- Enemies periodically swap their polarity - stay alert!

### Skills

- **Overdrive**: Rapid fire mode for 7 seconds
- **Shield**: Deflects projectiles for 5 seconds (15s cooldown)
- **Dash**: Invincible burst movement (3s cooldown)

### Roguelite Upgrades

Every 3 rounds, choose from powerful upgrades:

- **Split Cannon**: Fire 3 bullets in a spread pattern
- **Plasma Growth**: Bullets grow larger over distance
- **Rapid Fire**: Increase fire rate by 20%
- **Flame Shield**: Shield burns nearby enemies
- **Extended Shield**: Increase shield duration
- **Regeneration**: Recover HP over time

### Enemies

- **Flux Strider**: Basic enemy
- **Kamikaze**: Rushes toward the player
- **Void Sentinel**: Tanky enemy
- **Void Serpent**: Multi-segment enemy
- **Chrono Loomer**: Time-manipulating threat
- **Negative Space Void**: Dangerous void entity

### Collectibles

- **Prisms**: Collect for bonus points

## 🏆 Objective

Survive infinite waves of increasing difficulty, collect prisms, defeat enemies, and climb the leaderboard!

## 🛠️ Tech Stack

- **Phaser 3** - Game Engine
- **JavaScript (ES6+)** - Language
- **HTML5 Canvas** - Rendering

## 🚀 Getting Started

1. Clone the repository
2. Open `index.html` in a browser (or use a local server)
3. Enter your pilot name and start playing!

## 📁 Project Structure

```
src/
├── main.js              # Game entry point
├── consts/              # Game constants
├── managers/            # Game managers (UI, Spawning, etc.)
├── objects/             # Game objects (Player, Bullets, Enemies)
├── scenes/              # Phaser scenes
└── utils/               # Utility functions
```
