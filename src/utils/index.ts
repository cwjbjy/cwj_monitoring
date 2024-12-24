/* 发送数据 */
export const sendData = (url: string, data: any) => {
  navigator.sendBeacon(url, JSON.stringify(data));
};

export function isValidKey(key: string | number | symbol, object: object): key is keyof typeof object {
  return key in object;
}

export function getErrorId(val: string) {
  return window.btoa(decodeURIComponent(encodeURIComponent(val)));
}
