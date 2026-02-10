import Phaser from 'phaser';

export default class LevelText extends Phaser.GameObjects.Text {
  constructor(scene: Phaser.Scene, level: number) {
    super(scene, 0, 0, `Level ${level + 1}`, {
      color: '#000000',
      fontSize: '48px',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    });
    scene.add.existing(this);
    this.setScrollFactor(0);
    this.setOrigin(0.5, 0);
    this.adjustPosition();
  }

  adjustPosition() {
    this.x = this.scene.cameras.main.width / 2;
    this.y = 20;
  }
}
