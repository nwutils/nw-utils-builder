const _cloneDeep = require('lodash.clonedeep');

const validator = require('../../src/validator.js');
const testHelpers = require('../testHelpers.js');

const customizedSettingsAndTasks = testHelpers.customizedSettingsAndTasks;
const title = testHelpers.title;

describe('Validator', () => {
  let consoleLog;

  beforeEach(() => {
    validator.resetState();
    consoleLog = console.log;
    console.log = jest.fn();
  });

  afterEach(() => {
    console.log = consoleLog;
  });

  describe('Log', () => {
    test('Error true', () => {
      try {
        validator.log('B', { options: { verbose: true } }, true);
      } catch (error) {
        expect(console.log)
          .toHaveBeenCalledWith(title);

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

  describe('validationMap', () => {
    test('Snapshot', () => {
      expect(validator.validationMap)
        .toMatchSnapshot();
    });
  });

  describe('validTaskSettings', () => {
    test('Snapshot', () => {
      expect(validator.validTaskSettings)
        .toMatchSnapshot();
    });
  });

  describe('validateArrayOfStrings', () => {
    describe('settings[name] is not an array', () => {
      function settings (name) {
        let setting = {};
        setting[name] = 'String';
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

    describe('settings[name] is an empty array', () => {
      function settings (name) {
        let setting = {};
        setting[name] = [];
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

    describe('settings[name] is array of numbers', () => {
      function settings (name) {
        let setting = {};
        setting[name] = [10, 20, 30];
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
      function settings (name) {
        let setting = {};
        setting[name] = ['A', 'B', 'A', 'A', 'D', 'B', 'C'];
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

    describe('No settings[name]', () => {
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

  describe('validateObject', () => {
    describe('No settings[name]', () => {
      const settings = {};

      test('manifestOverrides', () => {
        const result = validator.validateObject(settings, 'manifestOverrides');

        expect(console.log)
          .not.toHaveBeenCalled();

        expect(result)
          .toEqual(null);
      });

      test('asdf', () => {
        const result = validator.validateObject(settings, 'asdf');

        expect(console.log)
          .not.toHaveBeenCalled();

        expect(result)
          .toEqual(null);
      });
    });

    describe('settings[name] is not a object', () => {
      function settings (name) {
        const setting = {};
        setting[name] = 4;
        return setting;
      }

      test('manifestOverrides', () => {
        const result = validator.validateObject(settings('manifestOverrides'), 'manifestOverrides');

        expect(console.log)
          .toHaveBeenCalledWith(title, 'The manifestOverrides setting must be an object.');

        expect(result)
          .toEqual(null);
      });

      test('asdf', () => {
        const result = validator.validateObject(settings('asdf'), 'asdf');

        expect(console.log)
          .toHaveBeenCalledWith(title, 'The asdf setting must be an object.');

        expect(result)
          .toEqual(null);
      });
    });

    describe('settings[name] is a object', () => {
      function settings (name) {
        const setting = {};
        setting[name] = {
          version: '1.0.0'
        };
        return setting;
      }

      test('manifestOverrides', () => {
        const result = validator.validateObject(settings('manifestOverrides'), 'manifestOverrides');

        expect(console.log)
          .not.toHaveBeenCalled();

        expect(result)
          .toEqual({ version: '1.0.0' });
      });

      test('asdf', () => {
        const result = validator.validateObject(settings('asdf'), 'asdf');

        expect(console.log)
          .not.toHaveBeenCalled();

        expect(result)
          .toEqual({ version: '1.0.0' });
      });
    });
  });

  describe('validateBoolean', () => {
    describe('No settings[name]', () => {
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

    describe('settings[name] is not a boolean', () => {
      function settings (name) {
        const setting = {};
        setting[name] = 0;
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

    describe('settings[name] is a boolean', () => {
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
    describe('No settings[name]', () => {
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

    describe('settings[name] is not a string', () => {
      function settings (name) {
        const setting = {};
        setting[name] = 4;
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

    describe('settings[name] is a string', () => {
      function settings (name) {
        const setting = {};
        setting[name] = 'qwer';
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
        .toHaveBeenCalledWith(
          title,
          'The nwVersion setting must be a string of a valid ' +
          'version number like "0.42.6", or a valid keyword ' +
          'like "stable", "latest", "lts", or "match".'
        );

      expect(result)
        .toEqual(null);
    });
  });

  describe('validateNwFlavor', () => {
    test('No settings.nwFlavor', () => {
      const result = validator.validateNwFlavor({});

      expect(console.log)
        .not.toHaveBeenCalled();

      expect(result)
        .toEqual(null);
    });

    test('settings.nwFlavor is not a string', () => {
      const result = validator.validateNwFlavor({ nwFlavor: 3 });

      expect(console.log)
        .toHaveBeenCalledWith(title, 'The nwFlavor setting must be a string.');

      expect(result)
        .toEqual(null);
    });

    test('settings.nwFlavor is match', () => {
      const result = validator.validateNwFlavor({ nwFlavor: 'match' });

      expect(console.log)
        .not.toHaveBeenCalled();

      expect(result)
        .toEqual('match');
    });

    test('settings.nwFlavor is sdk', () => {
      const result = validator.validateNwFlavor({ nwFlavor: 'sdk' });

      expect(console.log)
        .not.toHaveBeenCalled();

      expect(result)
        .toEqual('sdk');
    });

    test('settings.nwFlavor is normal', () => {
      const result = validator.validateNwFlavor({ nwFlavor: 'normal' });

      expect(console.log)
        .not.toHaveBeenCalled();

      expect(result)
        .toEqual('normal');
    });

    test('settings.nwFlavor is adsf', () => {
      const result = validator.validateNwFlavor({ nwFlavor: 'adsf' });

      expect(console.log)
        .toHaveBeenCalledWith(title, 'The nwFlavor setting must be a string of "normal", "sdk", or "match".');

      expect(result)
        .toEqual(null);
    });
  });

  describe('validatePlatform', () => {
    test('No settings.platform', () => {
      const result = validator.validatePlatform({});

      expect(console.log)
        .not.toHaveBeenCalled();

      expect(result)
        .toEqual(null);
    });

    test('settings.platform is not a string', () => {
      const result = validator.validatePlatform({ platform: 3 });

      expect(console.log)
        .toHaveBeenCalledWith(title, 'The platform setting must be a string.');

      expect(result)
        .toEqual(null);
    });

    test('settings.platform is win', () => {
      const result = validator.validatePlatform({ platform: 'win' });

      expect(console.log)
        .not.toHaveBeenCalled();

      expect(result)
        .toEqual('win');
    });

    test('settings.platform is lin', () => {
      const result = validator.validatePlatform({ platform: 'lin' });

      expect(console.log)
        .not.toHaveBeenCalled();

      expect(result)
        .toEqual('lin');
    });

    test('settings.platform is osx', () => {
      const result = validator.validatePlatform({ platform: 'osx' });

      expect(console.log)
        .not.toHaveBeenCalled();

      expect(result)
        .toEqual('osx');
    });

    test('settings.platform is adsf', () => {
      const result = validator.validatePlatform({ platform: 'adsf' });

      expect(console.log)
        .toHaveBeenCalledWith(title, 'The platform setting must be a string of "win", "lin", or "osx".');

      expect(result)
        .toEqual(null);
    });
  });

  describe('validateArch', () => {
    test('No settings.arch', () => {
      const result = validator.validateArch({});

      expect(console.log)
        .not.toHaveBeenCalled();

      expect(result)
        .toEqual(null);
    });

    test('settings.arch is not a string', () => {
      const result = validator.validateArch({ arch: 3 });

      expect(console.log)
        .toHaveBeenCalledWith(title, 'The arch setting must be a string.');

      expect(result)
        .toEqual(null);
    });

    test('settings.arch is x86', () => {
      const result = validator.validateArch({ arch: 'x86' });

      expect(console.log)
        .not.toHaveBeenCalled();

      expect(result)
        .toEqual('x86');
    });

    test('settings.arch is x64', () => {
      const result = validator.validateArch({ arch: 'x64' });

      expect(console.log)
        .not.toHaveBeenCalled();

      expect(result)
        .toEqual('x64');
    });

    test('settings.arch is adsf', () => {
      const result = validator.validateArch({ arch: 'adsf' });

      expect(console.log)
        .toHaveBeenCalledWith(title, 'The arch setting must be a string of "x86" or "x64".');

      expect(result)
        .toEqual(null);
    });
  });

  describe('validateOutputType', () => {
    test('No settings.outputType', () => {
      const result = validator.validateOutputType({});

      expect(console.log)
        .not.toHaveBeenCalled();

      expect(result)
        .toEqual(null);
    });

    test('settings.outputType is not a string', () => {
      const result = validator.validateOutputType({ outputType: 3 });

      expect(console.log)
        .toHaveBeenCalledWith(title, 'The outputType setting must be a string.');

      expect(result)
        .toEqual(null);
    });

    test('settings.outputType is zip', () => {
      const result = validator.validateOutputType({ outputType: 'zip' });

      expect(console.log)
        .not.toHaveBeenCalled();

      expect(result)
        .toEqual('zip');
    });

    test('settings.outputType is 7z', () => {
      const result = validator.validateOutputType({ outputType: '7z' });

      expect(console.log)
        .not.toHaveBeenCalled();

      expect(result)
        .toEqual('7z');
    });

    test('settings.outputType is nsis', () => {
      const result = validator.validateOutputType({ outputType: 'nsis' });

      expect(console.log)
        .not.toHaveBeenCalled();

      expect(result)
        .toEqual('nsis');
    });

    test('settings.outputType is nsis7z', () => {
      const result = validator.validateOutputType({ outputType: 'nsis7z' });

      expect(console.log)
        .not.toHaveBeenCalled();

      expect(result)
        .toEqual('nsis7z');
    });

    test('settings.outputType is adsf', () => {
      const result = validator.validateOutputType({ outputType: 'adsf' });

      expect(console.log)
        .toHaveBeenCalledWith(title, 'The outputType setting must be a string of "zip", "7z", "nsis", or "nsis7z".');

      expect(result)
        .toEqual(null);
    });
  });

  describe('validateOptionsAndTaskDefaults', () => {
    describe('No settings', () => {
      test('no choice', () => {
        const result = validator.validateOptionsAndTaskDefaults();

        expect(console.log)
          .toHaveBeenCalledWith(title, 'validateOptionsAndTaskDefaults requires a string of "options" or "taskDefaults".');

        expect(result)
          .toEqual(undefined);
      });

      test('options', () => {
        const result = validator.validateOptionsAndTaskDefaults(undefined, 'options');

        expect(console.log)
          .not.toHaveBeenCalled();

        expect(result)
          .toEqual(undefined);
      });

      test('taskDefaults', () => {
        const result = validator.validateOptionsAndTaskDefaults(undefined, 'taskDefaults');

        expect(console.log)
          .not.toHaveBeenCalled();

        expect(result)
          .toEqual(undefined);
      });
    });

    test('No settings.options', () => {
      const result = validator.validateOptionsAndTaskDefaults({}, 'options');

      expect(console.log)
        .not.toHaveBeenCalled();

      expect(result)
        .toEqual(undefined);
    });

    test('No settings.taskDefaults', () => {
      const result = validator.validateOptionsAndTaskDefaults({}, 'taskDefaults');

      expect(console.log)
        .not.toHaveBeenCalled();

      expect(result)
        .toEqual(undefined);
    });

    test('settings.options is not an object', () => {
      const result = validator.validateOptionsAndTaskDefaults({ options: 3 }, 'options');

      expect(console.log)
        .toHaveBeenCalledWith(title, 'settings.options must be an object.');

      expect(result)
        .toEqual(undefined);
    });

    test('settings.taskDefaults is not an object', () => {
      const result = validator.validateOptionsAndTaskDefaults({ taskDefaults: 3 }, 'taskDefaults');

      expect(console.log)
        .toHaveBeenCalledWith(title, 'settings.taskDefaults must be an object.');

      expect(result)
        .toEqual(undefined);
    });

    test('settings.options is an array', () => {
      const result = validator.validateOptionsAndTaskDefaults({ options: [] }, 'options');

      expect(console.log)
        .toHaveBeenCalledWith(title, 'settings.options must be an object.');

      expect(result)
        .toEqual(undefined);
    });

    test('settings.taskDefaults is an array', () => {
      const result = validator.validateOptionsAndTaskDefaults({ taskDefaults: [] }, 'taskDefaults');

      expect(console.log)
        .toHaveBeenCalledWith(title, 'settings.taskDefaults must be an object.');

      expect(result)
        .toEqual(undefined);
    });

    test('settings.options is valid', () => {
      validator.validateOptionsAndTaskDefaults(_cloneDeep(customizedSettingsAndTasks), 'options');

      expect(console.log)
        .not.toHaveBeenCalled();

      expect(validator.settings.options)
        .toEqual(_cloneDeep(customizedSettingsAndTasks).options);
    });

    test('settings.taskDefaults is valid', () => {
      validator.validateOptionsAndTaskDefaults(_cloneDeep(customizedSettingsAndTasks), 'taskDefaults');

      expect(console.log)
        .not.toHaveBeenCalled();

      expect(validator.settings.taskDefaults)
        .toEqual(_cloneDeep(customizedSettingsAndTasks).taskDefaults);
    });
  });

  describe('applyDefaultsToTask', () => {
    test('Pass in unsupported keys', () => {
      const result = validator.applyDefaultsToTask({ dog: 'asdf' }, 'dog', 'validateString');

      expect(console.log)
        .toHaveBeenCalledWith(title, 'The dog setting is not supported on tasks.');

      expect(result)
        .toEqual(undefined);
    });
  });

  describe('validateTasks', () => {
    test('No settings', () => {
      const result = validator.validateTasks();

      expect(console.log)
        .not.toHaveBeenCalled();

      expect(result)
        .toEqual(undefined);
    });

    test('No settings.tasks', () => {
      const result = validator.validateTasks({});

      expect(console.log)
        .not.toHaveBeenCalled();

      expect(result)
        .toEqual(undefined);
    });

    test('settings.tasks is not an array', () => {
      const result = validator.validateTasks({ tasks: 3 });

      expect(console.log)
        .toHaveBeenCalledWith(title, 'settings.tasks must be an array.');

      expect(result)
        .toEqual(undefined);
    });

    test('Not all tasks are objects', () => {
      const result = validator.validateTasks({ tasks: [3, 6, 5] });

      expect(console.log)
        .toHaveBeenCalledWith(title, 'All tasks must be objects.');

      expect(result)
        .toEqual(undefined);
    });

    test('settings.tasks is valid', () => {
      validator.validateTasks(_cloneDeep(customizedSettingsAndTasks));

      expect(console.log)
        .not.toHaveBeenCalled();

      expect(validator.settings.tasks)
        .toEqual(_cloneDeep(customizedSettingsAndTasks).tasks);
    });
  });

  describe('buildSettingsObject', () => {
    test('Bad settings are ignored', () => {
      validator.buildSettingsObject({
        options: {
          verbose: false,
          concurrent: 'asdf',
          mirror: 1234,
          output: {}
        },
        taskDefaults: {
          nwVersion: 'asdf',
          nwFlavor: 'asdf',
          platform: 'asdf',
          arch: 'asdf',
          files: 'asdf',
          excludes: 'asdf',
          outputType: 'asdf',
          outputPattern: 1234,
          manifestOverrides: 'asdf',
          strippedManifestProperties: 'asdf',
          junk: 'asdf',
          icon: 1234,
          unIcon: 1234
        },
        tasks: [
          {
            nwVersion: 'asdf',
            nwFlavor: 'asdf',
            platform: 'asdf',
            arch: 'asdf',
            files: 'asdf',
            excludes: 'asdf',
            outputType: 'asdf',
            outputPattern: 1234,
            manifestOverrides: 'asdf',
            strippedManifestProperties: 'asdf',
            junk: 'asdf',
            icon: 1234,
            unIcon: 1234
          }
        ]
      });

      expect(console.log)
        .not.toHaveBeenCalled();

      expect(validator.settings)
        .toEqual({
          options: {
            verbose: false,
            concurrent: true,
            mirror: 'https://dl.nwjs.io/',
            output: './dist'
          },
          taskDefaults: {
            nwVersion: 'match',
            nwFlavor: 'normal',
            platform: 'win',
            arch: 'x86',
            files: ['**/*'],
            excludes: [],
            outputType: 'zip',
            outputPattern: '{{name}}-{{version}}-{{platform}}-{{arch}}',
            manifestOverrides: {},
            strippedManifestProperties: [],
            junk: [],
            icon: undefined,
            unIcon: undefined
          },
          tasks: [
            {
              nwVersion: 'match',
              nwFlavor: 'normal',
              platform: 'win',
              arch: 'x86',
              files: ['**/*'],
              excludes: [],
              outputType: 'zip',
              outputPattern: '{{name}}-{{version}}-{{platform}}-{{arch}}',
              manifestOverrides: {},
              strippedManifestProperties: [],
              junk: [],
              icon: undefined,
              unIcon: undefined
            }
          ]
        });
    });

    test('Settings object is built', () => {
      validator.buildSettingsObject(_cloneDeep(customizedSettingsAndTasks));

      expect(console.log)
        .not.toHaveBeenCalled();

      expect(validator.settings)
        .toEqual(_cloneDeep(customizedSettingsAndTasks));
    });
  });
});
