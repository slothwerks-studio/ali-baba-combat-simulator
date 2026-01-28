// Dice rolling utilities
export function roll(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
export function d20() {
    return roll(1, 20);
}
//# sourceMappingURL=dice.js.map