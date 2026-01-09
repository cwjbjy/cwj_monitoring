import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';
import prettier from 'eslint-plugin-prettier/recommended';

export default defineConfig(
    { ignores: ['dist', 'node_modules'] },
    js.configs.recommended,
    tseslint.configs.recommended,
    prettier,
    {
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        rules: {
            '@typescript-eslint/no-explicit-any': 'off', // 允许使用any
            '@typescript-eslint/no-this-alias': [
                'error',
                {
                    allowedNames: ['that'], // this可用的局部变量名称
                },
            ],
            'no-console': [
                // 提交时不允许有console.log
                'warn',
                {
                    allow: ['warn', 'error'],
                },
            ],
            '@typescript-eslint/ban-ts-comment': 'off', // 允许使用@ts-ignore
            '@typescript-eslint/no-non-null-assertion': 'off', // 允许使用非空断言
            'no-debugger': 'warn', // 提交时不允许有debugger
        },
    }
);
