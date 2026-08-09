import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    // .mts is included so the regression harnesses under scripts/ are held
    // to the same static discipline as production code — an unlinted guard
    // rots quietly, and a guard that rots lies.
    files: ["**/*.{ts,tsx,mts}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    // Harnesses run under Node (vite-node), not the browser.
    files: ["scripts/**/*.{ts,mts}"],
    languageOptions: { globals: globals.node },
  }
);
