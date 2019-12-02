const _cloneDeep = require('lodash.clonedeep');

const nwBuilder = require('../src/index.js');
const customizedSettingsAndTasks = require('./test-helpers.js').customizedSettingsAndTasks;

const title = 'NW-UTILS-BUILDER:';

describe('nw-utils-builder', () => {
  let consoleLog;

  beforeEach(() => {
    nwBuilder.resetState();
    consoleLog = console.log;
    console.log = jest.fn();
  });

  afterEach(() => {
    console.log = consoleLog;
  });

  describe('Log', () => {
    test('Error true', () => {
      try {
        nwBuilder.log('B', { global: { verbose: true } }, true);
      } catch (error) {
        expect(console.log)
          .toHaveBeenCalledWith(title);

        expect(error)
          .toEqual('B');
      }
    });
  });

  describe('build', () => {
    test('No Settings', () => {
      const result = nwBuilder.build();

      expect(console.log)
        .toHaveBeenCalledWith(title, 'No settings passed in.');

      expect(result)
        .toEqual(undefined);
    });

    test('Settings are applied correctly', () => {
      expect(nwBuilder.settings)
        .toEqual(undefined);

      nwBuilder.build(_cloneDeep(customizedSettingsAndTasks));

      expect(console.log)
        .not.toHaveBeenCalled();

      expect(nwBuilder.settings)
        .toEqual(_cloneDeep(customizedSettingsAndTasks));
    });
  });

  describe('dryRun', () => {
    test('No Settings', () => {
      const result = nwBuilder.dryRun();

      expect(console.log)
        .toHaveBeenCalledWith(title, 'No settings passed in.');

      expect(result)
        .toEqual(undefined);
    });

    test('Settings are empty', () => {
      const results = nwBuilder.dryRun({ tasks: [{}] });

      expect(console.log)
        .not.toHaveBeenCalled();

      expect(results)
        .toMatchSnapshot();
    });

    test('Settings are applied correctly', () => {
      const result = nwBuilder.dryRun(_cloneDeep(customizedSettingsAndTasks));

      expect(console.log)
        .not.toHaveBeenCalled();

      expect(result)
        .toEqual(_cloneDeep(customizedSettingsAndTasks));
    });
  });
});
