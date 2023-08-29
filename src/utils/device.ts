// 获取浏览器名称
export let getBrowserNameVersion = () => {
  const browser = (() => {
    let userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.indexOf("opera") > -1 || userAgent.indexOf("opr") > -1) {
      return {
        browser: "Opera",
        browser_version: userAgent.match(/ope?ra?\/([\d.]+)/)?.[1],
      };
    } else if (
      userAgent.indexOf("compatible") > -1 &&
      userAgent.indexOf("msie") > -1
    ) {
      return {
        browser: "IE",
        browser_version:
          userAgent.match(/(msie\s|trident.*rv:)([\w.]+)/)?.[2] || "IE",
      };
    } else if (userAgent.indexOf("edg") > -1) {
      return {
        browser: "Edge",
        browser_version: userAgent.match(/edge?\/([\d.]+)/)?.[1],
      };
    } else if (userAgent.indexOf("firefox") > -1) {
      return {
        browser: "Firefox",
        browser_version: userAgent.match(/firefox\/([\d.]+)/)?.[1],
      };
    } else if (check360() && userAgent.indexOf("safari") > -1) {
      return {
        browser: "360浏览器",
        browser_version: "Chromium browser",
      };
    } else if (userAgent.includes("2345explorer")) {
      return {
        browser: "2345浏览器",
        browser_version:
          userAgent.match(/2345explorer\/([\d.]+)/)?.[1] || "Chromium browser",
      };
    } else if (userAgent.indexOf("bidubrowser") > -1) {
      return {
        browser: "百度浏览器",
        browser_version:
          userAgent.match(/bidubrowser\/([\d.]+)/)?.[1] || "Chromium browser",
      };
    } else if (userAgent.indexOf("se 2.x") > -1) {
      return { browser: "搜狗浏览器", browser_version: "Chromium browser" };
    } else if (
      userAgent.indexOf("safari") > -1 &&
      userAgent.indexOf("chrome") === -1
    ) {
      return {
        browser: "Safari",
        browser_version: userAgent.match(/version\/([\d.]+)/)?.[1],
      };
    } else if (/qqbrowser/.test(userAgent)) {
      return {
        browser: "QQ浏览器",
        browser_version: userAgent.match(/qqbrowser\/([\d.]+)/)?.[1],
      };
    } else if (/micromessenger/i.test(userAgent)) {
      return {
        browser: "微信浏览器",
        browser_version: userAgent.match(/micromessenger\/([\d.]+)/)?.[1],
      };
    } else if (
      userAgent.indexOf("chrome") > -1 &&
      userAgent.indexOf("safari") > -1
    ) {
      return {
        browser: "Chrome",
        browser_version: userAgent.match(/chrome\/([\d.]+)/)?.[1],
      };
    } else {
      return {
        browser: "未检测到的浏览器",
        browser_version: undefined,
      };
    }
  })();
  getBrowserNameVersion = () => browser;
  return browser;
};

function check360() {
  var result = false;
  for (var mt in navigator.mimeTypes) {
    //检测是否是360浏览器(测试只有pc端的360才起作用)
    if (navigator.mimeTypes[mt]["type"] === "application/360softmgrplugin") {
      return !result;
    }
  }

  return result;
}

//获取操作系统类型
export function getOs() {
  return (navigator.userAgent.match(/[(](.*?)[)]/)?.[0] || "").replace(
    /[()]/g,
    ""
  );
}

//获取屏幕缩放比例
export function getRatio() {
  let ratio = 0;
  let screen: any = window.screen;
  let ua = navigator.userAgent.toLowerCase();
  if (window.devicePixelRatio !== undefined) {
    ratio = window.devicePixelRatio;
  } else if (~ua.indexOf("msie")) {
    if (screen.deviceXDPI && screen.logicalXDPI) {
      ratio = screen.deviceXDPI / screen.logicalXDPI;
    }
  } else if (
    window.outerWidth !== undefined &&
    window.innerWidth !== undefined
  ) {
    ratio = window.outerWidth / window.innerWidth;
  }

  if (ratio) {
    ratio = Math.round(ratio * 100);
  }
  return ratio;
}

//获取浏览器宽高
export function getWH() {
  return {
    width: window.screen.width,
    height: window.screen.height,
  };
}
