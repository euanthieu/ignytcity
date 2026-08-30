#!/usr/bin/env mjs
/**
 * FAOS Architecture Validator
 *
 * A static import-boundary scanner. Imports are extracted with regexes (fast,
 * dependency-free) — this is intentionally NOT a full AST parser, so it does
 * not resolve `export ... from` re-exports or type-only import elisions. It is
 * a guardrail backed by ESLint and `tsc`, not a substitute for them.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "../src");

let hasViolations = false;

function logViolation(file, rule, description) {
  console.error(`\x1b[31m[VIOLATION]\x1b[0m ${file}`);
  console.error(`  ↳ \x1b[33mRule:\x1b[0m ${rule}`);
  console.error(`  ↳ \x1b[36mDetails:\x1b[0m ${description}\n`);
  hasViolations = true;
}

/**
 * Superfast static extraction of imports from file content
 */
function extractImports(content) {
  const imports = [];
  // Matches standard static imports: import ... from '...' or import '...'
  const importRegex = /import\s+([\s\S]*?)\s+from\s+['"]([^'"]+)['"]/g;
  const dynamicImportRegex = /import\(['"]([^'"]+)['"]\)/g;

  let match;
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[2]);
  }
  while ((match = dynamicImportRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  return imports;
}

/**
 * Scan a file and run boundary assertion rules
 */
function validateFile(filePath, relativePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const imports = extractImports(content);

  // Clean up paths for processing
  const pathParts = relativePath.split(path.sep);
  const layer = pathParts[0]; // 'app', 'features', or 'shared'

  // Rule 9.1: Prevent accidental feature manifest imports in the application tree
  if (
    relativePath.endsWith("feature.manifest.ts") === false &&
    content.includes("featureManifest")
  ) {
    if (content.includes("import") && content.includes("feature.manifest")) {
      logViolation(
        relativePath,
        "Manifest Pollution",
        "feature.manifest.ts must never be imported into the active application runtime tree.",
      );
    }
  }

  for (const imp of imports) {
    // 1. Enforce Absolute Imports Strategy
    if (imp.startsWith("../..")) {
      logViolation(
        relativePath,
        "Import Strategy",
        `Forbidden deep relative import "${imp}". Use absolute path aliases instead (@/*).`,
      );
    }

    // 2. Map aliases back to logical layers
    let impLayer = null;
    let impFeature = null;

    if (imp.startsWith("@/app") || imp.startsWith("app/")) impLayer = "app";
    if (imp.startsWith("@/shared") || imp.startsWith("shared/"))
      impLayer = "shared";
    if (imp.startsWith("@/features/") || imp.startsWith("features/")) {
      impLayer = "features";
      const parts = imp.replace(/^(@\/)?features\//, "").split("/");
      impFeature = parts[0];
    }

    if (!impLayer) continue;

    // --- Boundary Rule Layer Engine ---

    // Shared Layer Constraints
    if (layer === "shared") {
      if (impLayer === "features" || impLayer === "app") {
        logViolation(
          relativePath,
          "Shared Kernel Constraint",
          `The shared infrastructure layer is strictly deterministic. It cannot leak down into "${imp}".`,
        );
      }
    }

    // Feature Isolation Constraints
    if (layer === "features") {
      const currentFeature = pathParts[1];

      if (impLayer === "features" && impFeature !== currentFeature) {
        logViolation(
          relativePath,
          "Feature Isolation Boundary",
          `Cross-feature boundaries breached! Feature "${currentFeature}" is attempting to import from Feature "${impFeature}" via "${imp}". Enforce composition inside the app layer instead.`,
        );
      }
    }

    // App Layer Constraints
    if (layer === "app") {
      if (imp === "@tanstack/react-query") {
        logViolation(
          relativePath,
          "App Layer Discipline",
          "The app layer cannot consume @tanstack/react-query directly. It must strictly consume encapsulated data hooks exported from the features layer.",
        );
      }
    }
  }
}

/**
 * Recursively crawl directories
 */
function crawl(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      crawl(fullPath);
    } else if (stat.isFile() && /\.(ts|tsx|js|jsx|mjs)$/.test(file)) {
      const relativePath = path.relative(ROOT_DIR, fullPath);
      validateFile(fullPath, relativePath);
    }
  }
}

// Run Pipeline
console.log(
  "\x1b[36m%s\x1b[0m",
  "🛡️  Running FAOS Architecture Validation Layer Scan...",
);
if (!fs.existsSync(ROOT_DIR)) {
  console.error(`Source root not found at target context path: ${ROOT_DIR}`);
  process.exit(1);
}

crawl(ROOT_DIR);

if (hasViolations) {
  console.error(
    "\x1b[31m%s\x1b[0m",
    "❌ Architecture enforcement validation checks failed. See violations detailed above. Build blocked.",
  );
  process.exit(1);
} else {
  console.log(
    "\x1b[32m%s\x1b[0m",
    "✅ Architectural boundaries cleanly intact. Feature isolation guaranteed.",
  );
  process.exit(0);
}
