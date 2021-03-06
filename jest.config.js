module.exports = {
  collectCoverageFrom: [
    'src/**/*.js',
    '!**/node_modules/**'
  ],
  coverageDirectory: '<rootDir>/tests/coverage',
  moduleFileExtensions: [
    'js',
    'json'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  modulePathIgnorePatterns: [
    '<rootDir>/sample-project'
  ],
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup.js'
  ],
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  testURL: 'http://localhost/',
  transformIgnorePatterns: [
    '/node_modules/'
  ]
};
