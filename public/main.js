let game = new Phaser.Game({
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 }
        }
    },
    scene: { preload, create, update }
});
let player, platforms, obstacles;

function preload() {
    this.load.setBaseURL('/');

    this.load.image('sky', 'static/assets/space3.png');
    this.load.image('logo', 'static/assets/phaser.png');
    this.load.image('blue', 'static/assets/blue.png');
    this.load.image('platform', 'static/assets/platform.png');
    this.load.spritesheet('dude', 'static/assets/dude.png', { frameWidth: 32, frameHeight: 48 });
}

function create() {
    // this.add.image(0, 0, 'sky').setOrigin(0, 0);

    platforms = this.physics.add.staticGroup();
    obstacles = this.physics.add.staticGroup();

    platforms.create(0, window.innerHeight - 200, 'platform').setOrigin(0, 0).setScale(100).refreshBody();

    // let particles = this.add.particles('blue');

    // let emitter = particles.createEmitter({
    //     speed: 10,
    //     scale: { start: 1, end: 0 },
    //     blendMode: 'NORMAL'
    // });

    // emitter.startFollow(logo);

    player = this.physics.add.sprite(130, 30, 'dude').setScale(2).setOrigin(0, 0);

    player.setBounce(0.2);
    player.setGravityY(300)
    // player.setCollideWorldBounds(true);

    this.anims.create({
        key: 'turn',
        frames: [{ key: 'dude', frame: 4 }],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    this.cameras.main.setViewport(0, window.innerHeight - 200, window.innerWidth, window.innerHeight).setOrigin(0, 0)
    this.cameras.main.startFollow(player, true)
    this.cameras.main.setLerp(0.1)
    this.cameras.main.setZoom(0.8)
    this.cameras.main.setFollowOffset(10)

    this.physics.add.collider(player, platforms);
    this.physics.add.overlap(player, obstacles, () => {
        console.log('clash')
        player.setVelocityX(0);
        this.cameras.main.stopFollow()
    });
    this.physics.add.collider(obstacles, platforms);
}

function update() {
    let cursors = this.input.keyboard.createCursorKeys();
    player.setVelocityX(160);
    player.anims.play('right', true);

    if (cursors.up.isDown) {
        let r = this.cameras.main.getWorldPoint(window.innerWidth, player.y);
        obstacles.create(r.x, player.y, 'dude').setOrigin(0, 0).setScale(2).refreshBody()
    }
}