export enum TYPES {
  ERROR = 'error',
  CLICK = 'click',
  PERFORMANCE = 'performance',
  ROUTER = 'router',
}

export enum EMIT_RTYPE {
  ERROR_JS = 'error_js',
  ERROR_PROMISE = 'error_promise',
  ERROR_RESOURCE = 'error_resource',
  ROUTER_HASH = 'hashchange',
  ROUTER_HISTORY = 'historychange',
  PERFORMANCE_FP = 'performance_fp',
  PERFORMANCE_FCP = 'performance_fcp',
  PERFORMANCE_LCP = 'performance_lcp',
  PERFORMANCE_DOMCONTENTLOADED = 'performance_DOMContentLoaded',
  PERFORMANCE_LOAD = 'performance_load',
  BEHAVIOR_CLICK = 'click',
}
