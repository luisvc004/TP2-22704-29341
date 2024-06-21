class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.image('tileset', 'assets/tileset.png');
        this.load.image('battery', 'assets/battery.png');
        this.load.image('lever', 'assets/lever/lever.png');
        this.load.image('victory', 'assets/victory.png'); // Load the victory image

        this.load.tilemapTiledJSON('map', 'assets/levels/tileset.json');

        this.load.spritesheet('player', 'assets/red_player.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('enemy_run', 'assets/enemy1/run.png', { frameWidth: 40, frameHeight: 39 });
        this.load.spritesheet('enemy_attack', 'assets/enemy1/attack.png', { frameWidth: 126, frameHeight: 39 });
        this.load.spritesheet('enemy_idle', 'assets/enemy1/idle.png', { frameWidth: 40, frameHeight: 39 });

        this.load.audio('start_sound', 'assets/horror-background-atmosphere.mp3');
        this.load.audio('game_over_sound', 'assets/jump-scare-sound.mp3');
    }

    init(data) {
        this.backgroundSound = data.backgroundSound;
        if (this.backgroundSound) {
            this.backgroundSound.stop();
        }
        this.backgroundSound = this.sound.add('start_sound', { loop: true });
        this.backgroundSound.play();
        this.gameStarted = false;
    }

    create(data) {
        // Initial game setup

        this.physics.world.createDebugGraphic();

        const battery_number = 6;
        const enemy_speed = 70;

        const cursors = this.input.keyboard.createCursorKeys();

        const map = this.make.tilemap({ key: 'map' });
        const tileset = map.addTilesetImage('tileset', 'tileset');

        const backgroundLayer = map.createLayer('Ground', tileset, 0, 0).setPipeline('Light2D');
        const furniture = map.createLayer('Furniture', tileset, 0, 0).setPipeline('Light2D');
        const walls = map.createLayer('Wall', tileset, 0, 0);
       // const door_open = map.createLayer('Door_Open', tileset, 0, 0);
        walls.setCollisionByExclusion([-1]);

        const player = this.physics.add.sprite(400, 300, 'player').setScale(1.3).setCollideWorldBounds(true);

        this.lights.enable();
        this.lights.setAmbientColor(0x000000);

        let spotlight = this.lights.addLight(player.x, player.y, 60).setIntensity(4);
        let spotlight2 = this.lights.addLight(player.x, player.y, 90).setIntensity(3);


        this.lights.addLight(430, 25, 70).setIntensity(1);
        this.lights.addLight(530, 25, 70).setIntensity(1);
        this.lights.addLight(310, 50, 70).setIntensity(1.5);

        let default_spotlight = this.lights.addLight(player.x, player.y, 30).setIntensity(1.5);


        const enemyPosition = this.getValidPosition(map, walls);

        const enemyRun = this.physics.add.sprite(enemyPosition.x, enemyPosition.y, ['enemy_run', 'enemy_attack']).setScale(1.6).setPipeline('Light2D');
        enemyRun.setInteractive();

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

        // Add the lever images
        const lever1 = this.createLever(50, 50, 90);
        lever1.setPipeline('Light2D');
        const lever2 = this.createLever(this.cameras.main.width - 50, 50, 180);
        lever2.setPipeline('Light2D');
        const lever3 = this.createLever(50, this.cameras.main.height - 50, 90);
        lever3.setPipeline('Light2D');
        const lever4 = this.createLever(this.cameras.main.width - 50, this.cameras.main.height - 50, 270);
        lever4.setPipeline('Light2D');

        this.levers = [lever1, lever2, lever3, lever4];

        const eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        this.cursors = cursors;
        this.physics.add.collider(player, walls);
        this.physics.add.collider(enemyRun, walls);
        this.physics.add.overlap(enemyRun, player, () => {
            // this.enemyRun.anims.play('enemy_attack'); // nao ta a dar
        });

        const toggleLightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);

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
            frames: this.anims.generateFrameNumbers('enemy_attack', { start: 0, end: 7 }),
            frameRate: 7,
            repeat: -1
        });

        player.anims.play('player_idle');
        enemyRun.anims.play('enemy_run');

        const energyBar = this.add.graphics().fillStyle(0xffffff).fillRect(player.x - 25, player.y - 30, 50, 5);

        const energyMaskGraphics = this.make.graphics().fillStyle(0x000000).fillRect(player.x - 25, player.y - 30, 50, 5);

        const energyMask = energyMaskGraphics.createGeometryMask();

        energyBar.setMask(energyMask);

        const noBatteryText = this.add.text(50, 50, 'Low Battery', {
            font: '18px Arial',
            fill: '#ff0000',
            align: 'left'
        }).setVisible(false);

        const noBatteryTween = this.tweens.add({
            targets: noBatteryText,
            alpha: 0,
            duration: 500,
            ease: 'Linear',
            yoyo: true,
            repeat: -1
        }).stop();

        this.player = player;
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
        this.default_spotlight = default_spotlight;
        this.enemyRun = enemyRun;
        this.eKey = eKey;
        this.map = map;
        this.tileset = tileset;
        this.enemy_speed = enemy_speed;
        this.startCountdown();
    }

    update() {
        const { cursors, player, toggleLightKey, spotlight, spotlight2, default_spotlight, enemyRun, enemy_speed } = this;

        if (!this.gameStarted) {
            return;
        }

        if (Phaser.Input.Keyboard.JustDown(toggleLightKey) && this.energyLevel > 0) {
            this.isLightOn = !this.isLightOn;
            if (!this.isLightOn) {
                this.initialEnergyLevel = this.energyLevel;
            } else if (this.initialEnergyLevel > 0) {
                this.energyLevel = this.initialEnergyLevel;
            }
            this.updateSpotlights();
        }


        player.setVelocity(0);
        let velocityX = 0;
        let velocityY = 0;

        if (cursors.left.isDown || this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A).isDown) {
            velocityX = -50;
            player.setFlipX(true);
        } else if (cursors.right.isDown || this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D).isDown) {
            velocityX = 50;
            player.setFlipX(false);
        }

        if (this.enemyRun.x > player.x) {
            this.enemyRun.setFlipX(true);
        } else {
            this.enemyRun.setFlipX(false);
        }

        if (cursors.up.isDown || this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W).isDown) {
            velocityY = -110;
        } else if (cursors.down.isDown || this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S).isDown) {
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
        this.updateFlashlight();

        const distance = Phaser.Math.Distance.Between(
            this.enemyRun.x,
            this.enemyRun.y,
            this.player.x,
            this.player.y
        );

        if (this.isLightOn && this.energyLevel > 0 && (enemyRun.getBounds().contains(spotlight.x, spotlight.y) || enemyRun.getBounds().contains(spotlight2.x, spotlight2.y))) {
            enemyRun.setVelocity(0, 0);
            enemyRun.anims.play('enemy_idle', true);
        } else {
            enemyRun.anims.play('enemy_run', true);
            const angle = Phaser.Math.Angle.Between(enemyRun.x, enemyRun.y, player.x, player.y);
            enemyRun.setVelocity(Math.cos(angle) * enemy_speed, Math.sin(angle) * enemy_speed);
        }

        if (!this.isLightOn) {
            enemyRun.anims.play('enemy_run', true);
            const angle = Phaser.Math.Angle.Between(enemyRun.x, enemyRun.y, player.x, player.y);
            enemyRun.setVelocity(Math.cos(angle) * enemy_speed, Math.sin(angle) * enemy_speed);
        }

        if (distance <= 40 && this.physics.add.overlap(enemyRun, player)) {
            this.handleGameOver();
        }

        // Update energy bar position
        this.energyBar.x = player.x - 25; // Adjust position as needed
        this.energyBar.y = player.y - 30; // Adjust position as needed
        this.energyMaskGraphics.x = this.energyBar.x;
        this.energyMaskGraphics.y = this.energyBar.y;

        this.updateSpotlights();

        // Check if player is near any lever and 'E' key is pressed
        this.levers.forEach(lever => {
            if (Phaser.Math.Distance.Between(player.x, player.y, lever.x, lever.y) <= 50) {
                if (Phaser.Input.Keyboard.JustDown(this.eKey) && !lever.clicked) {
                    lever.flipX = !lever.flipX; // Inverte a imagem em Y
                    lever.clicked = true; // Marque a alavanca como clicada
                }
            }
        });

        // Check if all levers are activated and player is at the center
      /*  if (this.allLeversActivated() && this.isPlayerAtCenter()) {
            this.handleVictory();
        }*/

        if (this.allLeversActivated() && this.isPlayerAtDoor()) {
            this.handleVictory();
        }
        
    }

    createLever(x, y, angle) {
        const lever = this.physics.add.sprite(x, y, 'lever').setScale(0.03).setInteractive();
        lever.setOrigin(0.5, 0.5);
        lever.angle = angle;
        lever.clicked = false; // Adicione a propriedade clicked

        lever.on('pointerdown', () => {
            if (!lever.clicked) {
                lever.flipX = !lever.flipX; // Inverte a imagem em Y
                lever.clicked = true; // Marque a alavanca como clicada
            }
        });
    
        return lever;
    }

    updateSpotlights() {
        if (this.isLightOn && this.energyLevel > 0) {
            const cursor = this.input.activePointer;
            const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, cursor.x, cursor.y);
            const spotlightRadius = 40; // Set the radius for the spotlight
            const spotlight2Radius = 100;

            this.spotlight.x = this.player.x + spotlightRadius * Math.cos(angle);
            this.spotlight.y = this.player.y + spotlightRadius * Math.sin(angle);

            this.spotlight2.x = this.player.x + spotlight2Radius * Math.cos(angle - 0.2); // Slight offset for the second spotlight
            this.spotlight2.y = this.player.y + spotlight2Radius * Math.sin(angle - 0.2);

            this.spotlight.setVisible(true);
            this.spotlight2.setVisible(true);

          /*  this.default_spotlight.x = this.player.x;
            this.default_spotlight.y = this.player.y;*/

        } else {
            this.spotlight.setVisible(false);
            this.spotlight2.setVisible(false);
        }

 
    }

    startCountdown() {
        const countdownText = this.add.text(this.sys.game.config.width / 2, this.sys.game.config.height / 2, '3', {
            fontSize: '64px', fill: '#ffffff'
        }).setOrigin(0.5);

        let countdown = 3;
        const countdownTimer = this.time.addEvent({
            delay: 1000, // 1 segundo
            callback: () => {
                countdown--;
                countdownText.setText(countdown);
                if (countdown === 0) {
                    countdownTimer.remove();
                    countdownText.destroy();
                    this.gameStarted = true; // Unlock the game
                }
            },
            callbackScope: this,
            loop: true
        });
    }

    updateFlashlight() {
        if (this.isLightOn && this.energyLevel > 0) {
            this.energyLevel -= 0.03; // Ajuste conforme necessário

            // Garanta que a energia não desça abaixo de 0
            this.energyLevel = Phaser.Math.Clamp(this.energyLevel, 0, 100);

            // Flash de aviso quando a energia estiver baixa
            if (this.energyLevel <= 20 && this.energyLevel > 0) {
                this.noBatteryText.setVisible(true);
              //  this.startFlashing();
            } else {
                this.noBatteryText.setVisible(false);
              //  this.stopFlashing();
            }
        } else {
            this.isLightOn = false;
            this.noBatteryText.setVisible(false);
           // this.stopFlashing();
        }
    }

    updateEnergyBar() {
        this.energyMaskGraphics.clear();
        this.energyMaskGraphics.fillStyle(0x000000);
        this.energyMaskGraphics.fillRect(0, 0, 50 * (this.energyLevel / 100), 5);

        this.energyBar.clear();
        this.energyBar.fillStyle(0xffffff);
        this.energyBar.fillRect(0, 0, 50 * (this.energyLevel / 100), 5);

        this.energyBar.setMask(this.energyMask);
    }

    startFlashing() {
        this.flashingInterval = setInterval(() => {
            this.spotlight.visible = !this.spotlight.visible; // Toggle visibility
            this.spotlight2.visible = !this.spotlight2.visible; // Toggle visibility
        }, 100); // Flash interval of 100ms
    }

    stopFlashing() {
        clearInterval(this.flashingInterval);
        this.spotlight.visible = true; // Ensure spotlight is visible if not flashing
        this.spotlight2.visible = true; // Ensure spotlight2 is visible if not flashing
    }

    collectBattery(battery) {
        if (Phaser.Math.Distance.Between(this.player.x, this.player.y, battery.x, battery.y) <= 50) {
            this.energyLevel = 100; // Restaura a energia completa quando o jogador clica na bateria
            this.initialEnergyLevel = 100;
            battery.destroy(); // Remove a bateria do jogo
            this.updateEnergyBar(); // Atualiza a visualização da barra de energia
            if (this.energyLevel > 20) {
                this.noBatteryText.setVisible(false); // Se a energia subir acima de 20%, esconde o texto de aviso
                this.noBatteryTween.stop(0); // E para a animação de piscar
            }
        }
    }

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
        if (this.backgroundSound) {
            this.backgroundSound.stop();
        }
        this.gameOverSound = this.sound.add('game_over_sound');
        this.gameOverSound.play();

        this.scene.start('GameOver');
    }

    allLeversActivated() {
        return this.levers.every(lever => lever.clicked);
    }

    
  /*  this.lights.addLight(430, 25, 70).setIntensity(1);
    this.lights.addLight(530, 25, 70).setIntensity(1);
    this.lights.addLight(310, 50, 70).setIntensity(1.5);*/

    isPlayerAtDoor() {
       // const centerX = this.sys.game.config.width / 2;
       // const centerY = this.sys.game.config.height / 2;
       if(this.allLeversActivated()){
            console.log("LEVERS ACTIVATED: FINISH");
            this.map.createLayer('Door_Open', this.tileset, 0, 0);
           // this.map.destroyLayer('Wall', this.tileset, 0, 0);
       } else {
            console.log("Dor is closed, search for the LEVERS");
       }
        const tolerance = 50;
        return Phaser.Math.Distance.Between(this.player.x, this.player.y , 435, 25) <= tolerance;
    }


    //modificar tela de vitoria
    handleVictory() {
        if (this.backgroundSound) {
            this.backgroundSound.stop();
        }

        //const backgroundLayer = map.createLayer('Ground', tileset, 0, 0).setPipeline('Light2D');
        //const furniture = map.createLayer('Furniture', tileset, 0, 0).setPipeline('Light2D');
        //const walls = map.createLayer('Wall', tileset, 0, 0);
        console.log("WIN");
    
        // Create a white background
      /*  const graphics = this.add.graphics();
        graphics.fillStyle(0xffffff, 1);
        graphics.fillRect(0, 0, this.sys.game.config.width, this.sys.game.config.height);
    
        // Add the victory text
        const victoryText = this.add.text(this.sys.game.config.width / 2, this.sys.game.config.height / 2, 'EZ WIN', {
            font: '64px Arial',
            fill: '#000000',
            align: 'center'
        }).setOrigin(0.5);
    
        // Pause the game physics
        this.physics.pause();*/
    }
}

window.GameScene = GameScene;
