/**
 * 插件类型标识符
 * 用于插件注册和配置
 */
export enum TYPES {
  ERROR = 'error',
  CLICK = 'click',
  PERFORMANCE = 'performance',
  ROUTER = 'router',
}

/**
 * 事件发送类型标识符
 * 用于向追踪系统发送事件时使用
 */
export enum EMIT_TYPE {
  // 错误事件
  ERROR = 'error',

  // 行为事件
  BEHAVIOR_CLICK = 'click',
  ROUTE_CHANGE = 'route_change',

  // 性能事件 - Core Web Vitals
  PERFORMANCE_FP = 'performance_fp',
  PERFORMANCE_FCP = 'performance_fcp',
  PERFORMANCE_LCP = 'performance_lcp',
  PERFORMANCE_CLS = 'performance_cls',
  PERFORMANCE_FID = 'performance_fid',
  PERFORMANCE_INP = 'performance_inp',
  PERFORMANCE_TTFB = 'performance_ttfb',

  // 性能事件 - 页面加载
  PERFORMANCE_DOMCONTENTLOADED = 'performance_DOMContentLoaded',
  PERFORMANCE_LOAD = 'performance_load',

  // 性能事件 - 可选
  PERFORMANCE_FPS = 'performance_fps',

  // 自定义事件
  CUSTOM = 'custom',
}
