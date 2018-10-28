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
    transparent: true,
    scene: { preload, create }
});

function preload(){
  this.load.setBaseURL('/');
  preloadVillains(this);
}

function create(){
  let villains = initVillains(this, {x:0,y:400});

  let vc = 1;
  setInterval(() => {
    villains.anims.play('villain_'+(vc++ % 6));
  }, 1000);
}
let villains;
function preloadVillains(context){
    context.load.multiatlas('villains', 'static/assets/villains.json', 'static/assets');
}
function initVillains(context, pos){
  let villains = context.add.sprite(pos.x, pos.y, 'villains', '1.png');
  for (let i = 1; i <= 5; i++) {
    let frame = context.anims.generateFrameNames('villains', {
      start: i, end:i, zeroPad: 0,
      prefix: '', suffix: '.png'
    });
    context.anims.create({key: 'villain_'+i, frames: frame, frameRate:10, repeat:-1});
  }
  return villains;
}
