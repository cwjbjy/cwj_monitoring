/* 将时间戳转为年月日 */
export const getDate = (time: number) => {
  const date = new Date(time);
  const year = date.getFullYear();
  const month = date.getMonth() + 1; //获取系统月份，由于月份是从0开始计算，所以要加1
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  const formatter = (date: number) => {
    let res = '';
    if (date < 10) {
      res = '0' + date;
    } else {
      res = date.toString();
    }
    return res;
  };

  return (
    year +
    '-' +
    formatter(month) +
    '-' +
    formatter(day) +
    ' ' +
    formatter(hour) +
    ':' +
    formatter(minute) +
    ':' +
    formatter(second)
  );
};

/* 将两个时间戳转为秒 */
export const getSeconds = (timestamp1: number, timestamp2: number) => {
  if (timestamp1 < timestamp2) {
    [timestamp1, timestamp2] = [timestamp2, timestamp1];
  }

  return Math.floor((timestamp1 - timestamp2) / 1000);
};
