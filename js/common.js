/*
==========================================
MathTeach 共用工具
作者：浪子傳說
==========================================
*/

/**
 * 產生指定範圍的亂數
 */
export function randomInteger(min, max) {
  return Math.floor(
    Math.random() * (max - min + 1)
  ) + min;
}

/**
 * 負數顯示為 (-5)
 * 正數顯示為 5
 */
export function formatInteger(number) {
  if (number < 0) {
    return `(${number})`;
  }

  return String(number);
}
