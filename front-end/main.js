import { initNinjaSprites, preloadNinja } from "./ninja";
import { preloadVillains } from "./villains";

let Height = window.innerHeight * 0.8;
let Width = window.innerWidth * 0.8;
let game = new Phaser.Game({
  type: Phaser.AUTO,
  width: Width,
  height: Height,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 200 }
    }
  },
  canvas: document.getElementById("glare"),
  transparent: true,
  scene: { preload, create, update }
});
let emitter = new Phaser.Events.EventEmitter();
let lastObstacle = null;
// let score = 0;
let player, platforms, obstacles;
let startPlaying = false;

function preload() {
  this.load.setBaseURL("/");

  this.load.image("sky", "assets/space3.png");
  this.load.image("blue", "assets/blue.png");
  this.load.image("platform", "assets/platform.png");
  this.load.spritesheet("dude", "assets/dude.png", {
    frameWidth: 32,
    frameHeight: 48
  });
  preloadNinja(this);
  preloadVillains(this);
}

function predictionHandler(prediction) {
  if (prediction == 0) {
    player.setVelocityY(-120);
    player.anims.play("fly", true);
  } else {
    player.setVelocityX(200);
    player.anims.play("run", true);
  }
}

function startPredicting() {
  while (true) {
    predict().then(classId => emitter.emit("prediction", classId));
  }
}

function create() {
  // this.add.image(0, 0, 'sky').setOrigin(0, 0);

  platforms = this.physics.add.staticGroup();
  obstacles = this.physics.add.staticGroup();

  platforms
    .create(0, Height - 100, "platform")
    .setOrigin(0, 0)
    .setScale(1000, 1)
    .refreshBody();

  // let particles = this.add.particles('blue');

  // let emitter = particles.createEmitter({
  //     speed: 10,
  //     scale: { start: 1, end: 0 },
  //     blendMode: 'NORMAL'
  // });

  // emitter.startFollow(logo);

  player = initNinjaSprites(this, { x: 0, y: Height - 250 });
  emitter.on("prediction", predictionHandler, this);
  player.setGravityY(500);
  // this.cameras.main.setViewport(0, Height, Width, Height).setOrigin(0, 0)
  this.cameras.main.startFollow(player, true, 0.1);
  this.cameras.main.setFollowOffset(100, 0);

  this.physics.add.collider(player, platforms);
  // TODO: Improve this
  this.physics.add.overlap(
    player,
    obstacles,
    (_player, obstacle) => {
      player.disableBody(true);
      this.physics.pause();
      this.cameras.main.stopFollow();
      startPlaying = false;
      // console.log(score);
    },
    (p, o) => {
      let pos = p.getTopLeft();
      let pWidth = p.width;
      let pHeight = p.height;
      return false;
    }
  );
  this.physics.add.collider(obstacles, platforms);
}

function update() {
  let cursors = this.input.keyboard.createCursorKeys();

  if (startPlaying) {
    if (player.x >= lastObstacle.x) {
      // score += 100;
      lastObstacle = obstacles
        .create(
          lastObstacle.x + Width,
          lastObstacle.y - 5,
          `villain_${Phaser.Math.Between(1, 5)}`
        )
        .setBounce(0.2)
        .setOrigin(0, 0)
        .refreshBody();
    }
  }

  // if (cursors.down.isDown) {
  //     platforms.create(currentX, Height - 100, 'platform')
  //         .setOrigin(0, 0)
  //         .setGravityY(0)
  //         .setScale(1000, 1)
  //         .refreshBody();
  // } else
  if (cursors.space.isDown) {
    if (startPlaying) {
      player.setVelocityY(-120);
      player.anims.play("fly", true);
    } else {
      startPlaying = true;
      lastObstacle = player;
    }
  } else {
    if (startPlaying) {
      player.setVelocityX(200);
      player.anims.play("run", true);
    }
  }
}
