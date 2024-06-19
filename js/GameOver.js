class GameOver extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOver' });
    }

    preload() {
        this.load.image('gameover_background', 'assets/gameover_background.png');
        this.load.image('restart_button', 'assets/restart_button.png');
    }

    create() {
        this.add.image(480, 320, 'gameover_background');

        const restartButton = this.add.image(480, 400, 'restart_button').setInteractive();
        restartButton.on('pointerdown', () => this.scene.start('GameScene'));

        this.add.text(480, 200, 'Game Over', { fontSize: '64px', fill: '#ffffff' }).setOrigin(0.5);
    }
}

window.GameOver = GameOver;
