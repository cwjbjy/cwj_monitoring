//发送数据
export const sendData = navigator.sendBeacon
  ? (url: string, data: any) => {
      navigator.sendBeacon(url, JSON.stringify(data));
    }
  : (url: string, data: any) => {
      let xhr = new XMLHttpRequest();
      xhr.open("POST", url);
      xhr.send(JSON.stringify(data));
    };

export function isValidKey(
  key: string | number | symbol,
  object: object
): key is keyof typeof object {
  return key in object;
}
