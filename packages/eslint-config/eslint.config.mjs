import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import nextPlugin from "@next/eslint-plugin-next";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { 
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"], 
    plugins: { js }, 
    extends: ["js/recommended"] 
  },
  { 
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"], 
    languageOptions: { 
      globals: {...globals.browser, ...globals.node} 
    } 
  },
  // Применяем базовые правила TypeScript
  {
    ...tseslint.configs.recommended[0],
    rules: {
      ...tseslint.configs.recommended[0].rules,
      // Делаем правило no-unused-vars предупреждением вместо ошибки
      "@typescript-eslint/no-unused-vars": "warn",
    }
  },
  // Применяем настройки React
  {
    files: ["**/*.{jsx,tsx}"],
    ...pluginReact.configs.flat.recommended,
    rules: {
      // Дополнительные правила для React
      "react/prop-types": "off", // Отключаем prop-types, так как используем TypeScript
      "react/react-in-jsx-scope": "off", // Не требуется в React 17+
    }
  },
  // Добавляем поддержку Next.js
  {
    files: ["**/app/**/*.{js,jsx,ts,tsx}", "**/pages/**/*.{js,jsx,ts,tsx}"],
    plugins: {
      next: nextPlugin
    },
    rules: {
      "next/no-html-link-for-pages": "off",
      "next/no-img-element": "off"
    }
  },
  {
    // Дополнительные общие правила для всех файлов
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    rules: {
      "no-unused-vars": "warn", // Предупреждение вместо ошибки
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "warn",
      "no-duplicate-imports": "error"
    }
  }
]);
