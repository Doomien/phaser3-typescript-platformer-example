import Phaser from 'phaser';
import PreloadScene from './scenes/preloadScene';
import MainScene from './scenes/mainScene';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'phaser-game',
    backgroundColor: '#ade6ff',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 2500 },
            debug: false,
        },
    },
    scene: [PreloadScene, MainScene],
};

new Phaser.Game(config);
