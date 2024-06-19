const config = {
    type: Phaser.AUTO,
    width: 960,
    height: 640,
    backgroundColor: '#000000',
    parent: 'gameContainer',
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

// Start the MainMenu scene
game.scene.start('MainMenu');
