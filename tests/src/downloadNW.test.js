const downloadNW = require('../../src/downloadNW.js');

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
        });

      const result = downloadNW.appData();

      expect(result.unzips)
        .toEqual('C:\\Users\\' + process.env.USERNAME + '\\AppData\\Local\\nw-utils\\nw-utils-builder\\nw-unzips');

      expect(result.zips)
        .toEqual('C:\\Users\\' + process.env.USERNAME + '\\AppData\\Local\\nw-utils\\nw-utils-builder\\nw-zips');
    });

    test('OSX appData', () => {
      global.process = Object.assign({}, realProcess, { platform: 'darwin' });

      const result = downloadNW.appData();

      expect(result.unzips.split('\\').join('/'))
        .toEqual('~/Library/Application Support/nw-utils/Default/nw-utils-builder/nw-unzips');

      expect(result.zips.split('\\').join('/'))
        .toEqual('~/Library/Application Support/nw-utils/Default/nw-utils-builder/nw-zips');
    });

    test('Linux appData', () => {
      global.process = Object.assign({}, realProcess, { platform: 'asdf' });

      const result = downloadNW.appData();

      expect(result.unzips.split('\\').join('/'))
        .toEqual('~/.config/nw-utils/nw-utils-builder/nw-unzips');

      expect(result.zips.split('\\').join('/'))
        .toEqual('~/.config/nw-utils/nw-utils-builder/nw-zips');
    });
  });
});
