import Phaser from 'phaser';

export default class PhaserVersionText extends Phaser.GameObjects.Text {
  constructor(scene: Phaser.Scene, x: number, y: number, text: string) {
    super(scene, x, y, text, {
      color: '#000000',
      fontSize: '24px',
    });
    scene.add.existing(this);
    this.setOrigin(1, 0).setScrollFactor(0);
  }
}
