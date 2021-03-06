import { addLabel, loadMobileNet, predict, train } from "./model";
import { initNinjaSprites, preloadNinja } from "./ninja";
import { preloadVillains } from "./villains";
import { setupWebcam } from "./webcam";
let Height = window.innerHeight * 0.6;
let Width = window.innerWidth * 0.6;
let counter = 0;
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
let score = 0;
let scoreDOM = null;
let player, platforms, obstacles;
let firstTurn = true;
let startPlaying = false;
let webcamElement = document.getElementById("webcam");

let palmCount = 0, fistCount = 0;

export function setUpCamera() {
    Promise.all([setupWebcam(webcamElement), loadMobileNet()]).then(values => {
        document.getElementById('closed-fist').hidden = false;
        let message = document.getElementById("message");
        message.innerText = `We'll start with the motion for coming down. We'll need 20 of those. 
        Hold your hand like a closed fist (recommended) and keep pressing on the button below`
        document
            .getElementById("closed-fist")
            .addEventListener("click", function () {
                addLabel(webcamElement, 1);
                fistCount = fistCount + 1;
                if (fistCount < 20) {
                    message.innerHTML = `<b>${20 - fistCount}</b> sample${20 - fistCount === 1 ? "" : "s"} left.`
                    document.getElementById('open-palm').hidden = true;
                }
                if (fistCount === 20) {
                    message.innerText = "Time for going up! Open your palm and keep it close to the webcam such that the entire hand is captured. We'll need 20 of these too";
                    document.getElementById('closed-fist').hidden = true;
                    document.getElementById('open-palm').hidden = false;
                }
            });

        document.getElementById("open-palm").addEventListener("click", function () {
            addLabel(webcamElement, 0);
            palmCount = palmCount + 1;
            if (palmCount < 20) {
                message.innerHTML = `<b>${20 - palmCount}</b> sample${20 - palmCount === 1 ? "" : "s"} left.`
            }
            if (palmCount === 20) {
                message.innerText = "Calibrating...";
                document.getElementById('open-palm').hidden = true;
                train().then(() => {
                    message.innerText = "We are now ready to go!";
                    document.getElementById('predict').hidden = false;
                    // Game is ready here
                });
            }
        });
    }).catch(console.error);
}

export function startGame() {
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
        player.setVelocityY(-110);
        player.anims.play("fly", true);
    } else {
        player.setVelocityY(200);
        player.anims.play("run", true);
    }
}

function create() {
    emitter.on("prediction", predictionHandler, this);
    platforms = this.physics.add.staticGroup();
    obstacles = this.physics.add.group();
    var style = { font: "65px Arial", fill: "#ff0044", align: "center" };

    platforms
        .create(-10, -40, "platform")
        .setOrigin(0, 0)
        .setScale(1000, 1)
        .refreshBody();

    platforms
        .create(-10, Height - 100, "platform")
        .setOrigin(0, 0)
        .setScale(1000, 1)
        .refreshBody();
    player = initNinjaSprites(this, { x: 0, y: 0 });
    player.setVelocity(0);
    player.setGravityY(500);
    this.cameras.main.startFollow(player, true, 0.1, 0.05);
    this.cameras.main.setFollowOffset(50, 0);
    scoreDOM = this.add.text(0, 0, String(score).padStart(3, 0), style).setScrollFactor(0);

    this.physics.add.collider(player, platforms);
    this.physics.add.overlap(
        player,
        obstacles,
        (_player, obstacle) => {
            player.disableBody(true);
            this.physics.pause();
            startPlaying = false;
            this.cameras.main.fadeOut(1500);
            // TODO:  store score in redis
            document.getElementById("score").hidden = false;
            document.getElementById("score").innerText = score;
            $("#score-modal").iziModal('open');
            score = 0;
            counter = 0;
        },
        (player, obstacle) => {
            let delX, delY;
            let playerBottomRight = player.getBottomRight();
            let playerBottomLeft = player.getBottomLeft();
            let playerTopRight = player.getTopRight();

            let obstacleTopLeft = obstacle.getTopLeft();
            let obstacleTopRight = obstacle.getTopRight();
            let obstacleBottomLeft = obstacle.getBottomLeft();
            let obstacleBottomRight = obstacle.getBottomRight();

            if (obstacleBottomLeft.y == playerBottomRight.y) {
                /* they are on the same ground*/
                delX = Math.abs(playerBottomRight.x - obstacleBottomLeft.x);
                delY = Math.min(playerTopRight.y, obstacleTopLeft.y);
                console.log("A  " + delX + "  <---->  " + delY);
            } else {
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
            let percentage = (Math.abs(delX) * Math.abs(delY)) / (player.displayHeight * player.displayWidth);
            return percentage > 0.51;
        }
    );
    this.physics.add.collider(obstacles, platforms);
    lastObstacle = player;

}

async function update() {
    if (startPlaying) {
        player.setVelocityX(120);
        counter++;
        if (counter % 3 == 0) {
            await predict(webcamElement).then(classId =>
                emitter.emit("prediction", classId)
            );
        }
        if (player.x >= lastObstacle.x) {
            lastObstacle = obstacles
                .create(
                    lastObstacle.x + Width - 10,
                    Height - 292,
                    `villain_${Phaser.Math.Between(1, 5)}`
                )
                .setOrigin(0, 0);
            if (!firstTurn) {
                score += 100;
                scoreDOM.setText(score);
            } else {
                firstTurn = false;
            }

        }
    }
}
