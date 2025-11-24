import { COLORS } from "../consts/Colors.js";

export default class TextureGenerator {
  constructor(scene) {
    this.scene = scene;
  }

  generate() {
    // Bullet Texture (Laser-like)
    const bulletGfx = this.scene.make.graphics({ x: 0, y: 0, add: false });
    bulletGfx.fillStyle(0xffffff);
    bulletGfx.fillRect(0, 0, 24, 4); // Long and thin
    bulletGfx.generateTexture("bullet", 24, 4);

    // Prism Texture (Diamond)
    const prismGfx = this.scene.make.graphics({ x: 0, y: 0, add: false });
    prismGfx.lineStyle(2, 0xffffff);
    prismGfx.strokeRect(0, 0, 32, 32);
    prismGfx.generateTexture("prism", 32, 32);

    // Particle Texture (Soft Glow)
    const particleGfx = this.scene.make.graphics({ x: 0, y: 0, add: false });
    particleGfx.fillStyle(COLORS.WHITE);
    particleGfx.fillCircle(4, 4, 4);
    particleGfx.generateTexture("particle", 8, 8);

    // Flux Strider Texture (Triangle Cluster)
    const fluxGfx = this.scene.make.graphics({ x: 0, y: 0, add: false });
    fluxGfx.lineStyle(2, 0xffffff);
    fluxGfx.strokeTriangle(0, 20, 10, 0, 20, 20);
    fluxGfx.strokeTriangle(10, 20, 20, 0, 30, 20);
    fluxGfx.generateTexture("flux-strider", 32, 32);

    // Chrono Loomer Texture (Segmented)
    const chronoGfx = this.scene.make.graphics({ x: 0, y: 0, add: false });
    chronoGfx.lineStyle(2, 0xffffff);
    chronoGfx.strokeCircle(16, 16, 14);
    chronoGfx.strokeRect(10, 10, 12, 12);
    chronoGfx.generateTexture("chrono-loomer", 32, 32);

    // Void Sentinel Texture (Large Hollow)
    const voidGfx = this.scene.make.graphics({ x: 0, y: 0, add: false });
    voidGfx.lineStyle(4, 0xffffff);
    voidGfx.strokeRect(0, 0, 64, 64);
    voidGfx.lineStyle(2, 0xffffff);
    voidGfx.strokeRect(16, 16, 32, 32);
    voidGfx.generateTexture("void-sentinel", 64, 64);

    // Negative Space Void (Boss) - Icosahedron-ish
    const bossGfx = this.scene.make.graphics({ x: 0, y: 0, add: false });
    bossGfx.lineStyle(4, 0xffffff);
    // Outer Hexagon
    bossGfx.strokePoints(
      [
        { x: 64, y: 0 },
        { x: 120, y: 32 },
        { x: 120, y: 96 },
        { x: 64, y: 128 },
        { x: 8, y: 96 },
        { x: 8, y: 32 },
        { x: 64, y: 0 },
      ],
      true
    );
    // Inner connections
    bossGfx.lineStyle(2, COLORS.ACCENT);
    bossGfx.strokeCircle(64, 64, 30);
    bossGfx.generateTexture("negative-space-void", 128, 128);

    // Meteor Texture (Jagged Rock)
    const meteorGfx = this.scene.make.graphics({ x: 0, y: 0, add: false });
    meteorGfx.lineStyle(2, 0x888888);
    meteorGfx.strokePoints(
      [
        { x: 16, y: 0 },
        { x: 32, y: 10 },
        { x: 24, y: 28 },
        { x: 8, y: 32 },
        { x: 0, y: 16 },
        { x: 16, y: 0 },
      ],
      true
    );
    meteorGfx.generateTexture("meteor", 32, 32);

    // Star Texture
    const starGfx = this.scene.make.graphics({ x: 0, y: 0, add: false });
    starGfx.fillStyle(0xffffff);
    starGfx.fillCircle(1, 1, 1);
    starGfx.generateTexture("star", 2, 2);

    // UI Icons
    // Overdrive (Square)
    const odIcon = this.scene.make.graphics({ x: 0, y: 0, add: false });
    odIcon.lineStyle(2, COLORS.RED);
    odIcon.strokeRect(4, 4, 24, 24);
    odIcon.fillStyle(COLORS.RED, 0.5);
    odIcon.fillRect(4, 4, 24, 24);
    odIcon.generateTexture("icon-overdrive", 32, 32);

    // Shield (Circle)
    const shieldIcon = this.scene.make.graphics({ x: 0, y: 0, add: false });
    shieldIcon.lineStyle(2, COLORS.ACCENT);
    shieldIcon.strokeCircle(16, 16, 12);
    shieldIcon.fillStyle(COLORS.ACCENT, 0.5);
    shieldIcon.fillCircle(16, 16, 12);
    shieldIcon.generateTexture("icon-shield", 32, 32);

    // Dash (Triangle)
    const dashIcon = this.scene.make.graphics({ x: 0, y: 0, add: false });
    dashIcon.lineStyle(2, COLORS.WHITE);
    dashIcon.strokeTriangle(16, 4, 28, 28, 4, 28);
    dashIcon.fillStyle(COLORS.WHITE, 0.5);
    dashIcon.fillTriangle(16, 4, 28, 28, 4, 28);
    dashIcon.generateTexture("icon-dash", 32, 32);

    // Vignette Texture (Red Gradient)
    if (!this.scene.textures.exists("vignette")) {
      const width = this.scene.scale.width;
      const height = this.scene.scale.height;
      const texture = this.scene.textures.createCanvas(
        "vignette",
        width,
        height
      );
      const ctx = texture.getContext();
      const grd = ctx.createRadialGradient(
        width / 2,
        height / 2,
        width * 0.3,
        width / 2,
        height / 2,
        width * 0.8
      );
      grd.addColorStop(0, "rgba(255, 0, 0, 0)");
      grd.addColorStop(1, "rgba(255, 0, 0, 0.6)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, width, height);
      texture.refresh();
    }
  }
}
