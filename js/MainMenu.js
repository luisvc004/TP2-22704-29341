class MainMenu extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenu' });
    }

    preload() {
        this.load.image('menu_background', 'assets/menu_background.png');
        this.load.image('play_button', 'assets/play_button.png');
        this.load.audio('start_sound', 'assets/horror-background-atmosphere.mp3');
    }

    create() {
        const { width, height } = this.sys.game.canvas;
    
        const background = this.add.image(width / 2, height / 2, 'menu_background');
        background.setDisplaySize(width, height);
    
        const title = this.add.text(width / 2, height / 2 - 115, 'Behind You', {
            fontSize: '64px', fill: '#CD853F'
        }).setOrigin(0.5);
    
        const playButton = this.add.image(width / 2, height / 2 + 100, 'play_button').setInteractive().setScale(0.5);
        playButton.on('pointerover', () => playButton.setScale(0.6));
        playButton.on('pointerout', () => playButton.setScale(0.5));
        playButton.on('pointerdown', () => {
            let backgroundSound = this.sound.add('start_sound', { loop: true });
            backgroundSound.play();
            this.scene.start('GameScene', { backgroundSound: backgroundSound });
        });

        // Add instructions button below the play button
        const instructionsButton = this.add.image(width / 2, height / 2 + 150, 'instructions_button').setInteractive().setScale(0.5);
        instructionsButton.on('pointerover', () => instructionsButton.setScale(0.6));
        instructionsButton.on('pointerout', () => instructionsButton.setScale(0.5));
        instructionsButton.on('pointerdown', () => {
            this.scene.start('InstructionsScene');
        });
    }

    shutdown() {
        this.sound.stopAll();
    }
    
}

window.MainMenu = MainMenu;
