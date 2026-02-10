import Phaser from 'phaser';
import type { EntityData } from '../types/index';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    // Static images
    const images = ['tile-left', 'tile-middle', 'tile-right', 'tile-single', 'controls', 'background', 'goal'];
    images.forEach((img) => {
      this.load.image(img, `assets/img/${img}.png`);
    });

    // Sprite sheets
    this.load.spritesheet('player', 'assets/img/player.png', { frameHeight: 165, frameWidth: 120 });
    this.load.spritesheet('coin', 'assets/img/coin.png', { frameHeight: 42, frameWidth: 42 });
    this.load.spritesheet('bee', 'assets/img/bee.png', { frameHeight: 100, frameWidth: 128 });
    this.load.spritesheet('slime', 'assets/img/slime.png', { frameHeight: 68, frameWidth: 112 });

    // Entity data JSONs
    this.load.json('player-data', 'data/entities/player.json');
    this.load.json('bee-data', 'data/entities/bee.json');
    this.load.json('slime-data', 'data/entities/slime.json');
    this.load.json('coin-data', 'data/entities/coin.json');
    this.load.json('goal-data', 'data/entities/goal.json');

    // SketchPadSurvivors pack & registry
    this.load.pack('sps-pack', 'data/entities/sps/pack.json');
    this.load.json('sps-registry', 'data/entities/sps/registry.json');
  }

  create() {
    // Generate individual entity animations for SPS characters
    const registry = this.cache.json.get('sps-registry') as string[];
    if (registry) {
      registry.forEach(id => {
        const data = this.cache.json.get(`${id}-data`) as EntityData;
        if (data && data.animation && data.animation.frames) {
          this.anims.create({
            key: `${id}-${data.animation.key}`,
            frames: data.animation.frames.map(frameKey => ({ key: frameKey })),
            frameRate: data.animation.frameRate ?? 8,
            repeat: data.animation.repeat ?? -1
          });
        }
      });
    }

    this.scene.start('MainScene');
  }
}
