import { emit } from "./index";

export default function behavior() {
  click(); //点击事件监听
}

function click() {
  let timer: NodeJS.Timeout;
  window.addEventListener("click", (e) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const target = e.target as HTMLElement;
      emit("click", {
        textContent: target.textContent,
        tagName: target.tagName,
        classList: target.classList,
      });
    }, 500);
  });
}
