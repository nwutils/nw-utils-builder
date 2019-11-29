const helpers = require('../src/helpers.js');

describe('Helpers', () => {
  describe('Log', () => {
    let consoleLog;
    const verbose = {
      global: {
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
        .toHaveBeenCalledWith('NW-UTILS-BUILDER:', 'A');
    });

    test('Error true', () => {
      try {
        helpers.log('A', verbose, true);
      } catch (error) {
        expect(console.log)
          .toHaveBeenCalledWith('NW-UTILS-BUILDER:');

        expect(error)
          .toEqual('A');
      }
    });
  });
});
