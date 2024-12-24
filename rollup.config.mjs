import { defineConfig } from 'rollup';
import esbuild from 'rollup-plugin-esbuild';
import { dts } from 'rollup-plugin-dts';
import pkg from './package.json' assert { type: 'json' }; //断言导出json模块
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { babel } from '@rollup/plugin-babel';
import del from 'rollup-plugin-delete';
// import sourcemaps from "rollup-plugin-sourcemaps";

export default defineConfig([
  {
    input: 'src/index.ts', //入口文件
    output: {
      dir: pkg.module, //出口文件
      format: 'es', //打包成es module模块
      // sourcemap: true,
    },
    plugins: [
      del({ targets: 'dist/*' }),
      json(),
      terser(),
      resolve(),
      commonjs(),
      babel({
        babelHelpers: 'runtime',
        presets: ['@babel/preset-env'],
        plugins: [['@babel/plugin-transform-runtime', { useESModules: true }]],
      }),
      esbuild({ target: 'esnext' }),
      // sourcemaps(),
    ],
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  },
]);
