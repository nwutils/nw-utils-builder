const path = require('path');

const downloadNW = {
  /**
   * Checks the OS and returns an object with the folder path to where to
   * store downloaded NW.js zip archives, and where to unzip their
   * contents to.
   *
   * @return {object}     { unzips, zips} the paths to these locations
   */
  appData: function () {
    let name = 'nw-utils';
    let appData;

    if (process.platform === 'win32') {
      appData = path.join(process.env.LOCALAPPDATA, name);
    } else if (process.platform === 'darwin') {
      appData = path.join('~', 'Library', 'Application Support', name, 'Default');
    } else {
      appData = path.join('~', '.config', name);
    }

    appData = path.join(appData, 'nw-utils-builder');

    return {
      unzips: path.join(appData, 'nw-unzips'),
      zips: path.join(appData, 'nw-zips')
    };
  }
};

module.exports = downloadNW;
