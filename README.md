# 介绍

一个简易的前端监控 SDK DEMO，仅供学习，请勿在生产环境中使用。

## 目前已实现的功能

1. 行为监控：点击监控，页面跳转监控，页面停留时间监控
2. 错误监控：js错误，资源加载错误，手动console.error抛出的错误，promise未捕获的错误
3. 性能监控：DCL、FP、FCP、LCP、Load、FPS

注：目前点击监控只支持button标签触发的点击事件

## 源码涉及的设计模式
1. 单例模式
2. 代理模式
3. 模板方法模式
4. 工厂方法模式
5. 责任链模式

## 安装

```
npm i cwj_monitoring
```

## 使用

```js
import { init , TYPES} from 'cwj_monitoring';

//使用 init 全局进行初始化
init({
  url: 'http://localhost:8080', //必传参数，数据上传服务器地址
  max: 10, //可选参数，最大缓存数，即超过缓存数立即上传，默认为5
  time: 60000, //可选参数，最大缓存时间，即超过最大缓存时间立即上传，默认30s
  plugin:[TYPES.ERROR,TYPES.CLICK,TYPES.PERFORMANCE,TYPES.ROUTER],//可选参数，错误事件，点击事件，性能指标，路由，传递几个就调用几个
  data: {}, //可选参数，初始化时外部传入的固定参数，例如项目的名称与版本号data:{vs:'0.1.1'}
});

//无论vue的全局错误捕获，还是react的错误边界，都可使用window.$track.emit手动上传错误
window.$track.emit(type, data);
```
