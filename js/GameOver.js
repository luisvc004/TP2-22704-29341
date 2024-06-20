class GameOver extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOver' });
        this.scaleFactor = 0.9; // Fator de escala inicial
    }

    preload() {
        //this.load.image('gameover_background', 'assets/gameover_background.png');
        this.load.image('restart_button', 'assets/restart_button1.png');
        this.load.image('main_menu_button', 'assets/main_menu_button.png');
        
        // Carregar spritesheet para a animação
        this.load.spritesheet('animation_sprite', 'assets/enemy_4_jumpscare.png', { frameWidth: 127, frameHeight: 124 });
    }

    create() {
        // Adiciona o texto GAME OVER e os botões primeiro, para que fiquem por baixo da animação
        this.gameOverText = this.add.text(this.sys.game.config.width / 2, 280, 'GAME OVER!', { fontSize: '64px', fill: '#ffffff' }).setOrigin(0.5).setVisible(false);
        this.restartButton = this.add.image(this.sys.game.config.width / 2, 380, 'restart_button').setInteractive().setScale(0.5).setVisible(false);
        this.restartButton.on('pointerdown', () => this.scene.start('GameScene'));
        this.mainMenuButton = this.add.image(this.sys.game.config.width / 2, 460, 'main_menu_button').setInteractive().setScale(0.5).setVisible(false);
        this.mainMenuButton.on('pointerdown', () => this.scene.start('MainMenu'));
    
        // Configuração e início da animação
        this.anims.create({
            key: 'fast_animation',
            frames: this.anims.generateFrameNumbers('animation_sprite', { start: 0, end: 19 }),
            frameRate: 20,
            repeat: 0
        });
    
        const offsetY = -170; 
        this.animationSprite = this.add.sprite(this.sys.game.config.width / 2, this.sys.game.config.height / 2 + offsetY, 'animation_sprite');
        this.animationSprite.setScale(this.scaleFactor);
        this.animationSprite.setOrigin(0.5, 0.5);
        this.animationSprite.anims.play('fast_animation', true).on('animationcomplete', () => {
            this.startDescending = true;
        });
    }    
    
    update() {
        if (this.animationSprite.anims.currentAnim) {
            const currentWidth = this.animationSprite.width * this.scaleFactor;
            const currentHeight = this.animationSprite.height * this.scaleFactor;
            const targetWidth = this.sys.game.config.width;
            const targetHeight = this.sys.game.config.height;
    
            if (currentWidth < targetWidth || currentHeight < targetHeight) {
                this.scaleFactor += 1; // Velocidade
                this.animationSprite.setScale(this.scaleFactor);
            }
        }
    
        if (this.startDescending) {
            this.animationSprite.y += 5;
            if (this.animationSprite.y > this.sys.game.config.height + this.animationSprite.displayHeight) {
                this.startDescending = false;
            }
        }
    
        // Verifica se o sprite já começou a descer para mostrar o texto e os botões
        if (this.startDescending) {
            this.gameOverText.setVisible(true);
            this.restartButton.setVisible(true);
            this.mainMenuButton.setVisible(true);
        }
    }
        


    showGameOver() {
        // Aguardar 1.5 segundos e apresentar GAME OVER e botões de retorno
        setTimeout(() => {
            this.add.text(this.sys.game.config.width / 2, 280, 'GAME OVER', { fontSize: '64px', fill: '#ffffff' }).setOrigin(0.5);
    
            const restartButton = this.add.image(this.sys.game.config.width / 2, 380, 'restart_button').setInteractive();
            restartButton.setScale(0.5); // Reduzir o tamanho do botão
            restartButton.on('pointerdown', () => this.scene.start('GameScene'));
    
            const mainMenuButton = this.add.image(this.sys.game.config.width / 2, 460, 'main_menu_button').setInteractive();
            mainMenuButton.setScale(0.5); // Reduzir o tamanho do botão
            mainMenuButton.on('pointerdown', () => this.scene.start('MainMenu'));
        }, 300);
    }

}

window.GameOver = GameOver;
