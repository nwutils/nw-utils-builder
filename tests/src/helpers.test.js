const helpers = require('../../src/helpers.js');
const title = require('../testHelpers.js').title;

describe('Helpers', () => {
  describe('Log', () => {
    let consoleLog;
    const verbose = {
      options: {
        verbose: true
      }
    };

    beforeEach(() => {
      consoleLog = console.log;
      console.log = jest.fn();
    });

    afterEach(() => {
      console.log = consoleLog;
    });

    test('No message', () => {
      helpers.log(null, verbose);

      expect(console.log)
        .not.toHaveBeenCalled();
    });

    test('No settings', () => {
      helpers.log('A');

      expect(console.log)
        .not.toHaveBeenCalled();
    });

    test('No settings.global', () => {
      helpers.log('A', {});

      expect(console.log)
        .not.toHaveBeenCalled();
    });

    test('No settings.global.verbose', () => {
      helpers.log('A', { global: {} });

      expect(console.log)
        .not.toHaveBeenCalled();
    });

    test('Verbose false', () => {
      helpers.log('A', { global: { verbose: false } });

      expect(console.log)
        .not.toHaveBeenCalled();
    });

    test('Verbose true', () => {
      helpers.log('A', verbose);

      expect(console.log)
        .toHaveBeenCalledWith(title, 'A');
    });

    test('Error true', () => {
      try {
        helpers.log('A', verbose, true);
      } catch (error) {
        expect(console.log)
          .toHaveBeenCalledWith(title);

        expect(error)
          .toEqual('A');
      }
    });
  });
});
