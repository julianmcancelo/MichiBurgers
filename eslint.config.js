// ESLint v9 flat config bridging to existing .eslintrc.json (CommonJS)
// Uses FlatCompat to reuse your current rules/plugins in flat format.
const { FlatCompat } = require('@eslint/eslintrc');
const path = require('node:path');

const compat = new FlatCompat({
  baseDirectory: path.resolve(),
});

/** @type {import('eslint').Linter.FlatConfig[]} */
module.exports = [
  // Project-wide ignores (replacement for .eslintignore)
  {
    ignores: [
      'dist/**',
      'out-tsc/**',
      '.angular/**',
      'coverage/**',
      'node_modules/**',
      'api/**',
      'public/favicon.ico',
    ],
  },
  // Load the legacy config from .eslintrc.json via FlatCompat
  ...compat.extends('./.eslintrc.json'),
];
