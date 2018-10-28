export function preloadVillains(context) {
  for (let i = 1; i <= 5; i++) {
    context.load.image(`villain_${i}`, `assets/villains/${i}.png`);
  }
}
