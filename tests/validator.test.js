const validator = require('../src/validator.js');

describe('Validator', () => {
  test('Default settings snapshot', () => {
    expect(validator.settings)
      .toMatchSnapshot();
  });
});
