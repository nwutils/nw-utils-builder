const nwBuilder = require('../index.js');

describe('nw-utils-builder', () => {
  test('Global default settings', () => {
    expect(nwBuilder.settings)
      .toMatchSnapshot();
  });
});
