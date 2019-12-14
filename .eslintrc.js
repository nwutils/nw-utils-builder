module.exports = {
  root: true,
  parser: 'babel-eslint',
  env: {
    node: true
  },
  globals: {
    nw: true,
    Promise: true,
    Set: true
  },
  plugins: [
    'jest'
  ],
  extends: [
    'eslint:recommended',
    'tjw-base',
    'tjw-jest'
  ],
  rules: {
    'no-restricted-syntax': [
      'error',
      'Property[method="true"]'
    ]
  }
};
