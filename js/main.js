const config = {
    type: Phaser.AUTO,
    width: 1000,
    height: 600,
    backgroundColor: '#000000', // Dark background color for night environment
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
let walls; // Reference to the wall layer

function preload() {
    //mapa
    this.load.image('tileset', 'assets/tileset.png');
    this.load.tilemapTiledJSON('map', 'assets/levels/tileset.json');
    this.load.spritesheet('player', 'assets/red_player.png', { frameWidth: 32, frameHeight: 32 });

    this.load.spritesheet('enemy_run', 'assets/enemy1/run.png', { frameWidth: 40, frameHeight: 40 });
    this.load.spritesheet('enemy_idle', 'assets/enemy1/idle.png', { frameWidth: 40, frameHeight: 40 });
}

function create() {
    const map = this.make.tilemap({ key: 'map' });
    const tileset = map.addTilesetImage('tileset', 'tileset');
    
    // Criar camadas
    const backgroundLayer = map.createLayer('Ground', tileset, 0, 0);
    walls = map.createLayer('Wall', tileset, 0, 0);
    walls.setCollisionByExclusion([-1]);

    // Apply a dark tint to the map layers
    backgroundLayer.setTint(0x2a2a2a);
  //  walls.setTint(0x2a2a2a);

    player = this.physics.add.sprite(400, 300, 'player').setScale(1.3);
    enemy_idle = this.physics.add.sprite(400, 300, 'enemy_idle').setScale(1.3);
    enemy_run = this.physics.add.sprite(400, 300, 'enemy_run').setScale(1.3);

    player.setCollideWorldBounds(true);

    // Darken the player sprite
    //player.setTint(0x555555);

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
        key: 'player_run',
        frames: this.anims.generateFrameNumbers('player', { start: 24, end: 31 }),
        frameRate: 7,
        repeat: -1
    });

    this.anims.create({
        key: 'player_idle',
        frames: this.anims.generateFrameNumbers('player', { frames: [0, 1, 8, 9] }),
        frameRate: 4,
        repeat: -1
    });

    this.anims.create({
        key: 'enemy_run',
        frames: this.anims.generateFrameNumbers('enemy_run', {frames: [1,4,7,10,13,16,19]}),
        frameRate: 7,
        repeat: -1
    });

    this.anims.create({
        key: 'enemy_idle',
        frames: this.anims.generateFrameNumbers('enemy_idle', {frames: [1,4,7,10]}),
        frameRate: 10,
        repeat: -1
    });

    player.anims.play('player_idle');
    enemy_run.play('enemy_run');

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
        player.anims.play('player_run', true);
    } else {
        player.anims.play('player_idle', true);
    }

    updateEnergyBar();
    updateFlashlight.call(this); // Chama updateFlashlight garantindo que o contexto seja correto
}

function updateFlashlight() {
    flashlight.clear();

    if (isLightOn && energyLevel > 0) {
        flashlight.fillStyle(0xffffff, 0.09);

        const angle = Phaser.Math.Angle.Between(player.x, player.y, this.input.mousePointer.x, this.input.mousePointer.y);
        const lightRadius = 150;

        const startAngle = angle - 0.4;
        const endAngle = angle + 0.2;

        // Variables to store the end points of the flashlight beam
        let endX1 = player.x + lightRadius * Math.cos(startAngle);
        let endY1 = player.y + lightRadius * Math.sin(startAngle);
        let endX2 = player.x + lightRadius * Math.cos(endAngle);
        let endY2 = player.y + lightRadius * Math.sin(endAngle);

        // Create a triangle representing the flashlight beam
        let flashlightBeam = new Phaser.Geom.Triangle(
            player.x, player.y,
            endX1, endY1,
            endX2, endY2
        );

        // Check for overlap between the flashlight beam and the walls and adjust the beam
        walls.forEachTile(tile => {
            if (tile.index !== -1) {
                const tileWorldX = tile.getCenterX();
                const tileWorldY = tile.getCenterY();
                const tileRect = new Phaser.Geom.Rectangle(tileWorldX - tile.width / 2, tileWorldY - tile.height / 2, tile.width, tile.height);

                // Check for intersections with the edges of the rectangle
                const triangleEdges = [
                    new Phaser.Geom.Line(player.x, player.y, endX1, endY1),
                    new Phaser.Geom.Line(player.x, player.y, endX2, endY2)
                ];

                const rectEdges = [
                    new Phaser.Geom.Line(tileRect.x, tileRect.y, tileRect.x + tileRect.width, tileRect.y),
                    new Phaser.Geom.Line(tileRect.x + tileRect.width, tileRect.y, tileRect.x + tileRect.width, tileRect.y + tileRect.height),
                    new Phaser.Geom.Line(tileRect.x + tileRect.width, tileRect.y + tileRect.height, tileRect.x, tileRect.y + tileRect.height),
                    new Phaser.Geom.Line(tileRect.x, tileRect.y + tileRect.height, tileRect.x, tileRect.y)
                ];

                for (let i = 0; i < triangleEdges.length; i++) {
                    for (let j = 0; j < rectEdges.length; j++) {
                        let intersection = new Phaser.Geom.Point();
                        if (Phaser.Geom.Intersects.LineToLine(triangleEdges[i], rectEdges[j], intersection)) {
                            if (i === 0) {
                                endX1 = intersection.x;
                                endY1 = intersection.y;
                            } else {
                                endX2 = intersection.x;
                                endY2 = intersection.y;
                            }
                        }
                    }
                }
            }
        });

        // Draw the adjusted flashlight beam
        flashlightBeam = new Phaser.Geom.Triangle(
            player.x, player.y,
            endX1, endY1,
            endX2, endY2
        );

        flashlight.beginPath();
        flashlight.moveTo(flashlightBeam.x1, flashlightBeam.y1);
        flashlight.lineTo(flashlightBeam.x2, flashlightBeam.y2);
        flashlight.lineTo(flashlightBeam.x3, flashlightBeam.y3);
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
