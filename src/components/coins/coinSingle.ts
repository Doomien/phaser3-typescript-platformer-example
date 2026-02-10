import Phaser from 'phaser';
import type { EntityData, TilesConfig } from '../../types/index';

export default class CoinSingle extends Phaser.Physics.Arcade.Sprite {
  private collecting: boolean = false;

  constructor(scene: Phaser.Scene, config: TilesConfig) {
    super(scene, config.x + 48, config.y + 48, config.texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const data = scene.cache.json.get('coin-data') as EntityData;
    const anim = data.animation;

    this.setImmovable();
    this.setScale(1.5);
    (this.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);

    scene.anims.create({
      key: anim?.key ?? 'spin',
      frames: scene.anims.generateFrameNames('coin'),
      frameRate: anim?.frameRate ?? 16,
      repeat: anim?.repeat ?? -1,
    });
    this.play(anim?.key ?? 'spin');
  }

  collect() {
    if (this.collecting) return;
    this.collecting = true;
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      y: this.y - 100,
      duration: 500,
      ease: 'Power2',
      onComplete: () => { this.destroy(); },
    });
  }
}
