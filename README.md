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
- **插件架构** - 模块化和可扩展设计

### 🔒 隐私与性能

- **可配置采样** - 智能减少数据量
- **批量与重试** - 优化的数据传输，自动重试机制

---

## 📦 安装

```bash
npm install cwj_monitoring
```

或使用 yarn：

```bash
yarn add cwj_monitoring
```

---

## 🚀 快速开始

### 基础用法

```typescript
import { init, TYPES } from 'cwj_monitoring';

init({
  url: 'https://your-api.com/collect', // 必填：数据收集接口地址
  plugin: [
    // 可选：指定要启用的插件
    TYPES.ERROR, // 错误追踪
    TYPES.CLICK, // 点击追踪
    TYPES.PERFORMANCE, // 性能监控
    TYPES.ROUTER, // 路由追踪
  ],
  data: {
    // 可选：自定义元数据
    appVersion: '1.2.3',
    environment: 'production',
    userId: 'user-123',
  },
});
```

### 高级配置

```typescript
import { init } from 'cwj_monitoring';

init({
  url: 'https://your-api.com/collect',

  transport: {
    maxBatchSize: 10, // 累积 10 个事件后发送
    maxWaitTime: 30000, // 或 30 秒后发送
    retry: true, // 失败时重试
    maxRetries: 3, // 最大重试次数
  },
});
```

---

## 📖 API 参考

### 核心 SDK

#### `init(options: Options): void`

使用配置选项初始化监控 SDK。

**配置项：**

| 属性        | 类型                  | 必填 | 默认值   | 描述                         |
| ----------- | --------------------- | ---- | -------- | ---------------------------- |
| `url`       | `string`              | ✅   | -        | 数据收集的后端 URL           |
| `plugin`    | `PluginType[]`        | ❌   | 所有插件 | 要启用的插件数组             |
| `data`      | `Record<string, any>` | ❌   | `{}`     | 附加到所有事件的自定义元数据 |
| `transport` | `TransportConfig`     | ❌   | 见下文   | 数据传输设置                 |

**TransportConfig：**

```typescript
interface TransportConfig {
  maxBatchSize?: number; // 默认：5
  maxWaitTime?: number; // 默认：30000ms
  retry?: boolean; // 默认：true
  maxRetries?: number; // 默认：3
}
```

### 手动事件追踪

```typescript
// 访问追踪器实例
window.$track.emit('ERROR_TYPE', {
  message: '自定义错误信息',
  customField: 'value',
});

// 或使用事件类型
import { EMIT_TYPE } from 'cwj_monitoring';

window.$track.emit(EMIT_TYPE.CUSTOM, {
  eventName: 'button_click',
  buttonId: 'submit-form',
  timestamp: Date.now(),
});
```

---

## 🎯 错误边界集成

### Vue3 错误边界

```typescript
app.config.errorHandler = (err, instance, info) => {
  // 处理错误，例如：报告给一个服务
  window.$track.emit('vue_error', info);
};
```

### React 错误边界

```typescript
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    window.$track.emit('ERROR_TYPE', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      boundary: 'ErrorBoundary',
    });
  }
}
```

---

## 📊 数据格式

发送到后端的事件遵循以下结构：

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
# 安装依赖
npm install

# 开发模式（监听）
npm run dev

# 类型检查
npm run type-check

# 生产构建
npm run build

# 代码检查
npm run lint

# 代码格式化
npm run format
```

---

## 🤝 参与贡献

欢迎贡献！请随时提交 Pull Request。

1. Fork 本仓库
2. 创建你的功能分支（`git checkout -b feature/amazing-feature`）
3. 提交你的更改（`git commit -m '添加某个很棒的功能'`）
4. 推送到分支（`git push origin feature/amazing-feature`）
5. 打开一个 Pull Request

---

## 📄 许可证

MIT © [cwjbjy](https://github.com/cwjbjy)

---

## 🔗 链接

- [GitHub 仓库](https://github.com/cwjbjy/cwj_monitoring)
- [NPM 包](https://www.npmjs.com/package/cwj_monitoring)
- [问题追踪](https://github.com/cwjbjy/cwj_monitoring/issues)

---

## ⚠️ 浏览器支持

- Chrome/Edge：最新 2 个版本
- Firefox：最新 2 个版本
- Safari：最新 2 个版本
- iOS Safari：最新 2 个版本

---

**由开发者用❤️为开发者打造**
