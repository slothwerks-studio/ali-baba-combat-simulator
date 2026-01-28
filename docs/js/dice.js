// Dice rolling utilities

function roll(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function d20() {
  return roll(1, 20);
}
