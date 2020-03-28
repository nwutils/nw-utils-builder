module.exports = {
  root: true,
  env: {
    jest: true,
    node: true
  },
  globals: {
    nw: true,
    Promise: true,
    Set: true
  },
  plugins: [
    'jsdoc',
    'jest'
  ],
  extends: [
    'plugin:jsdoc/recommended',
    'eslint:recommended',
    'tjw-base',
    'tjw-jest'
  ],
  rules: {
    'no-restricted-syntax': [
      'error',
      'Property[method="true"]'
    ]
  },
  settings: {
    jsdoc: {
      tagNamePreference: {
        property: 'prop',
        returns: 'return'
      }
    }
  }
};
