import Phaser from 'phaser';
import type { EntityData } from '../../types/index';
import EnemyClass from './enemyClass';

export default class SlimeSprite extends EnemyClass {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'slime');

    const data = scene.cache.json.get('slime-data') as EntityData;
    const anim = data.animation!;
    const physics = data.physics!;

    scene.anims.create({
      key: anim.key,
      frames: scene.anims.generateFrameNumbers('slime', {
        start: anim.startFrame ?? 0,
        end: anim.endFrame ?? 4,
      }),
      frameRate: anim.frameRate ?? 6,
      yoyo: anim.yoyo ?? true,
      repeat: anim.repeat ?? -1,
    });
    this.play(anim.key);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityX(physics.velocityX ?? -60);
    this.setOrigin(physics.originX ?? 0.5, physics.originY ?? 1);
    this.setScale(1);
    body.setSize(this.width - 40, this.height - 20);
    body.setOffset(20, 20);
  }

  update() { }

  kill() {
    if (this.dead) return;
    this.setFrame(5);
    this.removeEnemy();
  }
}
