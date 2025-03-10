import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [...compat.extends("next", "turbo", "prettier"), {
    plugins: {
        "simple-import-sort": simpleImportSort,
        "unused-imports": unusedImports,
    },

    languageOptions: {
        ecmaVersion: 5,
        sourceType: "script",

        parserOptions: {
            babelOptions: {
                presets: [
                    "/Users/samuelvulakh/Desktop/Work/freelancing/upwork/servicegeek/node_modules/.pnpm/next@15.1.2_@babel+core@7.20.2_react-dom@18.2.0_react@18.3.1__react@18.3.1/node_modules/next/babel.js",
                ],
            },
        },
    },

    rules: {
        "simple-import-sort/imports": "error",
        "simple-import-sort/exports": "error",
        "unused-imports/no-unused-imports": "error",
        "@next/next/no-html-link-for-pages": "off",

        "@typescript-eslint/no-unused-vars": ["error", {
            argsIgnorePattern: "^_",
            varsIgnorePattern: "^_",
            caughtErrorsIgnorePattern: "^_",
        }],
    },
}, {
    files: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"],
    ignores: ["*Calender/*.tsx"],

    rules: {
        "simple-import-sort/imports": ["error", {
            groups: [
                ["^react", "^@?\\w"],
                ["^(@|components)(/.*|$)"],
                ["^\\u0000"],
                ["^\\.\\.(?!/?$)", "^\\.\\./?$"],
                ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
                ["^.+\\.?(css)$"],
            ],
        }],
    },
}];