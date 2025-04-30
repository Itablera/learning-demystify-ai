// Root ESLint configuration
import { config as baseConfig } from './packages/eslint-config/base.js';

export default [
  {
    // Only ignore node_modules and build artifacts, not our source files
    ignores: ['**/node_modules/**', '**/dist/**', '**/build/**', '.turbo/**'],
  },
  ...baseConfig,
];