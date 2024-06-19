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
        //this.add.image(480, 320, 'gameover_background');

        // Criar a animação
        this.anims.create({
            key: 'fast_animation',
            frames: this.anims.generateFrameNumbers('animation_sprite', { start: 0, end: 19 }),
            frameRate: 20, // Ajuste a taxa de quadros conforme necessário para uma animação rápida
            repeat: 0
        });

        const offsetY = -170; // mover a animação para cima
        this.animationSprite = this.add.sprite(this.sys.game.config.width / 2, this.sys.game.config.height / 2 + offsetY, 'animation_sprite');
        this.animationSprite.setScale(this.scaleFactor); // Definir a escala inicial
        this.animationSprite.setOrigin(0.5, 0.5); // Centralizar a animação na tela

        // Iniciar a animação
        this.animationSprite.anims.play('fast_animation', true).on('animationcomplete', () => {
            console.log('Animation complete');
            // Aguardar 2 segundos e apresentar GAME OVER e botões de retorno
            setTimeout(() => {
                this.add.text(480, 280, 'GAME OVER', { fontSize: '64px', fill: '#ffffff' }).setOrigin(0.5);

                const restartButton = this.add.image(480, 380, 'restart_button').setInteractive();
                restartButton.setScale(0.5); // Reduzir o tamanho do botão
                restartButton.on('pointerdown', () => this.scene.start('GameScene'));

                const mainMenuButton = this.add.image(480, 460, 'main_menu_button').setInteractive();
                mainMenuButton.setScale(0.5); // Reduzir o tamanho do botão
                mainMenuButton.on('pointerdown', () => this.scene.start('MainMenu'));
            }, 1500);
        });
    }

    update() {
        // Aumentar gradualmente a escala do sprite enquanto a animação está a ser executada
        if (this.animationSprite.anims.currentAnim) {
            const currentWidth = this.animationSprite.width * this.scaleFactor;
            const currentHeight = this.animationSprite.height * this.scaleFactor;
            const targetWidth = this.sys.game.config.width;
            const targetHeight = this.sys.game.config.height;

            // Verifica se o sprite já preencheu a tela
            if (currentWidth < targetWidth || currentHeight < targetHeight) {
                this.scaleFactor += 1; // Velocidade
                this.animationSprite.setScale(this.scaleFactor);
            }
        }
    }
}

window.GameOver = GameOver;
