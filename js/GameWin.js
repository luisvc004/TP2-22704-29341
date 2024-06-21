class GameWin extends Phaser.Scene {
    constructor() {
        super({ key: 'GameWin' });
        this.scaleFactor = 0.9; // Fator de escala inicial
    }

    preload() {
        this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
    }

    create() {
        WebFont.load({
            google: {
                families: ['Creepster']
            },
            active: () => {
                this.gameWinText = this.add.text(this.sys.game.config.width / 2, 200, 'CONGRATS,\n YOU WIN!', { 
                    fontFamily: 'Creepster',
                    fontSize: '200px', 
                    fill: '#ffffff' 
                }).setOrigin(0.5).setVisible(false);
                
                this.restartButton = this.add.text(this.sys.game.config.width / 2, 460, 'Restart', {
                    fontFamily: 'Creepster',
                    fontSize: '64px',
                    fill: '#ffffff'
                }).setOrigin(0.5).setInteractive().setVisible(false);
                this.restartButton.on('pointerover', () => this.restartButton.setScale(1.1));
                this.restartButton.on('pointerout', () => this.restartButton.setScale(1));
                this.restartButton.on('pointerdown', () => this.scene.start('GameScene'));

                this.mainMenuButton = this.add.text(this.sys.game.config.width / 2, 540, 'Main Menu', {
                    fontFamily: 'Creepster',
                    fontSize: '64px',
                    fill: '#ffffff'
                }).setOrigin(0.5).setInteractive().setVisible(false);
                this.mainMenuButton.on('pointerover', () => this.mainMenuButton.setScale(1.1));
                this.mainMenuButton.on('pointerout', () => this.mainMenuButton.setScale(1));
                this.mainMenuButton.on('pointerdown', () => this.scene.start('MainMenu'));
            }
        });
    }    
    
    update() {
        this.gameWinText.setVisible(true);
        this.restartButton.setVisible(true);
        if (this.mainMenuButton) this.mainMenuButton.setVisible(true);
    }
}

window.GameWin = GameWin;
