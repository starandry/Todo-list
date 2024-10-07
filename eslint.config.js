import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettierPlugin from 'eslint-plugin-prettier';

export default [
    {
        ignores: ['node_modules'],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
        },
        linterOptions: {
            noInlineConfig: true,
        },
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
            prettier: prettierPlugin,
        },
        rules: {
            'prettier/prettier': [
                'error',
                {
                    singleQuote: true,
                    printWidth: 120,
                    trailingComma: 'es5',
                },
            ],
            'max-len': [
                'error',
                {
                    code: 120,
                    ignorePattern: '^import\\s.+\\sfrom\\s.+;$',
                    ignoreUrls: true,
                    ignoreComments: true,
                    ignoreStrings: true,
                    ignoreTemplateLiterals: true,
                },
            ],
        },
    },
];
