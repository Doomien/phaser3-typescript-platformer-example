import Phaser from 'phaser';
import BeeSprite from './bee';
import SlimeSprite from './slime';
import SPSEnemy from './spsEnemy';
import type { TilesConfig } from '../../types/index';

export default class EnemiesGroup extends Phaser.GameObjects.Group {
  tiles: TilesConfig[];
  TILE_SIZE = 96;

  constructor(scene: Phaser.Scene, tilesConfig: TilesConfig[]) {
    super(scene);

    this.tiles = tilesConfig.filter((tile) => tile.type === 'tile');
    const enemyTypes = tilesConfig.filter((tile) => tile.type === 'enemy');

    const enemies: Array<BeeSprite | SlimeSprite | SPSEnemy> = [];
    enemyTypes.forEach((enemy) => {
      switch (enemy.texture) {
        case 'bee':
          enemies.push(new BeeSprite(scene, enemy.x, enemy.y));
          break;
        case 'slime':
          enemies.push(new SlimeSprite(scene, enemy.x, enemy.y));
          break;
        default:
          // Check if it's an SPS entity (texture name contains a dash)
          if (enemy.texture.includes('-')) {
            enemies.push(new SPSEnemy(scene, enemy.x, enemy.y, enemy.texture));
          }
          break;
      }
    });
    this.addMultiple(enemies);
  }

  update() {
    this.children.iterate((child) => {
      const enemy = child as BeeSprite | SlimeSprite | SPSEnemy;
      if (enemy.dead) return true;

      const body = enemy.body as Phaser.Physics.Arcade.Body;
      const enemyIsMovingRight = body.velocity.x >= 0;

      const hasGroundDetection = this.tiles.filter((tile) => {
        const enemyPositionX = enemyIsMovingRight ? body.right : body.left;
        const x = enemyPositionX + 32 > tile.x && enemyPositionX - 32 < tile.x + this.TILE_SIZE;
        const y = body.bottom + this.TILE_SIZE / 2 > tile.y && body.bottom + this.TILE_SIZE / 2 < tile.y + this.TILE_SIZE;
        return x && y;
      });

      if (hasGroundDetection.length === 0) {
        body.setVelocityX(body.velocity.x * -1);
        enemy.setFlipX(!enemyIsMovingRight);
      }
      return true;
    });
  }
}
