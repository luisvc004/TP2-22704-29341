class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.image('tileset', 'assets/tileset.png');
        this.load.image('battery', 'assets/battery.png');
        this.load.tilemapTiledJSON('map', 'assets/levels/tileset.json');
        this.load.spritesheet('player', 'assets/red_player.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('enemy_run','assets/enemy1/run.png', { frameWidth: 40, frameHeight: 39 });
        this.load.spritesheet('enemy_attack', 'assets/enemy1/attack.png', { frameWidth: 126, frameHeight: 39 });
        this.load.spritesheet('enemy_idle', 'assets/enemy1/idle.png', { frameWidth: 40, frameHeight: 39 });
        this.load.image('flashlight', 'assets/flashlights.png');
    }

    create(data) {
        this.physics.world.createDebugGraphic();

        const battery_number = 8;

        const cursors = this.input.keyboard.createCursorKeys();

        const map = this.make.tilemap({ key: 'map' });
        const tileset = map.addTilesetImage('tileset', 'tileset');

        const backgroundLayer = map.createLayer('Ground', tileset, 0, 0).setPipeline('Light2D');
        const furniture = map.createLayer('Furniture', tileset, 0, 0).setPipeline('Light2D');
        const walls = map.createLayer('Wall', tileset, 0, 0).setPipeline('Light2D');
        walls.setCollisionByExclusion([-1]);

        const player = this.physics.add.sprite(400, 300, 'player').setScale(1.3).setCollideWorldBounds(true);
        
        this.lights.enable();
        this.lights.setAmbientColor(0x000000);

        let spotlight = this.lights.addLight(player.x, player.y, 70).setIntensity(4);
        let spotlight2 = this.lights.addLight(player.x, player.y, 100).setIntensity(2);
        

        this.lights.addLight(430, 25, 70).setIntensity(1);
        this.lights.addLight(530, 25, 70).setIntensity(1);

        const enemyPosition = this.getValidPosition(map, walls);
        
        const enemyRun = this.physics.add.sprite(enemyPosition.x, enemyPosition.y, ['enemy_run','enemy_attack']).setScale(1.6).setPipeline('Light2D');

        const batteries = this.physics.add.group();

        for (let i = 0; i < battery_number; i++) { // Changed to iterate from 0 to 7 (8 batteries)
            const batteryPosition = this.getValidPosition(map, walls);
            const battery = batteries.create(batteryPosition.x, batteryPosition.y, 'battery').setScale(0.055);
            battery.setPipeline('Light2D');
            battery.setInteractive();
            battery.on('pointerdown', () => this.collectBattery(battery));
            battery.on('pointerover', () => battery.setScale(0.070));
            battery.on('pointerout', () => battery.setScale(0.055));
        }

        this.cursors = cursors;
        this.physics.add.collider(player, walls);
        this.physics.add.collider(enemyRun, walls);
        this.physics.add.overlap(enemyRun, player, () => {
          //  this.enemyRun.anims.play('enemy_attack'); // nao ta a dar
        });
        
        const toggleLightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        
        const flashlight = this.add.graphics();
        
        if (!this.anims.exists('player_run')) {
            this.anims.create({ 
                key: 'player_run', 
                frames: this.anims.generateFrameNumbers('player', { start: 24, end: 31 }), 
                frameRate: 7, 
                repeat: -1 
            });
        }

        if (!this.anims.exists('player_idle')) {
            this.anims.create({ 
                key: 'player_idle', 
                frames: this.anims.generateFrameNumbers('player', { frames: [0, 1, 8, 9] }), 
                frameRate: 4, 
                repeat: -1 
            });
        }

        if (!this.anims.exists('enemy_run')) {
            this.anims.create({ 
                key: 'enemy_run', 
                frames: this.anims.generateFrameNumbers('enemy_run', { frames: [1, 4, 7, 10, 13, 16, 19] }), 
                frameRate: 7, 
                repeat: -1 
            });
        }

        if (!this.anims.exists('enemy_idle')) {
            this.anims.create({ 
                key: 'enemy_idle', 
                frames: this.anims.generateFrameNumbers('enemy_idle', { frames: [1, 4, 7, 10] }), 
                frameRate: 10, 
                repeat: -1 
            });
        }

        this.anims.create({ 
            key: 'enemy_attack', 
            frames: this.anims.generateFrameNumbers('enemy_attack', { start: 0, end: 7}), 
            frameRate: 7, 
            repeat: -1 
        });

        player.anims.play('player_idle');
        enemyRun.anims.play('enemy_run');

        const energyBar = this.add.graphics().fillStyle(0xffffff).fillRect(player.x, player.y, 200, 200);
        
        const energyMaskGraphics = this.make.graphics().fillStyle(0x000000).fillRect(0, 0, 200, 20);
        
        const energyMask = energyMaskGraphics.createGeometryMask();
        
        energyBar.setMask(energyMask);

        const noBatteryText = this.add.text(50, 50, 'Low Battery', {
            font: '18px Arial',
            fill: '#ff0000',
            align: 'left' 
        }).setOrigin(0);
        
        const noBatteryTween = this.tweens.add({ 
            targets: noBatteryText, 
            alpha: 0, 
            duration: 500, 
            ease: 'Linear', 
            yoyo: true, 
            repeat: -1 
        });

        this.player = player;
        this.enemyRun = enemyRun;
        this.flashlight = flashlight;
        this.energyBar = energyBar;
        this.energyMaskGraphics = energyMaskGraphics;
        this.energyMask = energyMask;
        this.noBatteryText = noBatteryText;
        this.noBatteryTween = noBatteryTween;
        this.isLightOn = false;
        this.energyLevel = 100;
        this.initialEnergyLevel = 100;
        this.cursors = cursors;
        this.toggleLightKey = toggleLightKey;
        this.walls = walls;
        this.batteries = batteries;
        this.spotlight = spotlight;
        this.spotlight2 = spotlight2;
    }

    update() {
        const { cursors, player, toggleLightKey, spotlight, spotlight2 } = this;

        if (Phaser.Input.Keyboard.JustDown(toggleLightKey)) {
            this.isLightOn = !this.isLightOn;
            if (!this.isLightOn) {
                this.initialEnergyLevel = this.energyLevel;
            } else if (this.initialEnergyLevel > 0) {
                this.energyLevel = this.initialEnergyLevel;
            }
        }

        player.setVelocity(0);
        let velocityX = 0;
        let velocityY = 0;

        if (cursors.left.isDown || this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A).isDown) {
            velocityX = -110;
            player.setFlipX(true);
        } 
        else if (cursors.right.isDown || this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D).isDown) {
            velocityX = 110;
            player.setFlipX(false);
        }

        if(this.enemyRun.x > player.x) {
            this.enemyRun.setFlipX(true);
        } else {
            this.enemyRun.setFlipX(false);
        }

        if (cursors.up.isDown || this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W).isDown) {
            velocityY = -110;
        } 
        else if (cursors.down.isDown || this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S).isDown) {
            velocityY = 110;
        }

        player.setVelocityX(velocityX);
        player.setVelocityY(velocityY);

        if (velocityX !== 0 || velocityY !== 0) {
            player.anims.play('player_run', true);
        } else {
            player.anims.play('player_idle', true);
        }

        const cursor = this.input.activePointer;
        const angle = Phaser.Math.Angle.Between(player.x, player.y, cursor.x, cursor.y);
        const spotlightRadius = 40; // Set the radius for the spotlight
        const spotlight2Radius = 100;
        

        spotlight.x = player.x + spotlightRadius * Math.cos(angle);
        spotlight.y = player.y + spotlightRadius * Math.sin(angle);

        spotlight2.x = player.x + spotlight2Radius * Math.cos(angle - 0.2); // Slight offset for the second spotlight
        spotlight2.y = player.y + spotlight2Radius * Math.sin(angle - 0.2);

        this.updateEnergyBar();
        this.updateFlashlight.call(this);
        
        const distance = Phaser.Math.Distance.Between(
            this.enemyRun.x,
            this.enemyRun.y,
            this.player.x,
            this.player.y
        );

        const enemy_speed = 60; // Define enemy speed here

        if (distance < 100000) {
            this.enemyRun.anims.play('enemy_run', true);
            const angle = Phaser.Math.Angle.Between(this.enemyRun.x, this.enemyRun.y, player.x, player.y);
            this.enemyRun.setVelocity(Math.cos(angle) * enemy_speed, Math.sin(angle) * enemy_speed);
        } else {
            this.enemyRun.anims.play('enemy_idle', true); // Idle animation for enemy
        }

        if (distance < 30) {
            this.handleGameOver();
        }
    }

    updateFlashlight() {
        this.flashlight.clear();
    
        if (this.isLightOn && this.energyLevel > 0) {
            this.flashlight.fillStyle(0xffffff, 0.1);
    
            const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.input.mousePointer.x, this.input.mousePointer.y);
            const lightRadius = 150;
    
            const startAngle = angle - 0.4;
            const endAngle = angle + 0.2;
    
            let endX1 = this.player.x + lightRadius * Math.cos(startAngle);
            let endY1 = this.player.y + lightRadius * Math.sin(startAngle);
            let endX2 = this.player.x + lightRadius * Math.cos(endAngle);
            let endY2 = this.player.y + lightRadius * Math.sin(endAngle);
                
            // Adjust beam based on wall collisions
            this.walls.forEachTile(tile => {
                if (tile.index !== -1) {
                    const tileRect = new Phaser.Geom.Rectangle(
                        tile.getLeft(),
                        tile.getTop(),
                        tile.width,
                        tile.height
                    );
                    
                    const triangleEdges = [
                        new Phaser.Geom.Line(this.player.x, this.player.y, endX1, endY1),
                        new Phaser.Geom.Line(this.player.x, this.player.y, endX2, endY2),
                        new Phaser.Geom.Line(endX1, endY1, endX2, endY2)
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
            
            this.flashlight.beginPath();
            this.flashlight.arc(this.player.x, this.player.y, lightRadius, angle - 0.4, angle + 0.2, false);
            this.flashlight.lineTo(this.player.x, this.player.y);
            this.flashlight.closePath();
            this.flashlight.fillPath();

            this.energyLevel -= 0.1; // Adjust as needed

            // Ensure energy doesn't go below 0
            this.energyLevel = Phaser.Math.Clamp(this.energyLevel, 0, 100);

            // Flash warning when energy is low
            if (this.energyLevel <= 20 && this.energyLevel > 0) {
                this.noBatteryText.setVisible(true);
                this.startFlashing();
            } else {
                this.noBatteryText.setVisible(false);
                this.stopFlashing();
            }
        } else {
            this.noBatteryText.setVisible(false);
            this.stopFlashing();
        }
    }

    updateEnergyBar() {
        // Update energy bar mask based on current energy level
        this.energyMaskGraphics.clear();
        this.energyMaskGraphics.fillStyle(0x000000);
        this.energyMaskGraphics.fillRect(10, 0, 200 * (this.energyLevel / 100), 20);

        this.energyBar.clear();
        this.energyBar.fillStyle(0xffffff);
        this.energyBar.fillRect(10, 10, 200 * (this.energyLevel / 100), 20);

        this.energyBar.setMask(this.energyMask);
    }

    startFlashing() {
        this.flashingInterval = setInterval(() => {
            this.flashlight.visible = !this.flashlight.visible; // Toggle visibility
        }, 100); // Flash interval of 100ms
    }

    stopFlashing() {
        clearInterval(this.flashingInterval);
        this.flashlight.visible = true; // Ensure flashlight is visible if not flashing
    }

    collectBattery(battery) {
        if (Phaser.Math.Distance.Between(this.player.x, this.player.y, battery.x, battery.y) <= 50) {
            this.energyLevel = 100; // Restaura a energia completa quando o jogador clica na bateria
            this.initialEnergyLevel = 100;
            battery.destroy(); // Remove a bateria do jogo
            this.updateEnergyBar(); // Atualiza a visualização da barra de energia
            if (this.energyLevel > 20) {
                this.noBatteryText.setVisible(false);  // Se a energia subir acima de 20%, esconde o texto de aviso
                this.noBatteryTween.stop(0);  // E para a animação de piscar
            }
        }
    }

    // Function to generate a valid random position
    getValidPosition(map, walls) {
        let position;
        let isValidPosition = false;

        while (!isValidPosition) {
            const x = Phaser.Math.Between(10, map.widthInPixels);
            const y = Phaser.Math.Between(10, map.heightInPixels);

            const tile = walls.getTileAtWorldXY(x, y);

            if (!tile && x > 0 && x < map.widthInPixels && y > 0 && y < map.heightInPixels) {
                position = { x: x, y: y };
                isValidPosition = true;
            }
        }
        return position;
    }

    handleGameOver() {
        this.scene.start('GameOver');
    }
}

window.GameScene = GameScene;
