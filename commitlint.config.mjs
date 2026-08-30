/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // ── Type ─────────────────────────────────────────────────────────────────
    "type-enum": [
      2,
      "always",
      [
        "feat", // New feature
        "fix", // Bug fix
        "docs", // Documentation only
        "style", // Formatting (no code change)
        "refactor", // Code change that neither fixes a bug nor adds a feature
        "perf", // Performance improvement
        "test", // Adding or fixing tests
        "build", // Build system or dependencies
        "ci", // CI/CD configuration
        "chore", // Other maintenance tasks
        "revert", // Revert a previous commit
      ],
    ],
    "type-case": [2, "always", "lower-case"],
    "type-empty": [2, "never"],

    // ── Scope ────────────────────────────────────────────────────────────────
    "scope-case": [2, "always", "lower-case"],

    // ── Subject ───────────────────────────────────────────────────────────────
    "subject-empty": [2, "never"],
    "subject-full-stop": [2, "never", "."],
    "subject-case": [
      2,
      "never",
      ["sentence-case", "start-case", "pascal-case", "upper-case"],
    ],

    // ── Body / Footer ─────────────────────────────────────────────────────────
    "body-leading-blank": [1, "always"],
    "footer-leading-blank": [1, "always"],

    // ── Line Length ──────────────────────────────────────────────────────────
    "header-max-length": [2, "always", 100],
  },
};
