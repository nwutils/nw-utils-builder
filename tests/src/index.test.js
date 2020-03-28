// Needs to be required before anything else that effects Node's fs module
const mockfs = require('mock-fs');

const fs = require('fs-extra');
const child_process = require('child_process');
const _cloneDeep = require('lodash/cloneDeep');
const fetch = require('node-fetch');
const lolex = require('@sinonjs/fake-timers');

const nwBuilder = require('../../src/index.js');
const mockResponse = require('../mockResponses.js');
const testHelpers = require('../testHelpers.js');

const customizedSettingsAndTasks = testHelpers.customizedSettingsAndTasks;
const title = testHelpers.title;

describe('nw-utils-builder', () => {
  let consoleLog;
  let clock;

  beforeEach(() => {
    nwBuilder.testHelpers.exec = jest.fn();
    clock = lolex.install();
    nwBuilder.resetState();
    consoleLog = console.log;
    console.log = jest.fn();
  });

  afterEach(() => {
    mockfs.restore();
    fetch.restore();
    console.log = consoleLog;
    clock.uninstall();
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

  describe('buildSettingsObject', () => {
    test('Returns defaults', () => {
      nwBuilder.settings = undefined;
      nwBuilder.buildSettingsObject({});

      expect(nwBuilder.settings)
        .toEqual({
          options: {
            verbose: true,
            concurrent: true,
            mirror: 'https://dl.nwjs.io/',
            output: './dist'
          },
          taskDefaults: {
            nwVersion: 'match',
            nwFlavor: 'normal',
            platform: 'win',
            arch: 'x86',
            files: [ '**/*' ],
            excludes: [ 'node_modules' ],
            junk: [],
            manifestOverrides: {},
            outputPattern: '{{name}}-{{version}}-{{platform}}-{{arch}}',
            outputType: 'zip',
            strippedManifestProperties: [],
            icon: undefined,
            unIcon: undefined
          },
          tasks: []
        });
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

  describe('getNwVersionDetails', () => {
    test('Network request fails', async () => {
      fetch.get('begin:https://nwjs.io/versions.json', 500);

      await nwBuilder.getNwVersionDetails();

      expect(console.log)
        .toHaveBeenCalledWith(title, 'Error getting details about latest NW.js versions. Using hard-coded versions.');

      expect(console.log)
        .toHaveBeenCalledWith(title, nwBuilder.nwVersionMap);
    });

    test('JSON parse fails', async () => {
      fetch.get('begin:https://nwjs.io/versions.json', 'Invalid JSON');

      await nwBuilder.getNwVersionDetails();

      expect(console.log)
        .toHaveBeenCalledWith(title, 'Error getting details about latest NW.js versions. Using hard-coded versions.');

      expect(console.log)
        .toHaveBeenCalledWith(title, nwBuilder.nwVersionMap);
    });

    test('Network request succeeds', async () => {
      const fakeResponse = {
        latest: 'v100.100.100',
        stable: 'v90.90.90',
        lts: 'v80.80.80',
        versions: [{
          version: 'v70.70.70'
        }]
      };
      fetch.get('begin:https://nwjs.io/versions.json', JSON.stringify(fakeResponse));

      await nwBuilder.getNwVersionDetails();

      expect(console.log)
        .not.toHaveBeenCalled();

      expect(nwBuilder.nwVersionMap)
        .toEqual({
          latest: 'v100.100.100',
          stable: 'v90.90.90',
          lts: 'v80.80.80'
        });

      expect(nwBuilder.allNwVersions)
        .toEqual([{
          version: 'v70.70.70'
        }]);
    });
  });

  describe('applyNwVersionMapToTasks', () => {
    test('No tasks', () => {
      nwBuilder.settings = {
        options: { verbose: true },
        tasks: []
      };

      nwBuilder.applyNwVersionMapToTasks();

      expect(console.log)
        .not.toHaveBeenCalled();

      expect(nwBuilder.settings.tasks)
        .toEqual([]);
    });

    test('latest', () => {
      nwBuilder.settings = {
        options: { verbose: true },
        tasks: [{ nwVersion: 'latest' }]
      };

      nwBuilder.applyNwVersionMapToTasks();

      expect(console.log)
        .not.toHaveBeenCalled();

      expect(nwBuilder.settings.tasks[0].nwVersion)
        .toEqual('v0.43.0-beta1');
    });

    test('stable', () => {
      nwBuilder.settings = {
        options: { verbose: true },
        tasks: [{ nwVersion: 'stable' }]
      };

      nwBuilder.applyNwVersionMapToTasks();

      expect(console.log)
        .not.toHaveBeenCalled();

      expect(nwBuilder.settings.tasks[0].nwVersion)
        .toEqual('v0.42.6');
    });

    test('lts', () => {
      nwBuilder.settings = {
        options: { verbose: true },
        tasks: [{ nwVersion: 'lts' }]
      };

      nwBuilder.applyNwVersionMapToTasks();

      expect(console.log)
        .not.toHaveBeenCalled();

      expect(nwBuilder.settings.tasks[0].nwVersion)
        .toEqual('v0.14.7');
    });

    test('match missing manifest', () => {
      const version = 'match';
      const task = { nwVersion: version };
      nwBuilder.settings = {
        options: { verbose: true },
        tasks: [task]
      };

      nwBuilder.manifest = undefined;

      nwBuilder.applyNwVersionMapToTasks();


      expect(console.log)
        .toHaveBeenCalledWith(
          title,
          'A task with an "nwVersion" of "match" was set, ' +
          'but no "nw" devDependency was found in your package.json ' +
          'or manifest.json. Falling back to the latest stable version.'
        );

      expect(console.log)
        .toHaveBeenCalledWith(title, task);

      expect(nwBuilder.settings.tasks[0].nwVersion)
        .toEqual(nwBuilder.nwVersionMap.stable);
    });

    test('match missing devDependencies', () => {
      const version = 'match';
      const task = { nwVersion: version };
      nwBuilder.settings = {
        options: { verbose: true },
        tasks: [task]
      };

      nwBuilder.manifest = {};

      nwBuilder.applyNwVersionMapToTasks();


      expect(console.log)
        .toHaveBeenCalledWith(
          title,
          'A task with an "nwVersion" of "match" was set, ' +
          'but no "nw" devDependency was found in your package.json ' +
          'or manifest.json. Falling back to the latest stable version.'
        );

      expect(console.log)
        .toHaveBeenCalledWith(title, task);

      expect(nwBuilder.settings.tasks[0].nwVersion)
        .toEqual(nwBuilder.nwVersionMap.stable);
    });

    test('match missing nw', () => {
      const version = 'match';
      const task = { nwVersion: version };
      nwBuilder.settings = {
        options: { verbose: true },
        tasks: [task]
      };

      nwBuilder.manifest = {
        devDependencies: {}
      };

      nwBuilder.applyNwVersionMapToTasks();


      expect(console.log)
        .toHaveBeenCalledWith(
          title,
          'A task with an "nwVersion" of "match" was set, ' +
          'but no "nw" devDependency was found in your package.json ' +
          'or manifest.json. Falling back to the latest stable version.'
        );

      expect(console.log)
        .toHaveBeenCalledWith(title, task);

      expect(nwBuilder.settings.tasks[0].nwVersion)
        .toEqual(nwBuilder.nwVersionMap.stable);
    });

    test('match latest', () => {
      nwBuilder.settings = {
        options: { verbose: true },
        tasks: [{ nwVersion: 'match' }]
      };

      nwBuilder.manifest = {
        devDependencies: {
          nw: 'latest'
        }
      };

      nwBuilder.applyNwVersionMapToTasks();

      expect(console.log)
        .not.toHaveBeenCalled();

      expect(nwBuilder.settings.tasks[0].nwVersion)
        .toEqual(nwBuilder.nwVersionMap.latest);
    });

    test('match sdk', () => {
      nwBuilder.settings = {
        options: { verbose: true },
        tasks: [{ nwVersion: 'match' }]
      };

      nwBuilder.manifest = {
        devDependencies: {
          nw: 'sdk'
        }
      };

      nwBuilder.applyNwVersionMapToTasks();

      expect(console.log)
        .not.toHaveBeenCalled();

      expect(nwBuilder.settings.tasks[0].nwVersion)
        .toEqual(nwBuilder.nwVersionMap.latest);
    });

    test('match version', () => {
      nwBuilder.settings = {
        options: { verbose: true },
        tasks: [{ nwVersion: 'match' }]
      };

      nwBuilder.manifest = {
        devDependencies: {
          nw: '^0.23.2-sdk'
        }
      };

      nwBuilder.applyNwVersionMapToTasks();

      expect(console.log)
        .not.toHaveBeenCalled();

      expect(nwBuilder.settings.tasks[0].nwVersion)
        .toEqual('v0.23.2');
    });

    test('match version is invalid', () => {
      const version = 'match';
      const task = { nwVersion: version };
      nwBuilder.settings = {
        options: { verbose: true },
        tasks: [task]
      };

      nwBuilder.manifest = {
        devDependencies: {
          nw: 'x.x.x'
        }
      };

      nwBuilder.applyNwVersionMapToTasks();

      expect(console.log)
        .toHaveBeenCalledWith(
          title,
          'A task with an "nwVersion" of "match" was set, ' +
          'but the version for your "nw" devDependency was ' +
          'not valid. Falling back to the latest stable version.'
        );

      expect(console.log)
        .toHaveBeenCalledWith(title, task);

      expect(nwBuilder.settings.tasks[0].nwVersion)
        .toEqual('v0.42.6');
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

  describe('resetState', () => {
    test('Resets state', () => {
      nwBuilder.settings = {
        options: {},
        tasks: []
      };
      nwBuilder.manifest = {
        name: 'test',
        main: 'index.html'
      };
      nwBuilder.nwVersionMap = {
        latest: 'v1.0.1',
        stable: 'v1.0.0',
        lts: 'v0.1.0'
      };

      nwBuilder.resetState();

      expect(nwBuilder.settings)
        .toEqual(undefined);

      expect(nwBuilder.manifest)
        .toEqual(undefined);

      expect(nwBuilder.nwVersionMap)
        .toEqual({
          latest: 'v0.43.0-beta1',
          stable: 'v0.42.6',
          lts: 'v0.14.7'
        });
    });
  });

  describe('processTasks', () => {
    test('Tasks have been processed', () => {
      const originalManifest = {
        name: 'test',
        version: '1.0.0',
        main: 'index.html',
        devDependencies: {
          nw: 'sdk'
        }
      };
      mockfs({
        'index.html': '<!DOCTYPE html><html><h1>Hello World</h1></html>',
        'package.json': JSON.stringify(originalManifest, null, 2)
      });

      expect(fs.readdirSync('.'))
        .toEqual([
          'index.html',
          'package.json'
        ]);

      nwBuilder.readManifest();
      nwBuilder.buildSettingsObject({
        tasks: [{
          strippedManifestProperties: ['devDependencies']
        }]
      });
      nwBuilder.applyManifestToTasks();

      expect(nwBuilder.settings.tasks)
        .toEqual([{
          nwVersion: 'v0.43.0-beta1',
          nwFlavor: 'normal',
          platform: 'win',
          arch: 'x86',
          files: ['**/*'],
          excludes: ['node_modules'],
          junk: [],
          manifestOverrides: {},
          strippedManifestProperties: ['devDependencies'],
          name: 'test-1.0.0-win-x86',
          outputType: 'zip',
          outputPattern: '{{name}}-{{version}}-{{platform}}-{{arch}}',
          icon: undefined,
          unIcon: undefined
        }]);

      nwBuilder.processTasks();

      expect(nwBuilder.settings.tasks)
        .toEqual([{
          nwVersion: 'v0.43.0-beta1',
          nwFlavor: 'normal',
          platform: 'win',
          arch: 'x86',
          files: ['**/*'],
          excludes: [
            'node_modules',
            './dist'
          ],
          junk: [],
          manifestOverrides: {},
          strippedManifestProperties: ['devDependencies'],
          name: 'test-1.0.0-win-x86',
          outputType: 'zip',
          outputPattern: '{{name}}-{{version}}-{{platform}}-{{arch}}',
          icon: undefined,
          unIcon: undefined
        }]);

      expect(fs.readdirSync('.'))
        .toEqual([
          'dist',
          'index.html',
          'package.json'
        ]);

      expect(fs.readdirSync('./dist'))
        .toEqual(['test-1.0.0-win-x86']);

      expect(fs.readdirSync('./dist/test-1.0.0-win-x86'))
        .toEqual([
          'index.html',
          'package.json'
        ]);

      expect(JSON.parse(fs.readFileSync('./dist/test-1.0.0-win-x86/package.json')))
        .toEqual({
          name: 'test',
          version: '1.0.0',
          main: 'index.html'
        });

      expect(nwBuilder.testHelpers.exec)
        .toHaveBeenCalledWith('npm install');
    });

    test('Handles no tasks being passed in', () => {
      const execSpy = jest.spyOn(child_process, 'execSync');

      nwBuilder.settings = { tasks: [] };
      nwBuilder.testHelpers = {};

      expect(nwBuilder.processTasks())
        .toEqual(undefined);

      expect(execSpy)
        .not.toHaveBeenCalled();
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
      fetch.get('begin:https://nwjs.io/versions.json', mockResponse);

      mockfs({
        'package.json': '{ "name": "test-name" }'
      });

      expect(nwBuilder.settings)
        .toEqual(undefined);

      await nwBuilder.build(_cloneDeep(customizedSettingsAndTasks));

      expect(console.log)
        .not.toHaveBeenCalled();

      // Restore fs so snapshots work
      mockfs.restore();
      expect(nwBuilder.settings)
        .toMatchSnapshot();

      expect(nwBuilder.testHelpers.exec)
        .toHaveBeenCalledWith('npm install');
    });

    test('No manifest found', async () => {
      fetch.get('begin:https://nwjs.io/versions.json', mockResponse);

      mockfs({});

      await nwBuilder.build(_cloneDeep(customizedSettingsAndTasks));

      expect(console.log)
        .toHaveBeenCalledWith(title, 'No package.json or manifest.json file found, cannot build.');

      expect(nwBuilder.testHelpers.exec)
        .not.toHaveBeenCalled();
    });
  });

  describe('dryRun', () => {
    test('No Settings', () => {
      const result = nwBuilder.dryRun();

      expect(console.log)
        .toHaveBeenCalledWith(title, 'No settings passed in.');

      expect(result)
        .toEqual(undefined);

      expect(nwBuilder.testHelpers.exec)
        .not.toHaveBeenCalled();
    });

    test('Settings are empty', () => {
      const results = nwBuilder.dryRun({ tasks: [{}] });

      expect(console.log)
        .not.toHaveBeenCalled();

      // restore fs for snapshot
      mockfs.restore();
      expect(results)
        .toMatchSnapshot();

      expect(nwBuilder.testHelpers.exec)
        .not.toHaveBeenCalled();
    });

    test('Settings are applied correctly', () => {
      const result = nwBuilder.dryRun(_cloneDeep(customizedSettingsAndTasks));

      expect(console.log)
        .not.toHaveBeenCalled();

      expect(result)
        .toEqual(_cloneDeep(customizedSettingsAndTasks));

      expect(nwBuilder.testHelpers.exec)
        .not.toHaveBeenCalled();
    });
  });
});
