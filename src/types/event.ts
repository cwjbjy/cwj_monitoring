/**
 * 插件类型标识符
 * 用于插件注册和配置
 */
export enum TYPES {
  ERROR = 'error',
  CLICK = 'click',
  PERFORMANCE = 'performance',
  ROUTER = 'router',
  XHR = 'xhr',
  FETCH = 'fetch',
}

/**
 * 事件发送类型标识符
 * 用于向追踪系统发送事件时使用
 */
export enum EMIT_TYPE {
  // 错误事件
  ERROR = 'error',

  // 行为事件
  CLICK = 'click',
  ROUTE_CHANGE = 'route_change',

  // 性能事件 - Core Web Vitals
  PERFORMANCE_FP = 'performance_fp',
  PERFORMANCE_FCP = 'performance_fcp',
  PERFORMANCE_LCP = 'performance_lcp',
  PERFORMANCE_INP = 'performance_inp',
  PERFORMANCE_LONGTASK = 'performance_longtask',
  PERFORMANCE_RESOURCE = 'performance_resource',
  PERFORMANCE_LOAF = 'performance_loaf',

  // XHR 事件
  XHR = 'xhr',
  FETCH = 'fetch',

  // 自定义事件
  CUSTOM = 'custom',
}
