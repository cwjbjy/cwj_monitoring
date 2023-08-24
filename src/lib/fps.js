import { emit } from "./index";

let count = 0;
let frames = 0;
let lastTimestamp = performance.now();

//timestamp开始执行函数的时间戳
export default function updateFPS(timestamp) {
  frames++;

  const deltaTime = timestamp - lastTimestamp;
  if (deltaTime >= 1000) {
    const fps = Math.round(frames / (deltaTime / 1000));
    if (fps < 20) {
      count++;
      if (count >= 3) {
        //连续3次小于20的fps进行数据上报
        emit("fps", '卡顿');
        count = 0;
      }
    } else {
      count--;
      if (count < 0) count = 0;
    }
    frames = 0;
    lastTimestamp = timestamp;
  }

  requestAnimationFrame(updateFPS);
}
