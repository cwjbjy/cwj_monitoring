import Core, { createMonitor } from './core';
import { ErrorPlugin } from './plugin/error';
import { PVPlugin } from './plugin/pv';
import { BehaviorPlugin } from './plugin/behavior';
import { PerformancePlugin } from './plugin/performance';
import { XHRPlugin } from './plugin/xhr';
import { FetchPlugin } from './plugin/fetch';
import { EMIT_TYPE } from './types/event';
export {
  Core,
  createMonitor,
  ErrorPlugin,
  PVPlugin,
  BehaviorPlugin,
  PerformancePlugin,
  XHRPlugin,
  FetchPlugin,
  EMIT_TYPE,
};
