let villains;
function preloadVillains(context) {
  for (let i = 1; i <= 5; i++) {
    context.load.image(`villain_${i}`, `public/assets/villains/${i}.png`);
  }
}
