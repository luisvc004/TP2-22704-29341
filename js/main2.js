﻿var config = {
    type: Phaser.WEBGL,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

var tilesprite;
var spotlight;
var flashingInterval;

function preload () {
    // this.load.image('brick', ['assets/normal-maps/brick.jpg', 'assets/normal-maps/brick_n.png']);
}

function create () {
    tilesprite = this.add.tileSprite(400, 300, 800, 600, 'brick').setPipeline('Light2D');

    this.lights.enable();
    this.lights.setAmbientColor(0x808080);

    spotlight = this.lights.addLight(400, 300, 280).setIntensity(3);

    this.input.on('pointermove', function (pointer) {
        spotlight.x = pointer.x;
        spotlight.y = pointer.y;
    });

    // Start the flashing effect
    startFlashing();

    var i = 0;
    this.input.on('pointerdown', (pointer) => {
        if (i === 1) {
            this.lights.active = true;
            i = 0;
        } else {
            this.lights.active = false;
            i = 1;
        }
    });
}

function update () {
    tilesprite.tilePositionX += 0.3;
    tilesprite.tilePositionY += 0.6;
}

function startFlashing() {
    flashingInterval = setInterval(() => {
        spotlight.visible = !spotlight.visible;
    }, 500); // Adjust the interval as needed
}

function stopFlashing() {
    clearInterval(flashingInterval);
    spotlight.visible = true;
}
