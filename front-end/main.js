import { initNinjaSprites, preloadNinja } from "./ninja";
import { preloadVillains } from "./villains";
import { setupWebcam } from "./webcam";
import { addLabel, train, predict, loadMobileNet } from "./model";
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
let webcamElement = document.getElementById("webcam");

let palmCount = 0, fistCount = 0;

export function setUpCamera(){
  Promise.all([setupWebcam(webcamElement), loadMobileNet()]).then(values => {
    document
      .getElementById("closed-fist")
      .addEventListener("click", function() {
        addLabel(webcamElement, 1);
        fistCount = fistCount + 1;
        if(fistCount < 20){
          document.getElementById('open-palm').hidden=true;
        }
        if(fistCount === 20){
          document.getElementById('closed-fist').disabled = true;
          document.getElementById('open-palm').hidden=false;
        }
      });

    document.getElementById("open-palm").addEventListener("click", function() {
      addLabel(webcamElement, 0);
      palmCount = palmCount + 1;
      if(palmCount < 20){
        document.getElementById('train').hidden = true;
      }
      if(palmCount === 20){
        document.getElementById('open-palm').disabled = true;
        document.getElementById('train').hidden= false;
      }
    });
    document.getElementById("train").addEventListener("click", function() {
      train().then(() => {
        document.getElementById('predict').hidden=false;
        // Game is ready here
        // document
        //   .getElementById("predict")
        //   .addEventListener("click", function() {
        //     predict();
        //   });
      });
    });
  });
}

export function startGame(){
  startPlaying = true;
}

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

// function startPredicting() {
//   while (true) {

//   }
// }

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
    },(player, obstacle) => {
        let delX, delY;
        let playerBottomRight = player.getBottomRight();
        let playerBottomLeft = player.getBottomLeft();
        let playerTopRight = player.getTopRight();

        let obstacleTopLeft = obstacle.getTopLeft();
        let obstacleTopRight = obstacle.getTopRight();
        let obstacleBottomLeft = obstacle.getBottomLeft();
        let obstacleBottomRight = obstacle.getBottomRight();

        if(obstacleBottomLeft.y == playerBottomRight.y){
          /* they are on the same ground*/
          delX = Math.abs(playerBottomRight.x - obstacleBottomLeft.x);
          delY = Math.min(playerTopRight.y, obstacleTopLeft.y);
          console.log("A  "+delX+"  <---->  "+delY);
        }else{
          /* now the collision could have happened while player climbing up or falling down*/
          let direction = (playerBottomRight.x - obstacleBottomLeft.x > 0) && (playerBottomRight.x - obstacleBottomRight.x < 0);
          if (direction) {
            /* this means that the collision happened while going up */
            delX = playerBottomRight.x - obstacleTopLeft.x;
            delY = playerBottomRight.y - obstacleTopLeft.y;
          } else {
            delX = obstacleTopRight.x - playerBottomLeft.x;
            delY = playerBottomLeft.y - obstacleTopRight.y;
          }
        }
        console.log(delX+"  <---->  "+delY);
        let percentage = (Math.abs(delX)*Math.abs(delY)) / (player.displayHeight* player.displayWidth);
        return percentage > 0.55;
    }
  );
  this.physics.add.collider(obstacles, platforms);
  lastObstacle = player;
}

let counter = 0;
function update() {
  let cursors = this.input.keyboard.createCursorKeys();
  counter++;
  if (startPlaying) {
    if (counter % 3 == 0) {
      predict(webcamElement).then(classId =>
        emitter.emit("prediction", classId)
      );
    }
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
  // if (cursors.space.isDown) {
  //   if (startPlaying) {
  //     player.setVelocityY(-120);
  //     player.anims.play("fly", true);
  //   }
  // } else {
  //   if (startPlaying) {
  //     player.setVelocityX(200);
  //     player.anims.play("run", true);
  //   }
  // }
}
