import { track } from "./index";

export default function behavior() {
  ["click"].forEach(function (eventType) {
    let timer: NodeJS.Timeout;
    document.addEventListener(
      eventType,
      (e) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          const target = e.target;
          //目前只处理button标签的点击事件
          if (target instanceof HTMLButtonElement) {
            track.emit(eventType, target.textContent);
          }
        }, 300);
      },
      true
    );
  });
}
