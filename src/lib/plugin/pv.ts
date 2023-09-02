import { track } from "../index";
import DefinePlugin from "./definePlugin";

class PVPlugin extends DefinePlugin {
  constructor() {
    super("pv");
  }
  monitor(): void {
    this.Hash(); //监听hash路由
    this.History(); //监听history路由
  }

  Hash() {
    window.addEventListener("hashchange", function () {
      track.emit("hashchange");
    });
  }

  History() {
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
}

export default new PVPlugin();
