const fs = require('fs-extra');
const path = require('path');
const fetch = require('node-fetch');
const sha256File = require('sha256-file');

const helpers = require('./helpers.js');

const DEMO_SETTINGS = {
  options: {
    verbose: true,
    concurrent: true,
    mirror: 'https://dl.nwjs.io/',
    output: './dist'
  },
  taskDefaults: {
    nwVersion: 'latest',
    nwFlavor: 'normal',
    platform: 'win',
    arch: 'x86',
    files: [ '**/*' ],
    excludes: [ 'package-lock.json', 'assets/*', 'dev-utils/*' ],
    outputType: 'zip',
    outputPattern: '{{name}}-{{version}}-{{platform}}-{{arch}}',
    manifestOverrides: {},
    strippedManifestProperties: [ 'scripts', 'devDependencies' ],
    junk: [ 'README.md' ],
    icon: undefined,
    unIcon: undefined
  }
};
const DEMO_TASK = {
  platform: 'win',
  arch: 'x86',
  icon: 'assets/icon.ico',
  unIcon: 'assets/unicon.ico',
  outputType: 'nsis7z',
  nwVersion: 'v0.45.0-beta1',
  nwFlavor: 'normal',
  files: [Array],
  excludes: [Array],
  outputPattern: '{{name}}-{{version}}-{{platform}}-{{arch}}',
  manifestOverrides: {},
  strippedManifestProperties: [Array],
  junk: [Array],
  name: 'nw-utils-builder-0.0.1-win-x86'
};

const downloadNW = {
  log: function (message) {
    helpers.log(message, this.settings);
  },

  settings: null,
  shaJsonFileLocation: null,
  shaJsonFileName: null,
  shaJsonMap: null,
  shaURL: null,
  unzipsFolder: null,
  zipFileName: null,
  zipsFolder: null,
  zipURL: null,

  initializeData: function (task, settings) {
    let appDataFolders = this.appDataFolders();
    let mirror = settings.options.mirror;
    let version = task.nwVersion;

    this.settings = settings;

    this.zipsFolder = appDataFolders.zips;
    this.unzipsFolder = appDataFolders.unzips;

    this.shaJsonFileName = version + '_SHA.json';
    this.shaJsonFileLocation = path.join(this.zipsFolder, this.shaJsonFileName);
    this.shaURL = mirror + version + '/' + 'SHASUMS256.txt';

    this.zipFileName = this.buildZipFileName(task);
    this.zipFileLocation = path.join(this.zipsFolder, this.zipFileName);
    this.zipURL = mirror + version + '/' + this.zipFileName;
  },
  resetData: function () {
    this.settings = null;
    this.shaJsonFileLocation = null;
    this.shaJsonFileName = null;
    this.shaJsonMap = null;
    this.shaURL = null;
    this.unzipsFolder = null;
    this.zipFileName = null;
    this.zipsFolder = null;
    this.zipURL = null;
  },

  /**
   * Checks the OS and returns an object with the folder path to where to
   * store downloaded NW.js zip archives, and where to unzip their
   * contents to.
   *
   * @return {object}     { unzips, zips} the paths to these locations
   */
  appDataFolders: function () {
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
  },
  /**
   * Creates the filename based on task to be downloaded.
   *
   * @param  {object}  task  The settings for this specific task
   * @return {string}        'nwjs-sdk-v0.45.0-beta1-win-x64.zip'
   */
  buildZipFileName: function (task) {
    let sdk = '';
    let version = task.nwVersion + '-';
    let os = task.platform + '-';
    let arch = task.arch;
    let extension = '.zip';

    if (task.nwFlavor === 'sdk') {
      sdk = 'sdk-';
    }
    if (task.platform === 'lin') {
      os = 'linux-';
      extension = '.tar.gz';
    }
    if (task.arch === 'x86') {
      arch = 'ia32';
    }

    return [
      'nwjs-',
      sdk,
      version,
      os,
      arch,
      extension
    ].join('');
  },

  convertSHAtoJSON: function (data) {
    let fileHashMap = {};
    data = String(data).trim();
    data = data.split('\r\n').join('\n');

    let lines = data.split('\n');
    lines.forEach(function (line) {
      let splitLine = line.split('  ');
      let hash = splitLine[0];
      let file = splitLine[1];
      if (file && hash) {
        fileHashMap[file] = hash;
      }
    });

    console.log('convertSHAtoJSON');
    this.shaJsonMap = fileHashMap;
    fs.writeFileSync(this.shaJsonFileLocation, JSON.stringify(fileHashMap, null, 2));
  },
  getAndSaveSHA: function () {
    return fetch(this.shaURL)
      .then((response) => {
        console.log('0 getAndSaveSHA status check');
        return helpers.checkStatus(response, this.settings);
      })
      .then((response) => {
        console.log('1 getAndSaveSHA response.text()');
        return response.text();
      })
      .then((response) => {
        console.log('2 getAndSaveSHA convertSHAtoJSON(response)');
        return this.convertSHAtoJSON(response);
      })
      .catch((err) => {
        console.log('3 getAndSaveSHA err');
        this.log(err);
      });
  },
  getAndSaveZip: function () {
    return fetch(this.zipURL)
      .then((response) => {
        return helpers.checkStatus(response, this.settings);
      })
      .then((response) => {
        const destination = fs.createWriteStream(this.zipFileLocation);
        response.body.pipe(destination);
        console.log('0 saving zip');
      })
      .catch((err) => {
        console.log('1 err downloading zip');
        console.log(err);
      });
  },
  loadSHA: async function () {
    let data;

    if (fs.existsSync(this.shaJsonFileLocation)) {
      data = fs.readFileSync(this.shaJsonFileLocation);
      try {
        data = JSON.parse(data);
      } catch (err) {
        this.log('Error parsing local SHASUMS256 JSON file. A new copy will be downloaded.');
      }
    }
    if (typeof(data) === 'object' && Object.keys(data).length > 2) {
      this.shaJsonMap = data;
    } else {
      let promise = await this.getAndSaveSHA();
      return promise;
    }
  },
  doesZipExist: async function () {
    if (fs.existsSync(this.zipFileLocation)) {

      let actualSHA = sha256File(this.zipFileLocation);
      let expectedSHA = this.shaJsonMap[this.zipFileName];

      if (actualSHA !== expectedSHA) {
        fs.unlinkSync(this.shaJsonFileLocation);
        fs.unlinkSync(this.zipFileLocation);
        await this.loadSHA();
        await this.doesZipExist();
        console.log('DID NOT MATCH');
      // remove else
      } else {
        console.log('MATCH');
      }
    } else {
      console.log('NO - download, re-run to validate SHA');
      await this.getAndSaveZip();
      await this.doesZipExist();
    }
  },
  /**
   * Downloads the correct NW.js file to cache
   *
   * @param  {object}  task      The settings for this specific task
   * @param  {object}  settings  Settings object
   */
  downloadNW: async function (task, settings) {
    this.resetData();
    this.initializeData(task, settings);
    fs.ensureDirSync(this.unzipsFolder);
    fs.ensureDirSync(this.zipsFolder);

    await this.loadSHA();
    await this.doesZipExist();

    // It is technically possible for doesZipExist to run recursively forever, downloading zip/sha repeatedly if they never match.
    // Put in a limit for number of attempts.

    // does extracted exist in unzips?
    //   - YES - check the SHA of all files recursively
    //     - ALL PASS - CONTINUE
    //     - ANY FAIL - Delete the unzipped output and re-run
    //   - NO - unzip the download to the folder, re-run

    // Copy files to dist

    console.log(100, 'downloadNW end');
  },

  TRY_IT: async function () {
    await this.downloadNW(DEMO_TASK, DEMO_SETTINGS);
    console.log(50, 'TRY_IT end');
  },
  DEBUG: function () {
    this.resetData();
    this.initializeData(DEMO_TASK, DEMO_SETTINGS);
    this.convertSHAtoJSON();
  }
};

module.exports = downloadNW;
