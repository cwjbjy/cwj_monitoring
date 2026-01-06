# 🚀 CWJ 前端监控 SDK

> 现代化、轻量级的前端监控 SDK，适用于 Web 应用。轻松追踪用户行为、性能指标和错误信息。

[![npm version](https://img.shields.io/npm/v/cwj_monitoring)](https://www.npmjs.com/package/cwj_monitoring)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.1-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ 功能特性

### 📊 全面监控

- **🔍 行为追踪** - 点击事件、页面导航、用户旅程
- **⚡ 性能指标** - Core Web Vitals (LCP, FID, CLS, FCP, TTFB)、页面加载时间
- **❌ 错误追踪** - JavaScript 错误、资源加载失败、Promise 拒绝、控制台错误
- **🛣️ 路由监控** - SPA 导航追踪（Hash 和 History 模式）

### 🎯 开发者友好

- **TypeScript 优先** - 完整的类型安全
- **插件架构** - 模块化和可扩展设计，支持上下文注入和高度配置化
- **自定义全局变量** - 避免命名冲突

### 🔒 安全与性能

- **批量与重试** - 优化的数据传输，自动重试机制

---

## 📦 安装

```bash
npm install cwj_monitoring
```

## 🚀 快速开始

### 基础用法

```typescript
import { createMonitor, ErrorPlugin, PerformancePlugin, XHRPlugin, FetchPlugin } from 'cwj_monitoring';

const monitor = createMonitor({
  url: 'https://your-api.com/collect', // 必填：数据收集接口
  data: {
    appVersion: '1.2.3',
    environment: 'production',
  },
});

monitor.use(ErrorPlugin()).use(PerformancePlugin()).use(XHRPlugin()).use(FetchPlugin()).run();
```

---

## ⚙️ 配置

**配置项：**

| 属性        | 类型                  | 必填 | 默认值   | 描述                         |
| :---------- | :-------------------- | :--- | :------- | :--------------------------- |
| `url`       | `string`              | ✅   | -        | 数据收集的后端 URL           |
| `data`      | `Record<string, any>` | ❌   | `{}`     | 附加到所有事件的自定义元数据 |
| `transport` | `TransportConfig`     | ❌   | 见下文   | 数据传输设置                 |
| `globalKey` | `string`              | ❌   | `$track` | 挂载在 window 上的全局变量名 |

**TransportConfig：**

```typescript
interface TransportConfig {
  maxBatchSize?: number; // 默认：累积 5 个事件后发送
  maxWaitTime?: number; // 默认：30000ms，或 30 秒后发送
}
```

---

## 🔌 插件

所有插件都支持在构造函数中传入 `filter` 函数来过滤不需要记录的事件。

### 错误插件 (`ErrorPlugin`)

捕获 JS 错误、资源加载失败、Promise 拒绝和 console.error。支持通过 `filter` 过滤特定错误。

### 性能插件 (`PerformancePlugin`)

追踪 Core Web Vitals 和页面加载性能。支持通过 `filter` 过滤特定指标。

### 行为插件 (`BehaviorPlugin`)

监控用户点击交互。支持通过 `filter` 过滤特定元素，支持通过 `throttleDelay` 设置点击节流时间（默认 500ms）。

### 路由插件 (`PVPlugin`)

追踪单页应用的页面跳转。支持通过 `filter` 过滤特定路由。

### XHR 插件 (`XHRPlugin`)

监控 XMLHttpRequest 请求详情，仅记录失败的请求（状态码非 2xx）。支持通过 `filter` 根据 URL 或方法过滤请求。

### Fetch 插件 (`FetchPlugin`)

监控 fetch 请求详情，仅记录失败的请求（状态码非 2xx 或网络错误）。支持通过 `filter` 根据 URL 或方法过滤请求。

---

## 🎯 进阶用法

### 自定义全局变量名

```typescript
import { createMonitor } from 'cwj_monitoring';

createMonitor({
  url: '...',
  globalKey: '$myMonitor',
}).run();

// 使用自定义键名发送事件
window.$myMonitor.emit('custom_event', { foo: 'bar' });
```

### 插件高级配置 (过滤)

你可以为插件传入配置对象，例如只监控特定按钮的点击：

```typescript
import { createMonitor, BehaviorPlugin, XHRPlugin } from 'cwj_monitoring';

const monitor = createMonitor({ url: '...' });

monitor
  .use(
    BehaviorPlugin({
      // 只记录带有 data-track 属性的元素点击
      filter: (el) => el.hasAttribute('data-track'),
      // 点击节流时间
      throttleDelay: 300,
    }),
  )
  .use(
    XHRPlugin({
      // 忽略特定 API 的错误监控
      filter: (method, url) => !url.includes('/ignore-api/'),
    }),
  )
  .run();
```

---

## 📊 数据格式

```typescript
interface MonitoringPayload {
  device: {
    browser: { name: string; version: string };
    os: { name: string; version: string };
    platform: { type: string };
    ratio: number;
    wh: { width: number; height: number };
  };
  uuid: string; // 唯一访客 ID（指纹）
  type: string; // 事件类型
  data: any; // 事件特定数据
  date: string; // ISO 8601 时间戳
  userData?: object; // 你的自定义元数据
}
```

---

## 🛠️ 开发

```bash
npm install
npm run dev    # 开发模式
npm run build  # 生产构建
npm run lint   # 代码检查
```

---

## 📄 许可证

MIT © [cwjbjy](https://github.com/cwjbjy)
