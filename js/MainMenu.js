class MainMenu extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenu' });
    }

    preload() {
        this.load.image('menu_background', 'assets/menu_background.png');
        this.load.image('play_button', 'assets/play_button.png');
    }

    create() {
        const { width, height } = this.sys.game.canvas;

        const background = this.add.image(width / 2, height / 2, 'menu_background');

        const desiredWidth = width;
        const desiredHeight = height;

        background.setDisplaySize(desiredWidth, desiredHeight);

        const title = this.add.text(width / 2, height / 2 - 115, 'Behind You', { fontSize: '64px', fill: '#CD853F' }).setOrigin(0.5);

        const playButton = this.add.image(width / 2, height / 2 + 100, 'play_button').setInteractive().setScale(0.5);
        playButton.on('pointerover', () => playButton.setScale(0.6));
        playButton.on('pointerout', () => playButton.setScale(0.5));
        playButton.on('pointerdown', () => this.scene.start('GameScene'));
    }
}

window.MainMenu = MainMenu;
