const validator = require('./validator.js');
const helpers = require('./helpers.js');

const fs = require('fs-extra');
const path = require('path');
const fetch = require('node-fetch');

const NO_SETTINGS = 'No settings passed in.';

const nwUtilsBuilder = {
  log: function (message, error) {
    const settings = this.settings || { options: { verbose: true } };
    helpers.log(message, settings, error);
  },
  nwVersionMap: {
    latest: 'v0.43.0-beta1',
    stable: 'v0.42.6',
    lts: 'v0.14.7'
  },
  allNwVersions: undefined,
  settings: undefined,
  manifest: undefined,
  buildSettingsObject: function (settings) {
    this.settings = validator.buildSettingsObject(settings);
  },
  /**
   * Reads the contents of the user's package.json, parses
   * it as JSON and sets it in this.manifest.
   */
  readManifest: function () {
    const packagePath = path.join(process.cwd(), 'package.json');
    const manifestPath = path.join(process.cwd(), 'manifest.json');

    if (fs.existsSync(packagePath)) {
      // doing require('file.json') will cache the result, to prevent this we read/parse
      this.manifest = JSON.parse(fs.readFileSync(packagePath));
    } else if (fs.existsSync(manifestPath)) {
      this.manifest = JSON.parse(fs.readFileSync(manifestPath));
    }
  },
  getNwVersionDetails: async function () {
    const cachebust = (new Date()).getTime();
    const url = 'https://nwjs.io/versions.json?' + cachebust;
    let json;

    try {
      const response = await fetch(url);
      json = await response.json();
    } catch (error) {
      this.log('Error getting details about latest NW.js versions. Using hard-coded versions.');
      this.log(this.nwVersionMap);
    }

    this.nwVersionMap.latest = json.latest;
    this.nwVersionMap.stable = json.stable;
    this.nwVersionMap.lts = json.lts;
    this.allNwVersions = json.versions;
  },
  applyNwVersionMapToTasks: function () {
    this.settings.tasks.forEach((task) => {
      if (['latest', 'lts', 'stable'].includes(task.nwVersion)) {
        task.nwVersion = this.nwVersionMap[task.nwVersion];
      }
      if (task.nwVersion === 'match') {
        if (
          this.manifest &&
          this.manifest.devDependencies &&
          this.manifest.devDependencies.nw
        ) {
          if (['latest', 'sdk'].includes(this.manifest.devDependencies.nw)) {
            task.nwVersion = this.nwVersionMap.latest;
          } else {
            task.nwVersion = this.manifest.devDependencies.nw;
          }
        } else {
          this.log('A task with an "nwVersion" of "match" was set, but no "nw" devDependency was found in your package.json or manifest.json. Falling back to the latest stable version.');
          this.log(task);
          task.nwVersion = this.nwVersionMap.stable;
        }
      }
    });
  },

  /**
   * Resets the state of the script so left over settings from previous runs
   * that occur in the same instance do not carry over.
   */
  resetState: function () {
    this.settings = undefined;
    this.manifest = undefined;
  },
  /**
   * Resets state, checks for missing settings or manifest,
   *
   * @return {boolean}  True if safe to continue build, false if settings or manifest are missing
   */
  preBuild: function (settings) {
    this.resetState();
    if (!settings) {
      this.log(NO_SETTINGS);
      return false;
    }

    this.readManifest();
    if (!this.manifest) {
      this.log('No package.json or manifest.json file found, cannot build.');
      return false;
    }
    return true;
  },
  /**
   * Performs all build tasks based on passed in settings
   *
   * @param  {object} settings  User settings and tasks
   */
  build: async function (settings) {
    const preBuildSuccess = this.preBuild(settings);
    if (!preBuildSuccess) {
      return;
    }
    this.buildSettingsObject(settings);

    await this.getNwVersionDetails();
    this.applyNwVersionMapToTasks();
  },
  /**
   * Exposes generated internal settings object created from
   * the object passed in by the user.
   *
   * @param  {object} settings  Settings passed in by the user
   * @return {object}           The built settings
   */
  dryRun: function (settings) {
    const preBuildSuccess = this.preBuild(settings);
    if (!preBuildSuccess) {
      return;
    }
    return validator.buildSettingsObject(settings);
  }
};

module.exports = nwUtilsBuilder;
