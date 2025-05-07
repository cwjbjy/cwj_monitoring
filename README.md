# 🚀 前端监控 SDK DEMO

> ⚠️ **注意**：这是一个简易的前端监控 SDK DEMO，仅供学习使用，请勿在生产环境中使用！

## 🌟 功能概览

| 功能类别       | 具体功能                                                                 | 状态 |
|----------------|--------------------------------------------------------------------------|------|
| **行为监控**   | 🔍 点击监控、🔄 页面跳转监控、⏱️ 页面停留时间监控                         | ✅   |
| **错误监控**   | ❌ JS错误、🖼️ 资源加载错误、💻 console.error错误、🤞 Promise未捕获错误     | ✅   |
| **性能监控**   | ⚡ DCL、FP、FCP、LCP、Load、FPS 等性能指标                                | ✅   |

## 📦 安装

```bash
npm install cwj_monitoring
```

## 🛠️ 使用指南

1.基础用法

```js
import { init, TYPES } from 'cwj_monitoring';

init({
  url: 'http://localhost:8080', // 🔴 必填 - 数据上报地址
  max: 10,                      // 🔵 可选 - 最大缓存数(默认5)
  time: 60000,                  // 🔵 可选 - 最大缓存时间(默认30s)
  plugin: [                     // 🔵 可选 - 要启用的插件，不传plugin则启动所有插件
    TYPES.ERROR,                // 错误监控
    TYPES.CLICK,               // 点击监控  
    TYPES.PERFORMANCE,         // 性能监控
    TYPES.ROUTER               // 路由监控
  ],
  data: {                      // 🔵 可选 - 自定义元数据
    vs: '0.1.1',               // 版本号
    env: 'production'          // 环境标识
  }
});
```
2.手动上报错误
```js
// 适用于Vue/React等框架的错误捕获
window.$track.emit('ERROR_TYPE', {
  message: '自定义错误信息',
  // 其他错误详情...
});
```
## 🤝 参与贡献
欢迎提交Issue或PR！🎉