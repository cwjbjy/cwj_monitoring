import { emit } from "./index";

export default function pv() {
    Hash(); //监听hash路由
    History(); //监听history路由
}

function Hash() {
  window.addEventListener("hashchange", function () {
    emit("hashchange");
  });
}

function History() {
  const historyPushState = window.history.pushState;
  const historyReplaceState = window.history.replaceState;
  window.history.pushState = function () {
    historyPushState.apply(window.history, arguments);
    emit("historychange");
  };
  window.history.replaceState = function () {
    historyReplaceState.apply(window.history, arguments);
    emit("historychange");
  };
  window.addEventListener("popstate", function () {
    emit("historychange");
  });
}
