/** @type {import('lint-staged').Config} */
export default {
  // TypeScript / TSX — lint then format (--log-level warn keeps hooks silent on success)
  "*.{ts,tsx}": [
    "eslint --fix --max-warnings=0",
    "prettier --write --log-level warn",
  ],

  // JavaScript — format only
  "*.{js,mjs,cjs}": ["prettier --write --log-level warn"],

  // Styles, JSON, Markdown, YAML — format only
  "*.{css,json,md,yml,yaml}": ["prettier --write --log-level warn"],
};
