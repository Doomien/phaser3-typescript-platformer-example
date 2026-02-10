import Phaser from 'phaser';
import EnemyClass from './enemyClass';
import type { EntityData } from '../../types/index';

export default class SPSEnemy extends EnemyClass {
    constructor(scene: Phaser.Scene, x: number, y: number, id: string) {
        const data = scene.cache.json.get(`${id}-data`) as EntityData;
        // SPS entities use individual frame keys, start with the first one
        super(scene, x, y, `${id}-1`);

        const physics = data.physics || {};
        const body = this.body as Phaser.Physics.Arcade.Body;

        body.setSize(physics.bodyWidth || 60, physics.bodyHeight || 60);
        body.setVelocityX(physics.velocityX || -100);

        // Play animation if it exists
        if (data.animation) {
            this.play(`${id}-${data.animation.key}`);
        }
    }
}
