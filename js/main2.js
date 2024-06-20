const config = {
    type: Phaser.AUTO,
    width: 1000,
    height: 600,
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
};

const game = new Phaser.Game(config);
let player, cursors, spotlight, toggleLightKey, isLightOn = false;
let energyBar, energyMaskGraphics, energyMask;
let energyLevel = 1000000; // Energia começa em 100%
let initialEnergyLevel = 1000; // Guarda o valor inicial da energia
let flashingInterval; // Variável para armazenar o intervalo de piscar
let noBatteryText; // Texto de aviso "No battery"
let noBatteryTween; // Tween para fazer o texto piscar

var tilesprite;

function preload() {
    this.load.spritesheet('player', 'assets/red_player.png', { frameWidth: 32, frameHeight: 32 });
    this.load.image('tileset', 'assets/tileset.png');
    this.load.tilemapTiledJSON('map', 'assets/levels/tileset.json');
}

function create() {
    const map = this.make.tilemap({ key: 'map' });
    const tileset = map.addTilesetImage('tileset', 'tileset');

    // Criar camadas
    const backgroundLayer = map.createLayer('Ground', tileset, 0, 0);

    tilesprite = this.add.tileSprite(400, 300, 800, 800, 'tileset');
    tile = this.add.tileSprite(200, 200, 200, 200, 'tileset').setPipeline('Light2D');
    player = this.physics.add.sprite(400, 300, 'player').setScale(1.5);
    this.lights.enable();
    this.lights.setAmbientColor(0x404040);

    spotlight = this.lights.addLight(0, 0, 70).setIntensity(4);
    spotlight.displayHeight = 200; 

    player.setCollideWorldBounds(true);

    cursors = this.input.keyboard.addKeys({
        'up': Phaser.Input.Keyboard.KeyCodes.W,
        'down': Phaser.Input.Keyboard.KeyCodes.S,
        'left': Phaser.Input.Keyboard.KeyCodes.A,
        'right': Phaser.Input.Keyboard.KeyCodes.D
    });

    toggleLightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);

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
        duration: 100, // Duração do tween
        ease: 'Linear',
        yoyo: true,
        repeat: -1 // Repetir indefinidamente enquanto a energia estiver abaixo de 20%
    });

    this.input.on('pointermove', function (pointer) {
        this.input.mousePointer = pointer;
    }, this);

    updateSpotlight.call(this);
}

function update() {
    if (Phaser.Input.Keyboard.JustDown(toggleLightKey)) {
        isLightOn = !isLightOn;

        if (!isLightOn) {
            initialEnergyLevel = energyLevel;
        } else {
            if (initialEnergyLevel > 0) {
                energyLevel = initialEnergyLevel;
            }
        }
        updateSpotlight.call(this);
    }

    player.setVelocity(0);

    let velocityX = 0;
    let velocityY = 0;

    if (cursors.left.isDown) {
        velocityX = -110;
        player.setFlipX(true);
    } else if (cursors.right.isDown) {
        velocityX = 110;
        player.setFlipX(false);
    }

    if (cursors.up.isDown) {
        velocityY = -110;
    } else if (cursors.down.isDown) {
        velocityY = 110;
    }

    player.setVelocityX(velocityX);
    player.setVelocityY(velocityY);

    if (velocityX !== 0 || velocityY !== 0) {
        player.anims.play('run', true);
    } else {
        player.anims.play('idle', true);
    }

    updateEnergyBar();

    if (isLightOn && energyLevel > 0) {
        energyLevel -= 0.1;
        energyLevel = Phaser.Math.Clamp(energyLevel, 0, 1000);

        if (energyLevel <= 20 && energyLevel > 0) {
            noBatteryText.setVisible(true);
            noBatteryTween.play();
            startFlashing();
        } else {
            noBatteryText.setVisible(false);
            noBatteryTween.stop();
            stopFlashing();
        }
    } else {
        noBatteryText.setVisible(false);
        noBatteryTween.stop();
        stopFlashing();
    }

    updateSpotlight.call(this);
}

function updateSpotlight() {
    if (isLightOn && energyLevel > 0) {
        spotlight.setVisible(true);
        
        let mouseX = this.input.mousePointer.worldX;
        let mouseY = this.input.mousePointer.worldY;

        let dx = mouseX - player.x;
        let dy = mouseY - player.y;
        let angle = Math.atan2(dy, dx);

        let spotlightX = player.x + 40 * Math.cos(angle);
        let spotlightY = player.y + 40 * Math.sin(angle);

        spotlight.x = spotlightX;
        spotlight.y = spotlightY;
    } else {
        spotlight.setVisible(false);
    }
}

function updateEnergyBar() {
    energyMaskGraphics.clear();
    energyMaskGraphics.fillStyle(0x000000);
    energyMaskGraphics.fillRect(10, 0, 200 * (energyLevel / 100), 20);

    energyBar.clear();
    if (energyLevel <= 20) {
        energyBar.fillStyle(0xff0000); // Vermelho quando a energia é baixa
    } else {
        energyBar.fillStyle(0xffffff); // Branco quando a energia é alta
    }
    energyBar.fillRect(10, 10, 200 * (energyLevel / 100), 20);

    energyBar.setMask(energyMask);
}

function startFlashing() {
    flashingInterval = setInterval(() => {
        spotlight.visible = !spotlight.visible;
    }, 100);
}

function stopFlashing() {
    clearInterval(flashingInterval);
    spotlight.visible = true;
}
