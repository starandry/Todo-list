import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import prettier from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'

export default [
    {
        languageOptions: {
            ecmaVersion: 2020,
            sourceType: 'module',
            parser: tsParser,
            globals: globals.browser,
        },
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
            '@typescript-eslint': tseslint,
            prettier: prettier,
        },
        rules: {
            'prettier/prettier': 'error',
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',
            '@typescript-eslint/no-unused-vars': 'error',
            'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
    },
    prettierConfig, // Подключение конфигурации Prettier
]
