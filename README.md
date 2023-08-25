# monitor

一个简易的前端监控 SDK DEMO，仅供学习，请勿在生产环境中使用。

## DEMO

克隆项目后，执行命令打开服务器。

```
npm run server
```

然后用 vscode 的 `live server` 插件访问 index.html 文件，即可尝试体验监控 SDK 的效果。同时打开开发者工具，点击 network 标签，可以看到上报数据的发送请求。

## 目前已实现的功能

1. 行为监控：点击监控，页面跳转监控，页面停留时间监控
2. 错误监控：js错误，资源加载错误，手动console.error抛出的错误，promise未捕获的错误
3. 性能监控：FP、DCL、Load、FPS

## 通过 npm 使用

安装

```
npm i cwj_monitoring
```

引入

```js
import { init, emit } from "cwj_monitoring";

//使用 init 全局进行初始化
init({ 
  url: "http://localhost:8080", //数据上传服务器地址
  max: 10, //可选参数，最大缓存数，即超过缓存数立即上传，默认为5
  time: 60000, //可选参数，最大缓存时间，即超过最大缓存时间立即上传，默认30s
});

//无论vue的全局错误捕获，还是react的错误边界，都可使用emit手动上传错误
emit(type,data)
```