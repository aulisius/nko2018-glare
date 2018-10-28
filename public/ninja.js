let ninja;

function preloadNinja(context) {
  context.load.multiatlas('ninja', 'public/assets/ninja_run.json', 'public/assets/');
  context.load.multiatlas('ninjaFly', 'public/assets/ninja_fly.json', 'public/assets');
}

function initNinjaSprites(context, pos) {
  let ninja = context.physics.add.sprite(pos.x, pos.y, 'ninja', '0.png').setOrigin(0, 0);

  let runFrames = context.anims.generateFrameNames('ninja', {
    start: 1, end: 7, zeroPad: 0,
    prefix: '', suffix: '.png'
  });

  let flyFrames = context.anims.generateFrameNames('ninjaFly', {
    start: 1, end: 7, zeroPad: 0,
    prefix: '', suffix: '.png'
  });

  let turnFrame = context.anims.generateFrameNames('turn', {
    start: 0, end: 0,
    prefix: '', suffix: '.png'
  });

  context.anims.create({ key: 'run', frames: runFrames, frameRate: 10, repeat: -1 });
  context.anims.create({ key: 'turn', frames: turnFrame, frameRate: 10 });
  context.anims.create({ key: 'fly', frames: flyFrames, frameRate: 10, repeat: -1 });

  return ninja;
}
