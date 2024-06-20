class MainMenu extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenu' });
    }

    preload() {
        this.load.image('menu_background', 'assets/menu_background.png');
        this.load.audio('start_sound', 'assets/horror-background-atmosphere.mp3');
        this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
    }

    create() {
        const { width, height } = this.sys.game.canvas;

        WebFont.load({
            google: {
                families: ['Creepster']
            },
            active: () => {
                const background = this.add.image(width / 2, height / 2, 'menu_background');
                background.setDisplaySize(width, height);
            
                const title = this.add.text(width / 2, height / 2 - 125, 'Behind You', {
                    fontFamily: 'Creepster',
                    fontSize: '120px',
                    fill: '#CD853F'
                }).setOrigin(0.5);
            
                const playButtonX = width / 2 - 232;
                const instructionsButtonX = width / 2 + 232;
                const buttonY = height / 2 + 145;

                const playButton = this.add.text(playButtonX, buttonY, 'Play', {
                    fontFamily: 'Creepster',
                    fontSize: '64px',
                    fill: '#CD853F'
                }).setOrigin(0.5).setInteractive();
                playButton.on('pointerover', () => playButton.setScale(1.1));
                playButton.on('pointerout', () => playButton.setScale(1));
                playButton.on('pointerdown', () => {
                    let backgroundSound = this.sound.add('start_sound', { loop: true });
                    backgroundSound.play();
                    this.scene.start('GameScene', { backgroundSound: backgroundSound });
                });

                const instructionsButton = this.add.text(instructionsButtonX, buttonY, 'Instructions', {
                    fontFamily: 'Creepster',
                    fontSize: '50px',
                    fill: '#CD853F'
                }).setOrigin(0.5).setInteractive();
                instructionsButton.on('pointerover', () => instructionsButton.setScale(1.1));
                instructionsButton.on('pointerout', () => instructionsButton.setScale(1));
                instructionsButton.on('pointerdown', () => {
                    this.scene.start('InstructionsScene');
                });
            }
        });
    }

    shutdown() {
        this.sound.stopAll();
    }
}

window.MainMenu = MainMenu;
