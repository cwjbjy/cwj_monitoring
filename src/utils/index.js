//发送数据
export const sendData = navigator.sendBeacon
  ? (url, data) => {
      navigator.sendBeacon(url, JSON.stringify(data));
    }
  : (url, data) => {
      let xhr = new XMLHttpRequest();
      xhr.open("POST", url);
      xhr.send(JSON.stringify(data));
    };