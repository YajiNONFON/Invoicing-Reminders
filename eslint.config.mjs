import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default defineConfig([
  { ignores: ['dist', 'node_modules', 'coverage', 'src/generated'] },
  js.configs.recommended,
  tseslint.configs.recommended,
]);
