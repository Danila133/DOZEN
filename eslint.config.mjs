import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  {
    rules: {
      // React Hooks v7 — strict on legacy patterns; warn until refactored
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
    },
  },
  globalIgnores([
    "lib/**",
    "contracts/**",
    "cache/**",
    "deployments/**",
    "scripts/**",
    "assets/**",
    "public/**",
    "node_modules/**",
    ".next/**",
    "out/**",
    "build/**",
  ]),
]);

export default eslintConfig;
