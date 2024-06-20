import Phaser from 'phaser';
import MainMenu from './MainMenu';
import GameScene from './GameScene.js';
import GameOver from './GameOver.js';

const config = {
    type: Phaser.AUTO,
    width: 960,
    height: 640,
    backgroundColor: '#000000',  // Dark background color for night environment
    parent: 'game-container',                                
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: [MainMenu, GameScene, GameOver],
    callbacks: {
        postBoot: function (game) {
            game.canvas.style.cursor = 'none';
        }
    }
};

const game = new Phaser.Game(config);

game.scene.start('MainMenu');