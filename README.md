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
- **插件架构** - 模块化和可扩展设计，支持 Tree-shaking
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
import { init, ErrorPlugin, PerformancePlugin } from 'cwj_monitoring';

init({
  url: 'https://your-api.com/collect', // 必填：数据收集接口
  plugin: [ErrorPlugin, PerformancePlugin], // 可选：启用的插件
  data: {
    // 可选：自定义元数据
    appVersion: '1.2.3',
    environment: 'production',
    userId: 'user-123',
  },
});
```

---

## ⚙️ 配置

**配置项：**

| 属性        | 类型                  | 必填 | 默认值   | 描述                         |
| :---------- | :-------------------- | :--- | :------- | :--------------------------- |
| `url`       | `string`              | ✅   | -        | 数据收集的后端 URL           |
| `plugin`    | `IPlugin[]`           | ❌   | `[]`     | 要启用的插件实例数组         |
| `data`      | `Record<string, any>` | ❌   | `{}`     | 附加到所有事件的自定义元数据 |
| `transport` | `TransportConfig`     | ❌   | 见下文   | 数据传输设置                 |
| `globalKey` | `string`              | ❌   | `$track` | 挂载在 window 上的全局变量名 |

**TransportConfig：**

```typescript
interface TransportConfig {
  maxBatchSize?: number; // 默认：累积 5 个事件后发送
  maxWaitTime?: number; // 默认：30000ms，或 30 秒后发送
  retry?: boolean; // 默认：true，失败时重试
  maxRetries?: number; // 默认：3，最大重试次数
}
```

---

## 🔌 插件

### 错误插件 (`ErrorPlugin`)

捕获 JS 错误、资源加载失败、Promise 拒绝和 console.error。

### 性能插件 (`PerformancePlugin`)

追踪 Core Web Vitals 和页面加载性能。

### 行为插件 (`BehaviorPlugin`)

监控用户点击交互。

### 路由插件 (`PVPlugin`)

追踪单页应用的页面跳转。

---

## 🎯 进阶用法

### 自定义全局变量名

```typescript
init({
  url: '...',
  globalKey: '$myMonitor',
});

// 使用自定义键名发送事件
window.$myMonitor.emit('custom_event', { foo: 'bar' });
```

### 手动事件追踪

```typescript
import { init, ErrorPlugin } from 'cwj_monitoring';

init({ url: '...' });

// 默认挂载在 window.$track
window.$track.emit('BUSINESS_ERROR', {
  code: 500,
  message: '支付失败',
});
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
