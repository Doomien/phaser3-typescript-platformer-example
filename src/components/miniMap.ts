import Phaser from 'phaser';
import type { MapSize } from '../types/index';
import Player from './player/player';

export default class MiniMap {
  private camera: Phaser.Cameras.Scene2D.Camera;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, map: { size: MapSize }) {
    this.camera = scene.cameras.add(x, y, width, height).setZoom(0.1).setName('mini');
    this.camera.setBackgroundColor(0x002244);
    this.camera.scrollX = map.size.width / 2;
    this.camera.scrollY = map.size.height / 2;
  }

  setIgnore(gameObjects: Phaser.GameObjects.GameObject[]) {
    this.camera.ignore(gameObjects);
  }

  update(player: Player) {
    this.camera.scrollX = player.x;
    this.camera.scrollY = player.y;
  }
}
