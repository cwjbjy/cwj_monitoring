import { defineConfig } from "rollup";
import pkg from "./package.json" assert { type: "json" }; //断言导出json模块
import json from "@rollup/plugin-json";
import terser from "@rollup/plugin-terser";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import alias from "@rollup/plugin-alias";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { babel } from "@rollup/plugin-babel";
import { DEFAULT_EXTENSIONS } from "@babel/core";
import { rimrafSync } from "rimraf";
import del from "rollup-plugin-delete";
// import sourcemaps from "rollup-plugin-sourcemaps";

rimrafSync("dist"); // 删除打包目录

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig([
  {
    input: "src/index.js", //入口文件
    output: {
      dir: pkg.module, //出口文件
      format: "es", //打包成es module模块
      // sourcemap: true,
    },
    plugins: [
      del({ targets: "dist/*" }),
      json(),
      terser(),
      resolve(),
      commonjs(),
      alias({
        entries: [{ find: "@", replacement: path.resolve(__dirname, "src") }],
      }),
      babel({
        babelHelpers: "runtime",
        presets: ["@babel/preset-env"],
        plugins: [["@babel/plugin-transform-runtime", { useESModules: true }]],
        extensions: [...DEFAULT_EXTENSIONS],
      }),
      // sourcemaps(),
    ],
  },
]);
