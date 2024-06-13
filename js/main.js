const config = {
    type: Phaser.AUTO,
    width: 1000,
    height: 600,
    backgroundColor: '#73767a',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    callbacks: {
        postBoot: function (game) {
            game.canvas.style.cursor = 'none';
        }
    }
};


const game = new Phaser.Game(config);
let player, cursors, flashlight;

function preload() {
    // Carregar spritesheet (cada frame tem 32x32 pixels)
    this.load.spritesheet('player', 'assets/red_player.png', { frameWidth: 32, frameHeight: 32 });
}

function create() {
    // Player setup
    player = this.physics.add.sprite(400, 300, 'player').setScale(1.3);
    player.setCollideWorldBounds(true);

    // Input setup for WASD keys
    cursors = this.input.keyboard.addKeys({
        'up': Phaser.Input.Keyboard.KeyCodes.W,
        'down': Phaser.Input.Keyboard.KeyCodes.S,
        'left': Phaser.Input.Keyboard.KeyCodes.A,
        'right': Phaser.Input.Keyboard.KeyCodes.D
    });

    // Criação do cone de luz
    flashlight = this.add.graphics();
    flashlight.fillStyle(0xffffffff, 0.5);  // Branco com 50% de transparência

    // Configurar as animações para o jogador
    const frameCountPerRow = 7;
    const animationRowCount = 9;

   // for (let i = 0; i <= animationRowCount; i++) {
        this.anims.create({
            key: `run`,
            frames: this.anims.generateFrameNumbers('player', { start: 24, end: 31 }),
            frameRate: 7,
            repeat: -1
        });
  //  }

    // Exemplo: Iniciar a primeira animação
    player.anims.play('run');
}

function update() {
    // Player movement
    player.setVelocity(0);  // Reset velocity

    if (cursors.left.isDown) {
        player.setVelocityX(-130);
    } else if (cursors.right.isDown) {
        player.setVelocityX(130);
    }

    if (cursors.up.isDown) {
        player.setVelocityY(-130);
    } else if (cursors.down.isDown) {
        player.setVelocityY(130);
    }

    // Atualizar posição e rotação do cone de luz
    flashlight.clear();
    flashlight.fillStyle(0xffffffff, 0.8);  // Branco com 50% de transparência

    const angle = Phaser.Math.Angle.Between(player.x, player.y, this.input.activePointer.x, this.input.activePointer.y);
    const lightRadius = 150;
    const lightWidth = 150;

    flashlight.beginPath();
    flashlight.moveTo(player.x + 7, player.y);
    flashlight.lineTo(player.x + Math.cos(angle - 0.2) * lightWidth, player.y + Math.sin(angle - 0.2) * lightWidth);
    flashlight.lineTo(player.x + Math.cos(angle) * lightRadius, player.y + Math.sin(angle) * lightRadius);
    flashlight.lineTo(player.x + Math.cos(angle + 0.2) * lightWidth, player.y + Math.sin(angle + 0.2) * lightWidth);
    flashlight.closePath();
    flashlight.fillPath();
}
