class InstructionsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'InstructionsScene' });
    }

    preload() {
        this.load.image('menu_background', 'assets/menu_background.png');
        this.load.image('back_button', 'assets/back_button.png');
        this.load.image('instructions_image', 'assets/instructions1.png'); // Load the instructions image
        this.load.image('fKeyboard', 'assets/keyboard_key_f.png'); // Load the F key image
        this.load.image('pointer', 'assets/mouse_cursor.png');
        this.load.image('click', 'assets/mouse_click.png');
    }

    create() {
        const { width, height } = this.sys.game.canvas;
    
        const instructionsText = this.add.text(width / 2, height / 2 - 250, 'Instructions', {
            fontSize: '64px', fill: '#CD853F'
        }).setOrigin(0.5);

        const movementInstructions = this.add.text(50, height / 2 - 140, 'Press the keys shown on the side to move the player:', {
            fontSize: '24px', fill: '#FFFFFF', align: 'left', wordWrap: { width: width / 2 - 70 }
        }).setOrigin(0, 0.5);

        // Display the instructions image, moved slightly upwards
        const instructionsImage = this.add.image(width - 220, height / 2 - 140, 'instructions_image').setOrigin(0.5).setScale(0.8);

        const flashlightInstructions = this.add.text(50, height / 2 - 20, 'Press "F" to toggle the flashlight on and off:', {
            fontSize: '24px', fill: '#FFFFFF', align: 'left', wordWrap: { width: width / 2 - 70 }
        }).setOrigin(0, 0.5);

        const fKeyboard = this.add.image(width - 220, height / 2 - 20, 'fKeyboard').setOrigin(0.5).setScale(0.1); // Smaller F key image

        const pointerInstruction = this.add.text(50, height / 2 + 100, 'Move the mouse to point the flashlight:', {
            fontSize: '24px', fill: '#FFFFFF', align: 'left', wordWrap: { width: width / 2 - 70 }
        }).setOrigin(0, 0.5);

        const pointer = this.add.image(width - 220, height / 2 + 100, 'pointer').setOrigin(0.5).setScale(0.05); // Smaller pointer image

        const clickInstruction = this.add.text(50, height / 2 + 220, 'Click to recharge the flashlight battery:', {
            fontSize: '24px', fill: '#FFFFFF', align: 'left', wordWrap: { width: width / 2 - 70 }
        }).setOrigin(0, 0.5);

        const click = this.add.image(width - 220, height / 2 + 220, 'click').setOrigin(0.5).setScale(0.1); // Smaller click image

        // Position the back button at the top left corner
        const backButton = this.add.image(80, 50, 'back_button').setInteractive().setScale(0.5);
        backButton.on('pointerover', () => backButton.setScale(0.6));
        backButton.on('pointerout', () => backButton.setScale(0.5));
        backButton.on('pointerdown', () => {
            this.scene.start('MainMenu');
        });
    }
}

window.InstructionsScene = InstructionsScene;
