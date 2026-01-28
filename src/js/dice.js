// Dice rolling utilities

/**
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function roll(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * @returns {number}
 */
function d20() {
  return roll(1, 20);
}
