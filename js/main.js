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
let player, cursors;

function preload() {
this.load.image('player', 'assets/poisson_dist.png');
}

function create() {
// Player setup
player = this.physics.add.sprite(400, 300, 'player');
player.setCollideWorldBounds(true);

// Input setup
cursors = this.input.keyboard.createCursorKeys();

// Mouse pointer setup
this.input.on('pointermove', function (pointer) {
    player.rotation = Phaser.Math.Angle.Between(player.x, player.y, pointer.x, pointer.y);
});
}

function update() {
// Player movement
player.setVelocity(0);  // Reset velocity

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
}