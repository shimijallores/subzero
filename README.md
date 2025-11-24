# ZERO-K / EPOCH ECHO

A high-speed, vector-based space shooter set in a collapsing singularity.

## 🎮 Controls

- **Movement**: `WASD` or `Arrow Keys` (Physics-based drift system)
- **Aim**: Mouse Cursor
- **Fire White**: `Left Mouse Button`
- **Fire Cyan**: `Right Mouse Button`

## ⚔️ Mechanics

### Polarity System

The core combat mechanic revolves around **Polarity Matching**.

- **White Bullets**: Effective against **White** enemies.
- **Cyan (Accent) Bullets**: Effective against **Cyan** enemies.
- **Enemies**: Most enemies will phase-shift between White and Cyan polarities. You must switch your fire mode to match their current state.

### The Void

- **Infinite Map**: The world generates endlessly around you.
- **Drift**: Your ship has inertia. Master the drift to dodge effectively.
- **Ghost**: A time-echo follows your movement, representing your past position.

## 👾 Enemies

- **Flux Strider**: Fast, triangular units that swarm the player.
- **Chrono Loomer**: Segmented entities that leave a damaging trail.
- **Void Sentinel**: Heavy, stationary turrets that require heavy damage.
- **The Negative-Space Void (Boss)**: A massive geometric anomaly housing a singularity.

## 📊 Scoring

- Destroy enemies to increase your score.
- **Flux Strider**: 100 pts
- **Chrono Loomer**: 300 pts
- **Void Sentinel**: 500 pts

## 🛠️ Technical Details

- Built with **Phaser 3** and **Vanilla JavaScript**.
- Uses **Arcade Physics** for collision and movement.
- **Procedural Generation**: Textures are generated at runtime using Phaser's Graphics API (No external image assets).
