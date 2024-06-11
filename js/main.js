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
let player, cursors, keys;

function preload() {
    this.load.image('player', 'assets/poisson_dist.png');
}

function create() {
    // Player setup
    player = this.physics.add.sprite(400, 300, 'player');
    player.setCollideWorldBounds(true);

    // Input setup for WASD keys and arrow keys
    keys = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        right: Phaser.Input.Keyboard.KeyCodes.D,
        upArrow: Phaser.Input.Keyboard.KeyCodes.UP,
        downArrow: Phaser.Input.Keyboard.KeyCodes.DOWN,
        leftArrow: Phaser.Input.Keyboard.KeyCodes.LEFT,
        rightArrow: Phaser.Input.Keyboard.KeyCodes.RIGHT,
    });

    // Mouse pointer setup
    this.input.on('pointermove', function (pointer) {
        player.rotation = Phaser.Math.Angle.Between(player.x, player.y, pointer.x, pointer.y);
    });
}

function update() {
    // Reset player velocity
    player.setVelocity(0);

    // Player movement using WASD keys
    if (keys.left.isDown || keys.leftArrow.isDown) {
        player.setVelocityX(-160);
    } else if (keys.right.isDown || keys.rightArrow.isDown) {
        player.setVelocityX(160);
    }

    if (keys.up.isDown || keys.upArrow.isDown) {
        player.setVelocityY(-160);
    } else if (keys.down.isDown || keys.downArrow.isDown) {
        player.setVelocityY(160);
    }
}

// Start the game
game.scene.start
