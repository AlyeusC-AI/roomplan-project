import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import { fixupConfigRules } from "@eslint/compat";
import prettierConfigRecommended from "eslint-plugin-prettier/recommended";
import prettierConfig from "eslint-config-prettier";
import tailwind from "eslint-plugin-tailwindcss";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

const patchedConfig = fixupConfigRules([...compat.extends("next/typescript")]);

const config = [
  ...patchedConfig,
  ...tailwind.configs["flat/recommended"],
  prettierConfigRecommended,
  prettierConfig,
  {
    ignores: [".next/*", "src/types/database.d.ts", "node_modules/*"],
  },
];

export default config;
