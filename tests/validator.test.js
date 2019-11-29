const validator = require('../src/validator.js');

describe('Validator', () => {
  let consoleLog;

  beforeEach(() => {
    consoleLog = console.log;
    console.log = jest.fn();
  });

  afterEach(() => {
    console.log = consoleLog;
  });

  describe('Log', () => {
    test('Error true', () => {
      try {
        validator.log('B', { global: { verbose: true } }, true);
      } catch (error) {
        expect(console.log)
          .toHaveBeenCalledWith('NW-UTILS-BUILDER:');

        expect(error)
          .toEqual('B');
      }
    });
  });

  test('Default settings snapshot', () => {
    expect(validator.settings)
      .toMatchSnapshot();
  });

  describe('validateGlobalArrayOfStrings', () => {
    describe('No settings.global', () => {
      const settings = {};

      test('junk', () => {
        expect(validator.validateGlobalArrayOfStrings(settings, 'junk'))
          .toEqual([]);
      });

      test('files', () => {
        expect(validator.validateGlobalArrayOfStrings(settings, 'files'))
          .toEqual(['**/*']);
      });

      test('asdf', () => {
        expect(validator.validateGlobalArrayOfStrings(settings, 'asdf'))
          .toEqual(undefined);
      });
    });

    describe('No settings.global[section]', () => {
      const settings = {
        global: {}
      };

      test('junk', () => {
        expect(validator.validateGlobalArrayOfStrings(settings, 'junk'))
          .toEqual([]);
      });

      test('files', () => {
        expect(validator.validateGlobalArrayOfStrings(settings, 'files'))
          .toEqual(['**/*']);
      });

      test('asdf', () => {
        expect(validator.validateGlobalArrayOfStrings(settings, 'asdf'))
          .toEqual(undefined);
      });
    });

    describe('settings.global[section] is not an array', () => {
      function settings () {
        let setting = { global: {} };
        setting.global['section'] = 'String';
        return setting;
      };

      test('junk', () => {
        expect(validator.validateGlobalArrayOfStrings(settings('junk'), 'junk'))
          .toEqual([]);
      });

      test('files', () => {
        expect(validator.validateGlobalArrayOfStrings(settings('files'), 'files'))
          .toEqual(['**/*']);
      });

      test('asdf', () => {
        expect(validator.validateGlobalArrayOfStrings(settings('asdf'), 'asdf'))
          .toEqual(undefined);
      });
    });

    describe('settings.global[section] is an empty array', () => {
      function settings () {
        let setting = { global: {} };
        setting.global['section'] = [];
        return setting;
      };

      test('junk', () => {
        expect(validator.validateGlobalArrayOfStrings(settings('junk'), 'junk'))
          .toEqual([]);
      });

      test('files', () => {
        expect(validator.validateGlobalArrayOfStrings(settings('files'), 'files'))
          .toEqual(['**/*']);
      });

      test('asdf', () => {
        expect(validator.validateGlobalArrayOfStrings(settings('asdf'), 'asdf'))
          .toEqual(undefined);
      });
    });

    describe('settings.global[section] is array of numbers', () => {
      function settings (section) {
        let setting = { global: {} };
        setting.global[section] = [10, 20, 30];
        return setting;
      };
      const title = 'NW-UTILS-BUILDER:';

      test('junk', () => {
        const result = validator.validateGlobalArrayOfStrings(settings('junk'), 'junk');

        expect(console.log)
          .toHaveBeenCalledWith(title, 'The global junk setting must be an array of strings, an empty array, or undefined');

        expect(result)
          .toEqual([]);
      });

      test('files', () => {
        const result = validator.validateGlobalArrayOfStrings(settings('files'), 'files');

        expect(console.log)
          .toHaveBeenCalledWith(title, 'The global files setting must be an array of strings, an empty array, or undefined');

        expect(result)
          .toEqual(['**/*']);
      });

      test('asdf', () => {
        const result = validator.validateGlobalArrayOfStrings(settings('asdf'), 'asdf');

        expect(console.log)
          .toHaveBeenCalledWith(title, 'The global asdf setting must be an array of strings, an empty array, or undefined');

        expect(result)
          .toEqual(undefined);
      });
    });

    describe('Return deduped array', () => {
      function settings (section) {
        let setting = { global: {} };
        setting.global[section] = ['10', '20', '10', '10', '40', '20', '30'];
        return setting;
      };
      const title = 'NW-UTILS-BUILDER:';

      test('junk', () => {
        expect(validator.validateGlobalArrayOfStrings(settings('junk'), 'junk'))
          .toEqual(['10', '20', '40', '30']);
      });

      test('files', () => {
        expect(validator.validateGlobalArrayOfStrings(settings('files'), 'files'))
          .toEqual(['10', '20', '40', '30']);
      });

      test('asdf', () => {
        expect(validator.validateGlobalArrayOfStrings(settings('asdf'), 'asdf'))
          .toEqual(['10', '20', '40', '30']);
      });
    });
  });
});
