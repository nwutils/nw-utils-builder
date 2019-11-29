const nwBuilder = require('../src/index.js');

describe('nw-utils-builder', () => {
  test('Global default settings', () => {
    expect(nwBuilder.settings)
      .toMatchSnapshot();
  });
});
