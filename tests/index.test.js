const _cloneDeep = require('lodash.clonedeep');
const mockfs = require('mock-fs');

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
    mockfs.restore();
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

  describe('readManifest', () => {
    test('Reads package.json', () => {
      mockfs({
        'package.json': '{ "name": "test" }'
      });

      expect(nwBuilder.manifest)
        .toEqual(undefined);

      nwBuilder.readManifest();

      expect(nwBuilder.manifest)
        .toEqual({ name: 'test' });
    });

    test('Reads manifest.json', () => {
      mockfs({
        'manifest.json': '{ "name": "test" }'
      });

      expect(nwBuilder.manifest)
        .toEqual(undefined);

      nwBuilder.readManifest();

      expect(nwBuilder.manifest)
        .toEqual({ name: 'test' });
    });

    test('No manifest found', () => {
      mockfs({});

      expect(nwBuilder.manifest)
        .toEqual(undefined);

      nwBuilder.readManifest();

      expect(nwBuilder.manifest)
        .toEqual(undefined);
    });
  });

  describe('applyNwFlavorMapToTasks', () => {
    test('No tasks', () => {
      nwBuilder.settings = {
        options: { verbose: true },
        tasks: []
      };
      nwBuilder.applyNwFlavorMapToTasks();

      expect(console.log)
        .not.toHaveBeenCalled();

      expect(nwBuilder.settings.tasks)
        .toEqual([]);
    });

    test('sdk', () => {
      nwBuilder.settings = {
        options: { verbose: true },
        tasks: [{ nwFlavor: 'sdk' }]
      };

      nwBuilder.applyNwFlavorMapToTasks();

      expect(console.log)
        .not.toHaveBeenCalled();

      expect(nwBuilder.settings.tasks[0].nwFlavor)
        .toEqual('sdk');
    });

    test('normal', () => {
      nwBuilder.settings = {
        options: { verbose: true },
        tasks: [{ nwFlavor: 'normal' }]
      };

      nwBuilder.applyNwFlavorMapToTasks();

      expect(console.log)
        .not.toHaveBeenCalled();

      expect(nwBuilder.settings.tasks[0].nwFlavor)
        .toEqual('normal');
    });

    test('match sdk', () => {
      nwBuilder.settings = {
        options: { verbose: true },
        tasks: [{ nwFlavor: 'match' }]
      };

      nwBuilder.manifest = {
        devDependencies: {
          nw: '0.42.0-sdk'
        }
      };

      nwBuilder.applyNwFlavorMapToTasks();

      expect(console.log)
        .not.toHaveBeenCalled();

      expect(nwBuilder.settings.tasks[0].nwFlavor)
        .toEqual('sdk');
    });

    test('match normal', () => {
      nwBuilder.settings = {
        options: { verbose: true },
        tasks: [{ nwFlavor: 'match' }]
      };

      nwBuilder.manifest = {
        devDependencies: {
          nw: '0.42.0'
        }
      };

      nwBuilder.applyNwFlavorMapToTasks();

      expect(console.log)
        .not.toHaveBeenCalled();

      expect(nwBuilder.settings.tasks[0].nwFlavor)
        .toEqual('normal');
    });

    test('match missing nw', () => {
      const flavor = 'match';
      const task = { nwFlavor: flavor };
      nwBuilder.settings = {
        options: { verbose: true },
        tasks: [task]
      };

      nwBuilder.manifest = {
        devDependencies: {}
      };

      nwBuilder.applyNwFlavorMapToTasks();

      expect(console.log)
        .toHaveBeenCalledWith(
          title,
          'A task with an "nwFlavor" of "match" was set, ' +
          'but no "nw" devDependency was found in your package.json ' +
          'or manifest.json. Falling back to "normal".'
        );

      expect(console.log)
        .toHaveBeenCalledWith(title, task);

      expect(nwBuilder.settings.tasks[0].nwFlavor)
        .toEqual('normal');
    });

    test('match missing devDependencies', () => {
      const flavor = 'match';
      const task = { nwFlavor: flavor };
      nwBuilder.settings = {
        options: { verbose: true },
        tasks: [task]
      };

      nwBuilder.manifest = {};

      nwBuilder.applyNwFlavorMapToTasks();

      expect(console.log)
        .toHaveBeenCalledWith(
          title,
          'A task with an "nwFlavor" of "match" was set, ' +
          'but no "nw" devDependency was found in your package.json ' +
          'or manifest.json. Falling back to "normal".'
        );

      expect(console.log)
        .toHaveBeenCalledWith(title, task);

      expect(nwBuilder.settings.tasks[0].nwFlavor)
        .toEqual('normal');
    });

    test('match missing manifest', () => {
      const flavor = 'match';
      const task = { nwFlavor: flavor };
      nwBuilder.settings = {
        options: { verbose: true },
        tasks: [task]
      };

      nwBuilder.manifest = undefined;

      nwBuilder.applyNwFlavorMapToTasks();

      expect(console.log)
        .toHaveBeenCalledWith(
          title,
          'A task with an "nwFlavor" of "match" was set, ' +
          'but no "nw" devDependency was found in your package.json ' +
          'or manifest.json. Falling back to "normal".'
        );

      expect(console.log)
        .toHaveBeenCalledWith(title, task);

      expect(nwBuilder.settings.tasks[0].nwFlavor)
        .toEqual('normal');
    });
  });

  describe('applyTaskNames', () => {
    test('No tasks', () => {
      nwBuilder.settings = {
        tasks: []
      };
      nwBuilder.applyTaskNames();

      expect(nwBuilder.settings.tasks)
        .toEqual([]);
    });

    test('All keywords', () => {
      mockfs({
        'package.json': '{ "name": "test-name", "version": "21.22.23" }'
      });
      const allKeywords = [
        '{{name}}',
        '{{version}}',
        '{{nwVersion}}',
        '{{nwFlavor}}',
        '{{platform}}',
        '{{arch}}',
        '{{outputType}}'
      ].join('-');

      nwBuilder.readManifest();
      nwBuilder.settings = {
        tasks: [
          {
            nwVersion: '0.42.5',
            nwFlavor: 'sdk',
            platform: 'win',
            arch: 'x64',
            outputType: 'nsis',
            outputPattern: allKeywords
          }
        ]
      };
      nwBuilder.applyTaskNames();

      expect(nwBuilder.settings.tasks[0].name)
        .toEqual('test-name-21.22.23-0.42.5-sdk-win-x64-nsis');
    });

    test('Keyword missing a value', () => {
      const someKeywords = [
        '{{platform}}',
        '{{arch}}',
        '{{nwFlavor}}'
      ].join('-');

      nwBuilder.settings = {
        tasks: [
          {
            platform: 'lin',
            arch: 'x86',
            outputPattern: someKeywords
          }
        ]
      };
      nwBuilder.applyTaskNames();

      expect(nwBuilder.settings.tasks[0].name)
        .toEqual('lin-x86-nwFlavor');
    });
  });

  describe('build', () => {
    test('No Settings', async () => {
      const result = await nwBuilder.build();

      expect(console.log)
        .toHaveBeenCalledWith(title, 'No settings passed in.');

      expect(result)
        .toEqual(undefined);
    });

    test('Settings are applied correctly', async () => {
      mockfs({
        'package.json': '{ "name": "test-name" }'
      });

      expect(nwBuilder.settings)
        .toEqual(undefined);

      await nwBuilder.build(_cloneDeep(customizedSettingsAndTasks));

      expect(console.log)
        .not.toHaveBeenCalled();

      expect(nwBuilder.settings)
        .toMatchSnapshot();
    });

    test('No manifest found', async () => {
      mockfs({});
      await nwBuilder.build(_cloneDeep(customizedSettingsAndTasks));

      expect(console.log)
        .toHaveBeenCalledWith(title, 'No package.json or manifest.json file found, cannot build.');
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
