class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.image('tileset', 'assets/tileset.png');
        this.load.image('battery', 'assets/battery.png');
        this.load.tilemapTiledJSON('map', 'assets/levels/tileset.json');
        this.load.spritesheet('player', 'assets/red_player.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('enemy_run', 'assets/enemy1/run.png', { frameWidth: 40, frameHeight: 39 });
        this.load.spritesheet('enemy_idle', 'assets/enemy1/idle.png', { frameWidth: 40, frameHeight: 39 });
    }

    create() {
        // Initial game setup
        
        const battery_number = 8;

        const cursors = this.input.keyboard.createCursorKeys();

        const map = this.make.tilemap({ key: 'map' });
        const tileset = map.addTilesetImage('tileset', 'tileset');
        
        const backgroundLayer = map.createLayer('Ground', tileset, 0, 0);
        
        const walls = map.createLayer('Wall', tileset, 0, 0);
        walls.setCollisionByExclusion([-1]);

        const player = this.physics.add.sprite(400, 300, 'player').setScale(1.3).setCollideWorldBounds(true);
        
        const enemyPosition = this.getValidPosition(map, walls);
        
        const enemyIdle = this.physics.add.sprite(enemyPosition.x, enemyPosition.y, 'enemy_idle').setScale(1.3);
        const enemyRun = this.physics.add.sprite(enemyPosition.x, enemyPosition.y, 'enemy_run').setScale(1.6);

        const batteries = this.physics.add.group();

        for (let i = 0; i < battery_number; i++) { // Changed to iterate from 0 to 7 (8 batteries)
            const batteryPosition = this.getValidPosition(map, walls);
            const battery = batteries.create(batteryPosition.x, batteryPosition.y, 'battery').setScale(0.055);
            battery.setInteractive();
            battery.on('pointerdown', () => this.collectBattery(battery));
        }

        this.cursors = cursors;
        this.physics.add.collider(player, walls);
        this.physics.add.collider(enemyRun, walls);
        this.physics.add.overlap(enemyRun, player, () => {
            // Logic when enemy collides with player
        });
        
        const toggleLightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        
        const flashlight = this.add.graphics();
        
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
            frames: this.anims.generateFrameNumbers('enemy_run', { frames: [1, 4, 7, 10, 13, 16, 19] }), 
            frameRate: 7, 
            repeat: -1 
        });
        
        this.anims.create({ 
            key: 'enemy_idle', 
            frames: this.anims.generateFrameNumbers('enemy_idle', { frames: [1, 4, 7, 10] }), 
            frameRate: 10, 
            repeat: -1 
        });

        player.anims.play('player_idle');
        enemyRun.anims.play('enemy_run');

        const energyBar = this.add.graphics().fillStyle(0xffffff).fillRect(player.x, player.y, 200, 200);
        
        const energyMaskGraphics = this.make.graphics().fillStyle(0x000000).fillRect(0, 0, 200, 20);
        
        const energyMask = energyMaskGraphics.createGeometryMask();
        
        energyBar.setMask(energyMask);

        const noBatteryText = this.add.text(50, 50, 'Low Battery', { font: '18px Arial', fill: '#ff0000', align: 'left' }).setOrigin(0);
        
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
    }

    update() {
        const { cursors, player, toggleLightKey } = this;

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
        
        this.updateEnergyBar();
        this.updateFlashlight.call(this);
        
        const distance = Phaser.Math.Distance.Between(
            this.enemyRun.x,
            this.enemyRun.y,
            this.player.x,
            this.player.y
        );

        const enemy_speed = 80; // Define enemy speed here

        if (distance < 100000) {
            this.enemyRun.anims.play('enemy_run', true);
            const angle = Phaser.Math.Angle.Between(this.enemyRun.x, this.enemyRun.y, player.x, player.y);
            this.enemyRun.setVelocity(Math.cos(angle) * enemy_speed, Math.sin(angle) * enemy_speed);
        } else {
            this.enemyRun.setVelocity(0); // Stop enemy if player is out of range
            this.enemyRun.anims.play('enemy_idle', true); // Idle animation for enemy
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
            
            const flashlightBeam = new Phaser.Geom.Triangle(
                this.player.x, this.player.y,
                endX1, endY1,
                endX2, endY2
            );
            
            this.flashlight.beginPath();
            this.flashlight.moveTo(flashlightBeam.x1, flashlightBeam.y1);
            this.flashlight.lineTo(flashlightBeam.x2, flashlightBeam.y2);
            this.flashlight.lineTo(flashlightBeam.x3, flashlightBeam.y3);
            this.flashlight.closePath();
            this.flashlight.fillPath();

            this.energyLevel -= 0.1; // Adjust as needed

            // Ensure energy doesn't go below 0
            this.energyLevel = Phaser.Math.Clamp(this.energyLevel, 0, 100);

            // Flash warning when energy is low
            if (this.energyLevel <= 20 && this.energyLevel > 0) {
                this.noBatteryText.setVisible(true);

                // Fazer o texto piscar lentamente
                this.noBatteryTween.timeScale = 0.5; // Reduz a velocidade da animação pela metade
                this.noBatteryTween.play();
                this.startFlashing();
            } else if (this.energyLevel <= 0) {
                this.noBatteryText.setVisible(false);
                this.noBatteryTween.stop();
                this.stopFlashing();

                // Mostrar texto "No battery" quando a energia acabar
                this.noBatteryText.setText('No battery');
                this.noBatteryText.setVisible(true);
            } else {
                this.noBatteryText.setVisible(false);
                this.noBatteryTween.stop();
                this.stopFlashing();
            }
        } else {
            this.noBatteryText.setVisible(false);
            this.noBatteryTween.stop();
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
        /*else if (Phaser.Math.Distance.Between(player.x, player.y, battery.x, battery.y) > 50) {
            
        }*/
    }

    // Function to generate a valid random position
    getValidPosition(map, walls) {
        let position;
        let isValidPosition = false;
        
        while (!isValidPosition) {
            const x = Phaser.Math.Between(10, map.widthInPixels);
            const y = Phaser.Math.Between(10, map.heightInPixels);

            const tile = walls.getTileAtWorldXY(x, y);

            if (!tile) {
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
