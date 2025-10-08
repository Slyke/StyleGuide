/**
 * Interpolates a string template with values from an object or array.
 *
 * @param {string} template - The string containing placeholders to be interpolated.
 * @param {Object|Array} values - An object or array containing values to replace the placeholders.
 * @param {string|boolean} [fallback=""] - Value to use when a placeholder's corresponding key is not found.
 *                                         If set to `true`, the placeholder itself is used as the fallback.
 *
 * @returns {string} - The interpolated string.
 *
 * @example
 * // Object as values
 * interpolate("Hello, {$name}", { name: "John" }) // Returns "Hello, John"
 *
 * // Array as values
 * interpolate("Hello, {#1}", ["John"]) // Returns "Hello, John"
 *
 * // Using fallback
 * interpolate("Hello, {$name}", {}, "Unknown") // Returns "Hello, Unknown"
 * interpolate("Hello, {$name}", {}, true) // Returns "Hello, {$name}"
 */
export const interpolate = (template, values, fallback = "") => {
  const isArr = Array.isArray(values);
  const pattern = isArr ? /{#([1-9][0-9]*|n)}/g : /{\$([a-zA-Z_][a-zA-Z0-9_]*)}/g;

  let idx = 0;

  return template.replace(pattern, (match, key) => {
    let val;

    if (isArr) {
      if (key === "n") {
        val = values[idx];
        idx++;
      } else {
        val = values[Number.parseInt(key, 10) - 1];
      }
    } else {
      val = values[key];
    }

    if (val !== undefined) {
      return val;
    }

    return fallback === true ? match : fallback;
  });
};
