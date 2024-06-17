const config = {
    type: Phaser.AUTO,
    width: 1000,
    height: 600,
   // backgroundColor: '#73767a',
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
let flashingInterval; // Variável para armazenar o intervalo de piscar
let noBatteryText; // Texto de aviso "No battery"
let noBatteryTween; // Tween para fazer o texto piscar

function preload() {

    //mapa
    this.load.image('tileset', 'assets/tileset.png');
    this.load.tilemapTiledJSON('map', 'assets/levels/tileset.json');

    this.load.spritesheet('player', 'assets/red_player.png', { frameWidth: 32, frameHeight: 32 });
    
}

function create() {

    const map = this.make.tilemap({ key: 'map' });
    const tileset = map.addTilesetImage('tileset', 'tileset');
    
    // Criar camadas
    const backgroundLayer = map.createLayer('Ground', tileset, 0, 0);
    const walls = map.createLayer('Wall', tileset, 0, 0);
    walls.setCollisionByExclusion([-1]);

    player = this.physics.add.sprite(400, 300, 'player').setScale(1.3);
    player.setCollideWorldBounds(true);

    this.physics.add.collider(player, walls);

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

    // Inicializar o texto de aviso "No battery"
    noBatteryText = this.add.text(400, 50, 'No battery', { font: '24px Arial', fill: '#ff0000', align: 'center' });
    noBatteryText.setOrigin(0.5);
    noBatteryText.setVisible(false); // Inicialmente invisível

    // Criar tween para piscar o texto
    noBatteryTween = this.tweens.add({
        targets: noBatteryText,
        alpha: 0,
        duration: 500, // Duração do tween
        ease: 'Linear',
        yoyo: true,
        repeat: -1 // Repetir indefinidamente enquanto a energia estiver abaixo de 20%
    });
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

        const angle = Phaser.Math.Angle.Between(player.x, player.y, this.input.mousePointer.x, this.input.mousePointer.y);
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

        // Verifica se a energia está abaixo de 20% para começar a piscar o aviso
        if (energyLevel <= 20 && energyLevel > 0) {
            noBatteryText.setVisible(true); // Mostra o texto "No battery"
            noBatteryTween.play(); // Inicia o tween para piscar o texto
            startFlashing(); // Inicia o piscar do flashlight
        } else {
            noBatteryText.setVisible(false); // Esconde o texto "No battery"
            noBatteryTween.stop(); // Para o tween do texto
            stopFlashing(); // Para o piscar do flashlight
        }
    } else {
        noBatteryText.setVisible(false); // Esconde o texto "No battery"
        noBatteryTween.stop(); // Para o tween do texto
        stopFlashing(); // Para o piscar do flashlight
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

function startFlashing() {
    flashingInterval = setInterval(() => {
        flashlight.visible = !flashlight.visible; // Alternar entre visível e invisível
    }, 100); // Intervalo de 100ms para piscar rapidamente
}

function stopFlashing() {
    clearInterval(flashingInterval);
    flashlight.visible = true; // Garantir que a luz esteja visível se não estiver piscando
}
