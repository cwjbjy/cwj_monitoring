import DefinePlugin from './definePlugin';
import Core from '../core';
import { EMIT_TYPE } from '../types/event';
import { TYPES } from '../types/event';

class BehaviorPlugin extends DefinePlugin {
  constructor() {
    super(TYPES.CLICK);
  }

  monitor(track: Core): void {
    this.track = track;
    this.setupClickListeners();
  }

  private setupClickListeners() {
    const handleClick = (e: Event) => {
      const target = e.target;
      if (target instanceof HTMLButtonElement) {
        this.track?.emit(EMIT_TYPE.BEHAVIOR_CLICK, target.textContent);
      }
    };

    const listener = (e: Event) => {
      setTimeout(() => handleClick(e), 300);
    };

    document.addEventListener(EMIT_TYPE.BEHAVIOR_CLICK, listener, true);
  }
}

export default new BehaviorPlugin();
