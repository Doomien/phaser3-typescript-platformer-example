import Phaser from 'phaser';
import type { EntityData } from '../../types/index';
import EnemyClass from './enemyClass';

export default class BeeSprite extends EnemyClass {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'bee');

    const data = scene.cache.json.get('bee-data') as EntityData;
    const anim = data.animation!;
    const physics = data.physics!;

    scene.anims.create({
      key: anim.key,
      frames: scene.anims.generateFrameNumbers('bee', {
        start: anim.startFrame ?? 0,
        end: anim.endFrame ?? 1,
      }),
      frameRate: anim.frameRate ?? 8,
      repeat: anim.repeat ?? -1,
    });
    this.play(anim.key);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityX(physics.velocityX ?? -120);
    this.setOrigin(physics.originX ?? 0.5, physics.originY ?? 1);
    body.setSize(physics.bodyWidth ?? 80, physics.bodyHeight ?? 135);
    body.setOffset((this.width - (physics.bodyWidth ?? 80)) / 2, 30);
  }

  update() { }

  kill() {
    if (this.dead) return;
    (this.body as Phaser.Physics.Arcade.Body).setSize(80, 40);
    this.setFrame(2);
    this.removeEnemy();
  }
}
