import Phaser from 'phaser';
import Controls from '../controls/controls';
import type { EntityData } from '../../types/index';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  private _dead: boolean = false;
  private _halt: boolean = false;
  private mapSize: { x: number; y: number; width: number; height: number };
  private entityData: EntityData;

  constructor(
    scene: Phaser.Scene,
    player: { x: number; y: number; texture: string },
    mapSize: { x: number; y: number; width: number; height: number },
    _level: number
  ) {
    super(scene, player.x, player.y, player.texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.scene = scene;
    this.mapSize = mapSize;

    // Load data-driven properties
    this.entityData = this.scene.cache.json.get('player-data') as EntityData;
    const physics = this.entityData.physics!;

    // Player animation from sprite sheet
    scene.anims.create({
      key: 'walk',
      frames: scene.anims.generateFrameNames('player'),
      frameRate: this.entityData.animation?.frameRate ?? 8,
      repeat: this.entityData.animation?.repeat ?? -1,
    });
    this.play('walk');

    this.setOrigin(0, 1);
    this.setDragX(physics.dragX ?? 1500);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(physics.bodyWidth ?? 70, physics.bodyHeight ?? 132);
    body.setOffset(physics.bodyOffsetX ?? 25, physics.bodyOffsetY ?? 24);
  }

  kill() {
    this._dead = true;
    this.scene.cameras.main.shake(500, 0.025);
    this.scene.time.addEvent({
      delay: 500,
      callback: () => this.scene.scene.restart(),
    });
  }

  killEnemy() {
    const props = this.entityData.properties as Record<string, number>;
    this.setVelocityY(props.bounceVelocity ?? -600);
  }

  halt() {
    (this.body as Phaser.Physics.Arcade.Body).enable = false;
    this._halt = true;
  }

  update(cursors: Phaser.Types.Input.Keyboard.CursorKeys, controls: Controls) {
    if (this._halt || this._dead) return;

    const body = this.body as Phaser.Physics.Arcade.Body;
    const props = this.entityData.properties as Record<string, number>;

    // Check if out of map bounds
    if (body.right < this.mapSize.x || body.left > this.mapSize.width || body.top > this.mapSize.height) {
      this.kill();
    }

    // Controls left & right
    if (cursors.left.isDown || controls.leftIsDown) {
      this.setVelocityX(-(props.speed ?? 500));
      this.setFlipX(true);
    } else if (cursors.right.isDown || controls.rightIsDown) {
      this.setVelocityX(props.runSpeed ?? 550);
      this.setFlipX(false);
    }

    // Controls up
    if ((cursors.up.isDown || cursors.space!.isDown || controls.upIsDown) && body.blocked.down) {
      this.setVelocityY(props.jumpVelocity ?? -1250);
    }
  }
}
