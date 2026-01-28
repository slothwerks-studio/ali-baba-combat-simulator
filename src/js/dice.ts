// Dice rolling utilities

export function roll(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function d20(): number {
  return roll(1, 20);
}
