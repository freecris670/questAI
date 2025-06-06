import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";

export default [
  { 
    ignores: [
      "node_modules/**",
      "dist/**",
      ".next/**",
      "out/**",
      ".turbo/**",
      "**/*.js",
      "**/*.mjs",
      "**/*.d.ts"
    ]
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"], 
    ...js.configs.recommended
  },
  { 
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"], 
    languageOptions: { 
      globals: {...globals.browser, ...globals.node} 
    } 
  },
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{jsx,tsx}"],
    ...pluginReact.configs.flat.recommended,
    rules: {
      // Дополнительные правила для React
      "react/prop-types": "off", // Отключаем prop-types, так как используем TypeScript
      "react/react-in-jsx-scope": "off", // Не требуется в React 17+
    }
  },
  {
    // Дополнительные общие правила для всех файлов
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    rules: {
      "no-unused-vars": "warn",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "warn",
      "no-duplicate-imports": "error"
    }
  }
];
