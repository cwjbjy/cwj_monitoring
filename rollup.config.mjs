import { defineConfig } from 'rollup';
import esbuild from 'rollup-plugin-esbuild';
import { dts } from 'rollup-plugin-dts';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { babel } from '@rollup/plugin-babel';
import del from 'rollup-plugin-delete';

const plugins = [
  json(),
  resolve({
    browser: true,
    preferBuiltins: false,
  }),
  commonjs(),
  babel({
    babelHelpers: 'runtime',
    exclude: 'node_modules/**',
    presets: ['@babel/preset-env'],
    plugins: [['@babel/plugin-transform-runtime', { useESModules: true }]],
  }),
  esbuild({
    target: 'es2020',
    minify: false,
  }),
];

export default defineConfig([
  // ESM build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'es',
      sourcemap: true,
      exports: 'named',
    },
    plugins: [del({ targets: 'dist/*' }), ...plugins],
  },

  // CommonJS build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.cjs',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
    plugins,
  },

  // Minified ESM build (for CDN)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.min.js',
      format: 'es',
      sourcemap: true,
      exports: 'named',
    },
    plugins: [...plugins, terser()],
  },

  // UMD build (for browser script tag)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'CWJMonitoring',
      sourcemap: true,
      exports: 'named',
      globals: {
        '@fingerprintjs/fingerprintjs': 'FingerprintJS',
        bowser: 'Bowser',
      },
    },
    plugins,
  },

  // Type definitions
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  },
]);
