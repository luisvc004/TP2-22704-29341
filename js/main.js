const config = {
    type: Phaser.AUTO,
    width: 800,
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
    }
};

const game = new Phaser.Game(config);
let player, flashlight, cursors;
let enemy, taskComplete = false;
let enemySound, taskSound;

function preload() {
    this.load.image('player', 'assets/player.png');
    this.load.image('enemy', 'assets/enemy.png');
    this.load.image('task', 'assets/task.png');
    this.load.audio('enemySound', 'assets/enemySound.mp3');
    this.load.audio('taskSound', 'assets/taskSound.mp3');
}

function create() {
    // Player setup
    player = this.physics.add.sprite(400, 300, 'player');
    player.setCollideWorldBounds(true);

    // Flashlight setup
    flashlight = this.add.circle(player.x, player.y, 100).setAlpha(0.3);

    // Enemy setup
    enemy = this.physics.add.sprite(200, 150, 'enemy');
    enemy.setAlpha(0);

    // Task setup
    const task = this.physics.add.staticGroup();
    task.create(600, 300, 'task');

    // Sound setup
    enemySound = this.sound.add('enemySound');
    taskSound = this.sound.add('taskSound');

    // Input setup
    cursors = this.input.keyboard.createCursorKeys();

    // Mouse pointer setup
    this.input.on('pointermove', function (pointer) {
        player.rotation = Phaser.Math.Angle.Between(player.x, player.y, pointer.x, pointer.y);
    });

    // Collision setup
    this.physics.add.overlap(player, task, completeTask, null, this);
}

function update() {
    // Player movement
    player.setVelocity(0);
    if (cursors.left.isDown) {
        player.setVelocityX(-160);
    } else if (cursors.right.isDown) {
        player.setVelocityX(160);
    }

    if (cursors.up.isDown) {
        player.setVelocityY(-160);
    } else if (cursors.down.isDown) {
        player.setVelocityY(160);
    }

    // Flashlight position
    flashlight.setPosition(player.x, player.y);

    // Check for enemy visibility
    if (Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y) < flashlight.radius) {
        enemy.setAlpha(1);
    } else {
        enemy.setAlpha(0);
    }

    // Play sound if enemy is near
    if (Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y) < 200) {
        if (!enemySound.isPlaying) {
            enemySound.play();
        }
    } else {
        enemySound.stop();
    }
}

function completeTask(player, task) {
    if (!taskComplete) {
        taskSound.play();
        taskComplete = true;
        // Here you can add logic for completing the task
    }
}
