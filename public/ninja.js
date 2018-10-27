let ninja;

function preloadNinja(context){
  context.load.multiatlas('ninja', 'static/assets/ninja_run.json', 'static/assets/');
  context.load.multiatlas('ninjaFly', 'static/assets/ninja_fly.json', 'static/assets');
}

function initNinjaSprites(context, pos){
  let ninja = context.physics.add.sprite(pos.x, pos.y, 'ninja', '1.png').setOrigin(0, 0);

  let runFrames = context.anims.generateFrameNames('ninja', {
                         start: 1, end: 8, zeroPad: 0,
                         prefix: '', suffix: '.png'
                     });

  let flyFrames = context.anims.generateFrameNames('ninjaFly',{
                        start: 1, end: 7, zeroPad: 0,
                        prefix: '', suffix: '.png'
                  });

  context.anims.create({key: 'run', frames: runFrames, frameRate: 10, repeat: -1});
  context.anims.create({key: 'fly', frames: flyFrames, frameRate: 10, repeat: -1});

  return ninja;
}
