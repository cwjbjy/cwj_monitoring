/* 正则表达式：验证url */
export function isValidURL(url: string) {
  const pattern = new RegExp(
    '^(https?:\\/\\/)?' +
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' +
      '((\\d{1,3}\\.){3}\\d{1,3}))' +
      '(\\:\\d+)?' +
      '(\\/[-a-z\\d%_.~+]*)*' +
      '(\\?[;&a-z\\d%_.~+=-]*)?' +
      '(\\#[-a-z\\d_]*)?$',
    'i',
  );
  return pattern.test(url);
}

/* 正则表达式：验证正整数 */
export function isValidInteger(number: number) {
  return /^\d+$/.test(number.toString());
}
