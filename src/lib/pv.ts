import { track } from "./index";

export default function pv() {
  Hash(); //监听hash路由
  History(); //监听history路由
}

function Hash() {
  window.addEventListener("hashchange", function () {
    track.emit("hashchange");
  });
}

function History() {
  const historyPushState = window.history.pushState;
  const historyReplaceState = window.history.replaceState;
  window.history.pushState = function () {
    //@ts-ignore
    historyPushState.apply(window.history, arguments);
    track.emit("historychange");
  };
  window.history.replaceState = function () {
    //@ts-ignore
    historyReplaceState.apply(window.history, arguments);
    track.emit("historychange");
  };
  window.addEventListener("popstate", function () {
    track.emit("historychange");
  });
}
