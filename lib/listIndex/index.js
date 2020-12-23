/**
 * Create padded list index (1. )
 * @param {number} num
 * @param {number} width
 * @returns {string}
 */
exports.listIndex = (num, width) => num.toString().padStart(width, ' ') + '. ';
