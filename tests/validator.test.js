const validator = require('../src/validator.js');
const title = 'NW-UTILS-BUILDER:';

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

  describe('Global default settings', () => {
    test('Snapshot', () => {
      expect(validator.settings)
        .toMatchSnapshot();
    });
  });

  describe('validateArrayOfStrings', () => {
    describe('settings[section] is not an array', () => {
      function settings (section) {
        let setting = {};
        setting[section] = 'String';
        return setting;
      }

      test('junk', () => {
        const result = validator.validateArrayOfStrings(settings('junk'), 'junk');

        expect(console.log)
          .toHaveBeenCalledWith(title, 'The junk setting must be an array of strings, an empty array, or undefined.');

        expect(result)
          .toEqual(null);
      });

      test('files', () => {
        const result = validator.validateArrayOfStrings(settings('files'), 'files');

        expect(console.log)
          .toHaveBeenCalledWith(title, 'The files setting must be an array of strings, an empty array, or undefined.');

        expect(result)
          .toEqual(null);
      });

      test('asdf', () => {
        const result = validator.validateArrayOfStrings(settings('asdf'), 'asdf');

        expect(console.log)
          .toHaveBeenCalledWith(title, 'The asdf setting must be an array of strings, an empty array, or undefined.');

        expect(result)
          .toEqual(null);
      });
    });

    describe('settings[section] is an empty array', () => {
      function settings (section) {
        let setting = {};
        setting[section] = [];
        return setting;
      }

      test('junk', () => {
        const result = validator.validateArrayOfStrings(settings('junk'), 'junk');

        expect(console.log)
          .not.toHaveBeenCalled();

        expect(result)
          .toEqual([]);
      });

      test('files', () => {
        const result = validator.validateArrayOfStrings(settings('files'), 'files');

        expect(console.log)
          .not.toHaveBeenCalled();

        expect(result)
          .toEqual([]);
      });

      test('asdf', () => {
        const result = validator.validateArrayOfStrings(settings('asdf'), 'asdf');

        expect(console.log)
          .not.toHaveBeenCalled();

        expect(result)
          .toEqual([]);
      });
    });

    describe('settings[section] is array of numbers', () => {
      function settings (section) {
        let setting = {};
        setting[section] = [10, 20, 30];
        return setting;
      }

      test('junk', () => {
        const result = validator.validateArrayOfStrings(settings('junk'), 'junk');

        expect(console.log)
          .toHaveBeenCalledWith(title, 'The junk setting must be an array of strings, an empty array, or undefined.');

        expect(result)
          .toEqual(null);
      });

      test('files', () => {
        const result = validator.validateArrayOfStrings(settings('files'), 'files');

        expect(console.log)
          .toHaveBeenCalledWith(title, 'The files setting must be an array of strings, an empty array, or undefined.');

        expect(result)
          .toEqual(null);
      });

      test('asdf', () => {
        const result = validator.validateArrayOfStrings(settings('asdf'), 'asdf');

        expect(console.log)
          .toHaveBeenCalledWith(title, 'The asdf setting must be an array of strings, an empty array, or undefined.');

        expect(result)
          .toEqual(null);
      });
    });

    describe('Return deduped array', () => {
      function settings (section) {
        let setting = {};
        setting[section] = ['A', 'B', 'A', 'A', 'D', 'B', 'C'];
        return setting;
      }

      test('junk', () => {
        const result = validator.validateArrayOfStrings(settings('junk'), 'junk');

        expect(console.log)
          .not.toHaveBeenCalled();

        expect(result)
          .toEqual(['A', 'B', 'D', 'C']);
      });

      test('files', () => {
        const result = validator.validateArrayOfStrings(settings('files'), 'files');

        expect(console.log)
          .not.toHaveBeenCalled();

        expect(result)
          .toEqual(['A', 'B', 'D', 'C']);
      });

      test('asdf', () => {
        const result = validator.validateArrayOfStrings(settings('asdf'), 'asdf');

        expect(console.log)
          .not.toHaveBeenCalled();

        expect(result)
          .toEqual(['A', 'B', 'D', 'C']);
      });
    });

    describe('No settings[section]', () => {
      const settings = {};

      test('junk', () => {
        const result = validator.validateArrayOfStrings(settings, 'junk');

        expect(console.log)
          .not.toHaveBeenCalled();

        expect(result)
          .toEqual(null);
      });

      test('files', () => {
        const result = validator.validateArrayOfStrings(settings, 'files');

        expect(console.log)
          .not.toHaveBeenCalled();

        expect(result)
          .toEqual(null);
      });

      test('asdf', () => {
        const result = validator.validateArrayOfStrings(settings, 'asdf');

        expect(console.log)
          .not.toHaveBeenCalled();

        expect(result)
          .toEqual(null);
      });
    });
  });

  describe('validateBoolean', () => {
    describe('No settings[section]', () => {
      const settings = {};

      test('verbose', () => {
        const result = validator.validateBoolean(settings, 'verbose');

        expect(console.log)
          .not.toHaveBeenCalled();

        expect(result)
          .toEqual(null);
      });

      test('asdf', () => {
        const result = validator.validateBoolean(settings, 'asdf');

        expect(console.log)
          .not.toHaveBeenCalled();

        expect(result)
          .toEqual(null);
      });
    });

    describe('settings[section] is not a boolean', () => {
      function settings (section) {
        const setting = {};
        setting[section] = 0;
        return setting;
      }

      test('verbose', () => {
        const result = validator.validateBoolean(settings('verbose'), 'verbose');

        expect(console.log)
          .toHaveBeenCalledWith(title, 'The verbose setting must be a type of boolean.');

        expect(result)
          .toEqual(null);
      });

      test('asdf', () => {
        const result = validator.validateBoolean(settings('asdf'), 'asdf');

        expect(console.log)
          .toHaveBeenCalledWith(title, 'The asdf setting must be a type of boolean.');

        expect(result)
          .toEqual(null);
      });
    });

    describe('settings[section] is a boolean', () => {
      test('verbose', () => {
        const settings = {
          verbose: false
        };
        const result = validator.validateBoolean(settings, 'verbose');

        expect(console.log)
          .not.toHaveBeenCalled();

        expect(result)
          .toEqual(false);
      });

      test('asdf', () => {
        const settings = {
          asdf: true
        };
        const result = validator.validateBoolean(settings, 'asdf');

        expect(console.log)
          .not.toHaveBeenCalled();

        expect(result)
          .toEqual(true);
      });
    });
  });

  describe('validateString', () => {
    describe('No settings[section]', () => {
      const settings = {};

      test('mirror', () => {
        const result = validator.validateString(settings, 'mirror');

        expect(console.log)
          .not.toHaveBeenCalled();

        expect(result)
          .toEqual(null);
      });

      test('asdf', () => {
        const result = validator.validateString(settings, 'asdf');

        expect(console.log)
          .not.toHaveBeenCalled();

        expect(result)
          .toEqual(null);
      });
    });

    describe('settings[section] is not a string', () => {
      function settings (section) {
        const setting = {};
        setting[section] = 4;
        return setting;
      }

      test('mirror', () => {
        const result = validator.validateString(settings('mirror'), 'mirror');

        expect(console.log)
          .toHaveBeenCalledWith(title, 'The mirror setting must be a string.');

        expect(result)
          .toEqual(null);
      });

      test('asdf', () => {
        const result = validator.validateString(settings('asdf'), 'asdf');

        expect(console.log)
          .toHaveBeenCalledWith(title, 'The asdf setting must be a string.');

        expect(result)
          .toEqual(null);
      });
    });

    describe('settings[section] is a string', () => {
      function settings (section) {
        const setting = {};
        setting[section] = 'qwer';
        return setting;
      }

      test('mirror', () => {
        const result = validator.validateString(settings('mirror'), 'mirror');

        expect(console.log)
          .not.toHaveBeenCalled();

        expect(result)
          .toEqual('qwer');
      });

      test('asdf', () => {
        const result = validator.validateString(settings('asdf'), 'asdf');

        expect(console.log)
          .not.toHaveBeenCalled();

        expect(result)
          .toEqual('qwer');
      });
    });
  });

  describe('validateNwVersion', () => {
    test('No settings.nwVersion', () => {
      const result = validator.validateNwVersion({});

      expect(console.log)
        .not.toHaveBeenCalled();

      expect(result)
        .toEqual(null);
    });

    test('settings.nwVersion is not a string', () => {
      const result = validator.validateNwVersion({ nwVersion: 3 });

      expect(console.log)
        .toHaveBeenCalledWith(title, 'The nwVersion setting must be a string.');

      expect(result)
        .toEqual(null);
    });

    test('settings.nwVersion is match', () => {
      const result = validator.validateNwVersion({ nwVersion: 'match' });

      expect(console.log)
        .not.toHaveBeenCalled();

      expect(result)
        .toEqual('match');
    });

    test('settings.nwVersion is latest', () => {
      const result = validator.validateNwVersion({ nwVersion: 'latest' });

      expect(console.log)
        .not.toHaveBeenCalled();

      expect(result)
        .toEqual('latest');
    });

    test('settings.nwVersion is V1.2.3', () => {
      const result = validator.validateNwVersion({ nwVersion: 'V1.2.3' });

      expect(console.log)
        .not.toHaveBeenCalled();

      expect(result)
        .toEqual('v1.2.3');
    });

    test('settings.nwVersion is 1.2.3', () => {
      const result = validator.validateNwVersion({ nwVersion: '1.2.3' });

      expect(console.log)
        .not.toHaveBeenCalled();

      expect(result)
        .toEqual('v1.2.3');
    });

    test('settings.nwVersion is adsf', () => {
      const result = validator.validateNwVersion({ nwVersion: 'adsf' });

      expect(console.log)
        .toHaveBeenCalledWith(title, 'The nwVersion setting must be a string of a valid version number ("v0.42.5"), "latest", or "match".');

      expect(result)
        .toEqual(null);
    });
  });
});
