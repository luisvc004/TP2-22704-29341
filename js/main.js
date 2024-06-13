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
let player, cursors, flashlight, toggleLightKey, isLightOn = false;
let energyBar, energyMaskGraphics, energyMask;
let energyLevel = 100; // Energia começa em 100%
let initialEnergyLevel = 100; // Guarda o valor inicial da energia

function preload() {
    this.load.spritesheet('player', 'assets/red_player.png', { frameWidth: 32, frameHeight: 32 });
}

function create() {
    player = this.physics.add.sprite(400, 300, 'player').setScale(1.3);
    player.setCollideWorldBounds(true);

    cursors = this.input.keyboard.addKeys({
        'up': Phaser.Input.Keyboard.KeyCodes.W,
        'down': Phaser.Input.Keyboard.KeyCodes.S,
        'left': Phaser.Input.Keyboard.KeyCodes.A,
        'right': Phaser.Input.Keyboard.KeyCodes.D
    });

    toggleLightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);

    flashlight = this.add.graphics();

    this.anims.create({
        key: 'run',
        frames: this.anims.generateFrameNumbers('player', { start: 24, end: 31 }),
        frameRate: 7,
        repeat: -1
    });

    this.anims.create({
        key: 'idle',
        frames: this.anims.generateFrameNumbers('player', { frames: [0, 1, 8, 9] }),
        frameRate: 4,
        repeat: -1
    });

    player.anims.play('idle');

    // Criar a barra de energia
    energyBar = this.add.graphics();
    energyBar.fillStyle(0xffffff);
    energyBar.fillRect(10, 10, 200, 20); // Barra inicial com largura de 200

    // Criar a máscara da barra de energia
    energyMaskGraphics = this.make.graphics();
    energyMaskGraphics.fillStyle(0x000000);
    energyMaskGraphics.fillRect(0, 0, 200, 20); // Máscara inicial com largura de 200
    energyMask = energyMaskGraphics.createGeometryMask();

    energyBar.setMask(energyMask);
}

function update() {
    // Verifica se a tecla F foi pressionada para ligar ou desligar a luz
    if (Phaser.Input.Keyboard.JustDown(toggleLightKey)) {
        isLightOn = !isLightOn;

        // Se a luz for desligada, guarda o nível atual de energia como o inicial
        if (!isLightOn) {
            initialEnergyLevel = energyLevel;
        } else {
            // Se a luz for ligada e o nível inicial de energia for maior que zero,
            // restaura energyLevel para initialEnergyLevel
            if (initialEnergyLevel > 0) {
                energyLevel = initialEnergyLevel;
            }
        }
    }

    player.setVelocity(0);

    let velocityX = 0;
    let velocityY = 0;

    if (cursors.left.isDown) {
        velocityX = -130;
        player.setFlipX(true);
    } else if (cursors.right.isDown) {
        velocityX = 130;
        player.setFlipX(false);
    }

    if (cursors.up.isDown) {
        velocityY = -130;
    } else if (cursors.down.isDown) {
        velocityY = 130;
    }

    player.setVelocityX(velocityX);
    player.setVelocityY(velocityY);

    if (velocityX !== 0 || velocityY !== 0) {
        player.anims.play('run', true);
    } else {
        player.anims.play('idle', true);
    }

    updateEnergyBar();
    updateFlashlight.call(this); // Chama updateFlashlight garantindo que o contexto seja correto
}

function updateFlashlight() {
    flashlight.clear();

    if (isLightOn && energyLevel > 0) {
        flashlight.fillStyle(0xffffff, 0.8);

        const angle = Phaser.Math.Angle.Between(player.x, player.y, this.input.activePointer.x, this.input.activePointer.y);
        const lightRadius = 150;

        flashlight.beginPath();
        flashlight.arc(player.x, player.y, lightRadius, angle - 0.4, angle + 0.2, false);
        flashlight.lineTo(player.x, player.y);
        flashlight.closePath();
        flashlight.fillPath();

        // Reduz a energia da luz conforme o tempo
        energyLevel -= 0.1; // Ajuste conforme necessário

        // Garante que a energia não seja menor que 0
        energyLevel = Phaser.Math.Clamp(energyLevel, 0, 100);
    }
}

function updateEnergyBar() {
    // Atualiza a máscara da barra de energia conforme o nível atual de energia
    energyMaskGraphics.clear();
    energyMaskGraphics.fillStyle(0x000000);
    energyMaskGraphics.fillRect(10, 0, 200 * (energyLevel / 100), 20);

    energyBar.clear();
    energyBar.fillStyle(0xffffff);
    energyBar.fillRect(10, 10, 200 * (energyLevel / 100), 20);

    energyBar.setMask(energyMask);
}
