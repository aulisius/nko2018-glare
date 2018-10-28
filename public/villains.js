
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
