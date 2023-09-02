import { track } from '../index';

import DefinePlugin from './definePlugin';

class BehaviorPlugin extends DefinePlugin {
  constructor() {
    super('behavior');
  }

  monitor(): void {
    ['click'].forEach(function (eventType) {
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
        true,
      );
    });
  }
}

export default new BehaviorPlugin();
