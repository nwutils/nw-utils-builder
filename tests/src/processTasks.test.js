// Needs to be required before anything else that effects Node's fs module
const mockfs = require('mock-fs');

const fs = require('fs-extra');
// const _cloneDeep = require('lodash/cloneDeep');
const fetch = require('node-fetch');
const lolex = require('lolex');

const nwBuilder = require('../../src/index.js');
const processTasks = require('../../src/processTasks.js');
// const testHelpers = require('../testHelpers.js');

// const title = testHelpers.title;

describe('Process Tasks', () => {
  let consoleLog;
  let clock;

  beforeEach(() => {
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

  describe('cleanDist', () => {
    test('Deletes old build', () => {
      const originalManifest = {
        name: 'test',
        version: '1.0.0',
        devDependencies: {
          nw: 'sdk'
        }
      };
      mockfs({
        'package.json': JSON.stringify(originalManifest, null, 2),
        dist: {
          'test-1.0.0-win-x86': {
            'package.json': 'data'
          }
        }
      });

      nwBuilder.readManifest();
      nwBuilder.buildSettingsObject({ tasks: [{}] });
      nwBuilder.applyManifestToTasks();

      expect(fs.readdirSync('.'))
        .toEqual(['dist', 'package.json']);

      expect(fs.readdirSync('./dist'))
        .toEqual(['test-1.0.0-win-x86']);

      expect(fs.readdirSync('./dist/test-1.0.0-win-x86'))
        .toEqual(['package.json']);


    });
  });

  describe('tweakManifestForSpecificTask', () => {
    test('Omit stripped properties', () => {
      const manifest = {
        name: 'app',
        version: '1.0.0',
        main: 'index.html',
        scripts: {
          start: 'nw .'
        },
        dependencies: {
          lodash: '^4.0.0'
        },
        devDependencies: {
          nw: 'latest',
          eslint: '^6.7.1'
        },
        a: {
          b: true,
          c: {
            d: {
              e: true,
              f: true
            },
            g: {
              h: true
            }
          },
          i: true
        }
      };
      processTasks.manifest = manifest;

      const response = processTasks.tweakManifestForSpecificTask({
        strippedManifestProperties: [
          'scripts',
          'devDependencies',
          'a.c.d.e'
        ]
      });

      expect(response)
        .toEqual({
          name: 'app',
          version: '1.0.0',
          main: 'index.html',
          dependencies: {
            lodash: '^4.0.0'
          },
          a: {
            b: true,
            c: {
              d: {
                f: true
              },
              g: {
                h: true
              }
            },
            i: true
          }
        });

      expect(processTasks.manifest)
        .toEqual(manifest);
    });

    test('Override properties', () => {
      const manifest = {
        name: 'app',
        version: '1.0.0',
        main: 'index.html',
        scripts: {
          start: 'nw .'
        },
        dependencies: {
          lodash: '^4.0.0'
        }
      };
      processTasks.manifest = manifest;

      const response = processTasks.tweakManifestForSpecificTask({
        manifestOverrides: {
          name: 'app-xp',
          main: 'http://localhost:8494',
          'node-main': 'server.js',
          'node-remote': 'http://localhost:8494',
          scripts: {
            serve: 'node server.js'
          }
        }
      });

      expect(response)
        .toEqual({
          name: 'app-xp',
          version: '1.0.0',
          main: 'http://localhost:8494',
          'node-main': 'server.js',
          'node-remote': 'http://localhost:8494',
          scripts: {
            start: 'nw .',
            serve: 'node server.js'
          },
          dependencies: {
            lodash: '^4.0.0'
          }
        });

      expect(processTasks.manifest)
        .toEqual(manifest);
    });
  });

  describe('processTasks', () => {
    /*
    test('Fail to create dist folder for task', () => {
      const originalManifest = {
        name: 'test',
        version: '1.0.0',
        devDependencies: {
          nw: 'sdk'
        }
      };
      mockfs({
        'package.json': JSON.stringify(originalManifest, null, 2),
        dist: mockfs.directory({
          mode: parseInt('0400', 8)
        })
      });

      expect(fs.readdirSync('.'))
        .toEqual(['dist', 'package.json']);

      nwBuilder.readManifest();
      nwBuilder.buildSettingsObject({ tasks: [{}] });
      nwBuilder.applyManifestToTasks();

      nwBuilder.processTasks();

      expect(console.log)
        .toHaveBeenCalledWith(title, 'Unable to save modifed manifest on task.');

      expect(console.log)
        .toHaveBeenCalledWith(title, processTasks.settings.tasks[0]);

      expect(console.log.mock.calls[2][0])
        .toEqual(title);

      expect(console.log.mock.calls[2][1].message.startsWith('EACCES: permission denied, mkdir '))
        .toEqual(true);

      expect(fs.readdirSync('./dist'))
        .toEqual([]);
    });

    test('Fail to write manifest file for task', () => {
      const originalManifest = {
        name: 'test',
        version: '1.0.0',
        devDependencies: {
          nw: 'sdk'
        }
      };
      mockfs({
        'package.json': JSON.stringify(originalManifest, null, 2),
        dist: {
          'test-1.0.0-win-x86': {
            'package.json': mockfs.file({
              content: '{ "name": "immutable", "version": "10.10.10" }',
              mode: parseInt('0400', 8)
            })
          }
        }
      });

      expect(fs.readdirSync('.'))
        .toEqual(['dist', 'package.json']);

      nwBuilder.readManifest();
      nwBuilder.buildSettingsObject({ tasks: [{}] });
      nwBuilder.applyManifestToTasks();

      nwBuilder.processTasks();

      expect(console.log)
        .toHaveBeenCalledWith(title, 'Unable to save modifed manifest on task.');

      expect(console.log)
        .toHaveBeenCalledWith(title, nwBuilder.settings.tasks[0]);

      expect(console.log.mock.calls[2][0])
        .toEqual(title);

      const thirdConsoleLog = console.log.mock.calls[2][1].message.split('\\').join('/');

      expect(thirdConsoleLog)
        .toEqual('EACCES: permission denied, open \'dist/test-1.0.0-win-x86/package.json\'');

      expect(fs.readdirSync('./dist'))
        .toEqual(['test-1.0.0-win-x86']);

      expect(fs.readdirSync('./dist/test-1.0.0-win-x86'))
        .toEqual(['package.json']);

      const savedFile = fs.readFileSync('./dist/test-1.0.0-win-x86/package.json');

      expect(JSON.parse(savedFile))
        .toEqual({
          name: 'immutable',
          version: '10.10.10'
        });
    });

    test('Saves manifest to file', () => {
      processTasks.processTasks({
        manifest: {
          name: 'test',
          version: '1.0.0',
          devDependencies: {
            nw: 'sdk'
          }
        }
      });

      expect(fs.readdirSync('.'))
        .toEqual(['package.json']);

      nwBuilder.readManifest();
      nwBuilder.buildSettingsObject({
        tasks: [{
          strippedManifestProperties: ['devDependencies']
        }]
      });
      nwBuilder.applyManifestToTasks();

      nwBuilder.processTasks();

      expect(fs.readdirSync('./dist'))
        .toEqual(['test-1.0.0-win-x86']);

      expect(fs.readdirSync('./dist/test-1.0.0-win-x86'))
        .toEqual(['package.json']);

      const savedFile = fs.readFileSync('./dist/test-1.0.0-win-x86/package.json');

      expect(JSON.parse(savedFile))
        .toEqual({
          name: 'test',
          version: '1.0.0'
        });

      expect(console.log)
        .not.toHaveBeenCalled();
    });

    */
  });
});
