const testHelpers = require('../testHelpers.js');
const downloadNW = require('../../src/downloadNW.js');
const slasher = testHelpers.slasher;

describe('downloadNW', () => {
  describe('appData', () => {
    const realProcess = process;

    afterEach(() => {
      global.process = realProcess;
    });

    test('Windows appData', () => {
      global.process = Object.assign(
        {},
        realProcess,
        {
          platform: 'win32',
          env: {
            LOCALAPPDATA: 'C:\\Users\\test\\AppData\\Local',
            USERNAME: 'test'
          }
        }
      );

      const result = downloadNW.appDataFolders();

      expect(slasher(result.unzips))
        .toEqual('C:/Users/' + process.env.USERNAME + '/AppData/Local/nw-utils/nw-utils-builder/nw-unzips');

      expect(slasher(result.zips))
        .toEqual('C:/Users/' + process.env.USERNAME + '/AppData/Local/nw-utils/nw-utils-builder/nw-zips');
    });

    test('OSX appData', () => {
      global.process = Object.assign({}, realProcess, { platform: 'darwin' });

      const result = downloadNW.appDataFolders();

      expect(slasher(result.unzips))
        .toEqual('~/Library/Application Support/nw-utils/Default/nw-utils-builder/nw-unzips');

      expect(slasher(result.zips))
        .toEqual('~/Library/Application Support/nw-utils/Default/nw-utils-builder/nw-zips');
    });

    test('Linux appData', () => {
      global.process = Object.assign({}, realProcess, { platform: 'asdf' });

      const result = downloadNW.appDataFolders();

      expect(slasher(result.unzips))
        .toEqual('~/.config/nw-utils/nw-utils-builder/nw-unzips');

      expect(slasher(result.zips))
        .toEqual('~/.config/nw-utils/nw-utils-builder/nw-zips');
    });
  });
});
