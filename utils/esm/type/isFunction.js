/**
 * Checks if a value is a function.
 *
 * @param {*} value   The value to check.
 * @returns {boolean} Whether that value is a function.
 */
const isFunction = (value) => value instanceof Function || typeof value === 'function';

export { isFunction as default };
