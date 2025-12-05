# AI Coding Guidelines for SUBZERO

## Project Overview

SUBZERO is a Phaser 3 space shooter with polarity-switching mechanics, infinite survival rounds, and skill-based combat. Built with vanilla JavaScript using ES6 modules.

## Architecture

- **Scenes**: `MainMenuScene`, `GameScene` (core gameplay loop), `GameOverScene`. Scenes manage game states and initialize components.
- **Managers**: `BackgroundManager`, `UIManager`, `SpawnManager`, `ScoreManager`. Encapsulate subsystems; instantiated in `GameScene` with scene reference.
- **Objects**: `Player`, `Bullet`, enemies (e.g., `FluxStrider`), `Meteor`, `Prism`. Extend Phaser.GameObjects; use groups for physics.
- **Data Flow**: Player input → `Player.update()` → collision handlers → `Managers.update()` → DOM UI updates.

## Key Patterns

- **Phaser Groups**: Use `this.physics.add.group({ classType: EnemyClass, runChildUpdate: true })` for batched physics objects.
- **Manager Pattern**: Managers access scene properties (e.g., `this.scene.player`); update in scene's `update()` method.
- **Skill System**: In `Player.js`, skills use state objects with `active`, `ready`, `timer` for duration/cooldown. Example: `this.overdrive = { active: false, ready: true, timer: 0, duration: 7000 }`.
- **Polarity Mechanics**: Bullets/enemies have color properties; collisions check color matching for damage (see `Bullet.js` and enemy classes).
- **Round Progression**: `SpawnManager` scales difficulty via `enemyCap` and `meteorCap` increases.

## Workflows

- **Running the Game**: Open `index.html` in a browser. Phaser loads from CDN; no build step.
- **Debugging**: Enable physics debug in `src/main.js`: set `arcade: { debug: true }` in config.
- **Adding Enemies**: Create class in `src/objects/enemies/`, extend `BaseEnemy`, import in `SpawnManager.js`, add to `nextRound()` spawning logic.
- **Modifying UI**: Update DOM elements in `UIManager.js` or `index.html`; use `document.getElementById()` for dynamic text.
- **Sound Effects**: Load in scene `preload()`, play with `this.sound.play(key, { volume: 0.3 })`.

## Examples

- **New Skill**: Mirror `setupOverdrive()` in `Player.js`: add state object, key listener, timer logic in `handleSkills()`.
- **Enemy Behavior**: See `FluxStrider.js` for movement patterns; override `update()` for custom AI.
- **Collisions**: In `GameScene.js` `setupCollisions()`, use `this.physics.add.collider(group1, group2, callback)`.

Reference `src/scenes/GameScene.js` for initialization, `src/objects/Player.js` for mechanics, `src/managers/SpawnManager.js` for spawning.
