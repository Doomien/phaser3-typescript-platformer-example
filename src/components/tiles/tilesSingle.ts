import Phaser from 'phaser';

export default class TilesSingle extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);

    this.setOrigin(0, 0);

    scene.add.existing(this);
    scene.physics.add.existing(this, true);

    // Allow the player to jump through a tile from below
    const body = this.body as Phaser.Physics.Arcade.StaticBody;
    body.checkCollision.down = false;
    body.checkCollision.right = false;
    body.checkCollision.left = false;
  }
}
