// Needs to be required before anything else that effects Node's fs module
const mockfs = require('mock-fs');

const fs = require('fs-extra');
const _cloneDeep = require('lodash/cloneDeep');
const fetch = require('node-fetch');
const lolex = require('@sinonjs/fake-timers');

const processTasks = require('../../src/processTasks.js');
const testHelpers = require('../testHelpers.js');

const title = testHelpers.title;

describe('Process Tasks', () => {
  let consoleLog;
  let clock;

  beforeEach(() => {
    clock = lolex.install();
    processTasks.resetState({
      nwVersionMap: undefined,
      settings: undefined,
      manifest: undefined
    });
    consoleLog = console.log;
    console.log = jest.fn();
  });

  afterEach(() => {
    mockfs.restore();
    fetch.restore();
    console.log = consoleLog;
    clock.uninstall();
  });

  /**
   * Clean Dist relies on fs-extra's removeSync, which calls
   * exec (rd /s /q || rimraf) instead of Node's FS module.
   * This means we can't mock the file system to verify deletion.
   * Checking if files exist via mock-fs will still show them.
   */
  describe('cleanDist', () => {
    let spyRemoveSync;

    beforeEach(() => {
      spyRemoveSync = jest.spyOn(fs, 'removeSync');
      processTasks.dist = './dist/test-1.0.0-win-x86';
    });

    afterEach(() => {
      spyRemoveSync.mockRestore();
    });

    test('Deletes old build', () => {
      mockfs({ dist: {} });

      processTasks.cleanDist();

      expect(spyRemoveSync)
        .toHaveBeenCalledWith(processTasks.dist);

      expect(console.log)
        .not.toHaveBeenCalled();
    });

    test('Fails to delete old build files', () => {
      mockfs({
        dist: {
          'test-1.0.0-win-x86': {
            'file.txt': 'data',
            'folder': {
              'sub-file.txt': 'More text'
            },
            'package.json': mockfs.file({
              content: 'Some text',
              mode: parseInt('0000', 8)
            })
          }
        }
      });

      const fsRemoveSync = fs.removeSync;
      fs.removeSync = jest.fn(() => {
        throw new Error('Error Message');
      });

      processTasks.cleanDist();

      expect(console.log)
        .toHaveBeenCalledWith(title, 'Error cleaning out task folder before build.');

      expect(console.log)
        .toHaveBeenCalledWith(title, processTasks.dist);

      expect(console.log.mock.calls[2][0])
        .toEqual(title);

      expect(console.log.mock.calls[2][1].message)
        .toEqual('Error Message');

      fs.removeSynce = fsRemoveSync;
    });
  });

  describe('copyFiles', () => {
    beforeEach(() => {
      processTasks.dist = './dist/test-1.0.0-win-x86';

      processTasks.manifest = {
        name: 'test',
        main: 'index.html',
        version: '1.0.0'
      };

      processTasks.settings = {
        options: {
          verbose: true,
          output: './dist'
        },
        tasks: [{
          files: ['**/*'],
          excludes: []
        }]
      };
    });

    test('Copies files', () => {
      mockfs({
        'package.json': JSON.stringify(processTasks.manifest, null, 2),
        'file.txt': 'Some text',
        'folder': {
          'sub-file.txt': 'More text'
        }
      });

      processTasks.copyFiles(processTasks.settings.tasks[0]);

      expect(fs.readdirSync('.'))
        .toEqual([
          'dist',
          'file.txt',
          'folder',
          'package.json'
        ]);

      expect(fs.readdirSync('./dist'))
        .toEqual(['test-1.0.0-win-x86']);

      expect(fs.readdirSync('./dist/test-1.0.0-win-x86'))
        .toEqual([
          'file.txt',
          'folder',
          'package.json'
        ]);

      expect(fs.readdirSync('./dist/test-1.0.0-win-x86/folder'))
        .toEqual(['sub-file.txt']);

      expect(JSON.parse(fs.readFileSync('./dist/test-1.0.0-win-x86/package.json')))
        .toEqual(processTasks.manifest);

      expect(String(fs.readFileSync('./dist/test-1.0.0-win-x86/file.txt')))
        .toEqual('Some text');

      expect(String(fs.readFileSync('./dist/test-1.0.0-win-x86/folder/sub-file.txt')))
        .toEqual('More text');

      expect(console.log)
        .not.toHaveBeenCalled();
    });

    test('Fails to create dist folder', () => {
      mockfs({
        'dist': mockfs.directory({
          mode: parseInt('0400', 8)
        }),
        'package.json': JSON.stringify(processTasks.manifest, null, 2),
        'file.txt': 'Some text',
        'folder': {
          'sub-file.txt': 'More text'
        }
      });

      processTasks.copyFiles(processTasks.settings.tasks[0]);

      expect(fs.readdirSync('.'))
        .toEqual([
          'dist',
          'file.txt',
          'folder',
          'package.json'
        ]);

      expect(fs.readdirSync('./dist'))
        .toEqual([]);

      expect(console.log)
        .toHaveBeenCalledWith(title, 'Error copying file.');

      expect(console.log.mock.calls[1][0])
        .toEqual(title);


      expect(console.log.mock.calls[1][1].path)
        .toEqual('file.txt');

      expect(console.log.mock.calls[2][0])
        .toEqual(title);

      expect(console.log.mock.calls[2][1].message.startsWith('EACCES: permission denied'))
        .toEqual(true);
    });

    test('Fails to copy file', () => {
      mockfs({
        'file.txt': mockfs.file({
          content: 'Some text',
          mode: parseInt('0000', 8)
        }),
        'package.json': JSON.stringify(processTasks.manifest, null, 2),
        'folder': {
          'sub-file.txt': 'More text'
        }
      });

      processTasks.copyFiles(processTasks.settings.tasks[0]);

      expect(fs.readdirSync('.'))
        .toEqual([
          'dist',
          'file.txt',
          'folder',
          'package.json'
        ]);

      expect(fs.readdirSync('./dist'))
        .toEqual(['test-1.0.0-win-x86']);

      expect(fs.readdirSync('./dist/test-1.0.0-win-x86'))
        .toEqual([
          'folder',
          'package.json'
        ]);

      expect(fs.readdirSync('./dist/test-1.0.0-win-x86/folder'))
        .toEqual(['sub-file.txt']);

      expect(JSON.parse(fs.readFileSync('./dist/test-1.0.0-win-x86/package.json')))
        .toEqual(processTasks.manifest);

      expect(String(fs.readFileSync('./dist/test-1.0.0-win-x86/folder/sub-file.txt')))
        .toEqual('More text');

      expect(console.log)
        .toHaveBeenCalledWith(title, 'Error copying file.');

      expect(console.log.mock.calls[1][0])
        .toEqual(title);

      expect(console.log.mock.calls[1][1].path)
        .toEqual('file.txt');

      expect(console.log.mock.calls[2][0])
        .toEqual(title);

      expect(console.log.mock.calls[2][1].message.startsWith('EACCES: permission denied'))
        .toEqual(true);
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

  describe('copyManifest', () => {
    beforeEach(() => {
      processTasks.dist = './dist/test-1.0.0-win-x86';

      processTasks.manifest = {
        name: 'test',
        main: 'index.html',
        version: '1.0.0'
      };

      processTasks.settings = {
        options: {
          verbose: true
        },
        tasks: [{
          strippedManifestProperties: [],
          manifestOverrides: []
        }]
      };
    });

    test('Fails to create dist folder', () => {
      mockfs({
        output: mockfs.directory({
          mode: parseInt('0400', 8)
        })
      });

      processTasks.dist = './output/dist';

      processTasks.copyManifest(processTasks.settings.tasks[0]);

      expect(fs.readdirSync('.'))
        .toEqual(['output']);

      expect(console.log)
        .toHaveBeenCalledWith(title, 'Unable to save modifed manifest on task.');

      expect(console.log)
        .toHaveBeenCalledWith(title, processTasks.settings.tasks[0]);

      expect(console.log.mock.calls[2][0])
        .toEqual(title);

      expect(console.log.mock.calls[2][1].message.startsWith('EACCES: permission denied, mkdir '))
        .toEqual(true);

      expect(fs.readdirSync('./output'))
        .toEqual([]);
    });

    test('Fail to write manifest file for task', () => {
      mockfs({
        'package.json': JSON.stringify(processTasks.manifest, null, 2),
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

      processTasks.copyManifest(processTasks.settings.tasks[0]);

      expect(console.log)
        .toHaveBeenCalledWith(title, 'Unable to save modifed manifest on task.');

      expect(console.log)
        .toHaveBeenCalledWith(title, processTasks.settings.tasks[0]);

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
      mockfs({
        'package.json': JSON.stringify(processTasks.manifest, null, 2)
      });

      processTasks.copyManifest(processTasks.settings.tasks[0]);

      expect(fs.readdirSync('.'))
        .toEqual(['dist', 'package.json']);

      expect(fs.readdirSync('./dist'))
        .toEqual(['test-1.0.0-win-x86']);

      expect(fs.readdirSync('./dist/test-1.0.0-win-x86'))
        .toEqual(['package.json']);

      const savedFile = fs.readFileSync('./dist/test-1.0.0-win-x86/package.json');

      expect(JSON.parse(savedFile))
        .toEqual({
          main: 'index.html',
          name: 'test',
          version: '1.0.0'
        });

      expect(console.log)
        .not.toHaveBeenCalled();
    });
  });

  describe('resetState', () => {
    test('Resets state', () => {
      processTasks.dist = 'asdf';

      expect(processTasks.settings)
        .toEqual(undefined);

      expect(processTasks.manifest)
        .toEqual(undefined);

      expect(processTasks.dist)
        .toEqual('asdf');

      const settings = {
        tasks: []
      };
      const manifest = {
        main: 'index.html',
        name: 'test',
        version: '1.0.0'
      };

      processTasks.resetState({
        settings: _cloneDeep(settings),
        manifest: _cloneDeep(manifest)
      });

      expect(processTasks.settings)
        .toEqual(settings);

      expect(processTasks.manifest)
        .toEqual(manifest);

      expect(processTasks.dist)
        .toEqual(undefined);
    });
  });

  describe('processTasks', () => {
    test('State not passed in', () => {
      const result = processTasks.processTasks();

      expect(console.log)
        .toHaveBeenCalledWith(title, 'Processing of tasks requires a settings object.');

      expect(result)
        .toEqual(false);
    });

    test('Settings not passed in', () => {
      const result = processTasks.processTasks({
        nwVersionMap: {
          lts: '0.1.0',
          latest: '2.0.0',
          stable: '1.0.0'
        },
        manifest: {
          name: 'test',
          version: '1.0.0'
        }
      });

      expect(console.log)
        .toHaveBeenCalledWith(title, 'Processing of tasks requires a settings object.');

      expect(result)
        .toEqual(false);
    });
  });
});
