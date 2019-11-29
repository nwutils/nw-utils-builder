const nwBuilder = require('../src/index.js');

describe('nw-utils-builder', () => {
  test('Dummy', () => {
    expect(typeof(nwBuilder))
      .toEqual('object');
  });
});
