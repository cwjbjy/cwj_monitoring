import { emit } from "./index";

export default function behavior() {
  click(); //点击事件监听
}

function click() {
  let timer: NodeJS.Timeout;
  window.addEventListener("click", (e) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      console.log(e);
      emit("click", (e.target as HTMLElement).innerHTML);
    }, 500);
  });
}
