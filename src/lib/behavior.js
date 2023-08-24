import { emit } from "./index";

export default function behavior() {
  click(); //点击事件监听
}

function click() {
  window.addEventListener("click", function (e) {
    emit("click", e.target.innerHTML);
  });
}
