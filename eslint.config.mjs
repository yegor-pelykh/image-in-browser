import typescriptEslint from "@typescript-eslint/eslint-plugin";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
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

export default [{
    ignores: ["**/*.js", "**/*.d.ts", "**/lib/"],
}, ...compat.extends("prettier", "eslint:recommended", "plugin:@typescript-eslint/recommended"), {
    plugins: {
        "@typescript-eslint": typescriptEslint,
    },

    languageOptions: {
        globals: {
            ...globals.browser,
        },

        parser: tsParser,
        ecmaVersion: "latest",
        sourceType: "module",

        parserOptions: {
            project: ["./tsconfig.json"],
        },
    },

    rules: {
        "consistent-return": ["warn"],
        "consistent-this": ["warn", "that"],
        "dot-notation": ["warn"],
        eqeqeq: ["warn"],
        "grouped-accessor-pairs": ["warn"],
        "init-declarations": ["warn", "always"],
        "linebreak-style": ["warn", "unix"],
        "max-classes-per-file": ["warn", 1],
        "new-cap": ["warn"],
        "no-alert": ["warn"],
        "no-case-declarations": ["warn"],

        "no-constant-condition": ["error", {
            checkLoops: false,
        }],

        "no-duplicate-imports": ["warn"],
        "no-eq-null": ["warn"],
        "no-eval": ["warn"],
        "no-extra-semi": ["warn"],
        "no-global-assign": ["warn"],
        "no-implicit-coercion": ["warn"],
        "no-implicit-globals": ["warn"],
        "no-implied-eval": ["warn"],
        "no-inline-comments": ["warn"],
        "no-invalid-this": ["warn"],
        "no-multi-assign": ["warn"],
        "no-new": ["warn"],
        "no-new-func": ["warn"],
        "no-new-object": ["warn"],
        "no-new-wrappers": ["warn"],
        "no-param-reassign": ["warn"],
        "no-redeclare": ["warn"],
        "no-sequences": ["warn"],
        "no-throw-literal": ["warn"],
        "no-useless-call": ["warn"],
        "no-useless-constructor": ["warn"],
        "no-useless-rename": ["warn"],
        "no-var": ["warn"],
        "one-var": ["warn", "never"],
        "operator-assignment": ["warn", "always"],
        "prefer-const": ["warn"],
        "prefer-promise-reject-errors": ["warn"],
        "prefer-rest-params": ["warn"],
        "prefer-spread": ["warn"],
        "prefer-template": ["warn"],
        "require-await": ["warn"],
        semi: ["warn", "always"],
        "space-before-function-paren": ["warn", "never"],

        "@typescript-eslint/no-empty-function": ["error", {
            allow: ["methods", "setters"],
        }],

        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/no-unused-vars": "off",
    },
}];