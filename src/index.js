const validator = require('./validator.js');
const helpers = require('./helpers.js');

const fs = require('fs-extra');
const path = require('path');

const _cloneDeep = require('lodash/clonedeep');
const _merge = require('lodash/merge');
const _omit = require('lodash/omit');
const fetch = require('node-fetch');
const semver = require('semver');

const NO_SETTINGS = 'No settings passed in.';

const nwUtilsBuilder = {
  nwVersionMap: undefined,
  allNwVersions: undefined,
  settings: undefined,
  manifest: undefined,

  /**
   * Console logs helper error messages if verbose mode is enabled.
   * @param  {any}      message   What should be logged
   * @param  {boolean}  error     If true, will throw
   */
  log: function (message, error) {
    const settings = this.settings || { options: { verbose: true } };
    helpers.log(message, settings, error);
  },

  /**
   * Passes settings into the validator.js file for validation and defaults.
   * If settings are valid, we store the modified version on this parent object.
   *
   * @param  {object} settings  The settings object passed in by the user.
   */
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
  /**
   * Takes the user's manifest file and modifies it based on the settings of this particular task.
   * @param  {object} task  The settings for this specific task
   * @return {object}       A modified version of the manifest, to be saved in the output dir
   */
  tweakManifestForSpecificTask: function (task) {
    let manifest = _cloneDeep(this.manifest);
    // Does a deep delete of properties based on strings like 'a.b.c'
    manifest = _omit(manifest, task.strippedManifestProperties);
    // Performs a deep merge, beyond what the horrendously badly named "spread" operator offers
    manifest = _merge(manifest, task.manifestOverrides);
    return manifest;
  },

  /**
   * Makes a network request for the latest NW.js versions.
   * Stores the data in this nwUtilsBuilder object to be referenced.
   */
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

    if (json) {
      this.nwVersionMap.latest = json.latest;
      this.nwVersionMap.stable = json.stable;
      this.nwVersionMap.lts = json.lts;
      this.allNwVersions = json.versions;
    }
  },
  /**
   * Loops over all tasks setting the correct nwVersion, based on
   * the versions returned from a previous network request, or derived
   * from user's manifest.
   */
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
            let matchedVersion = semver.coerce(this.manifest.devDependencies.nw);
            if (matchedVersion) {
              task.nwVersion = 'v' + matchedVersion.version;
            } else {
              this.log('A task with an "nwVersion" of "match" was set, but the version for you "nw" devDependency was not valid. Falling back to the latest stable version.');
              this.log(task);
              task.nwVersion = this.nwVersionMap.stable;
            }
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
   * Loops over all tasks and sets the correct nwFlavor, deriving
   * from defaults or user's manifest if set to match.
   */
  applyNwFlavorMapToTasks: function () {
    this.settings.tasks.forEach((task) => {
      if (task.nwFlavor === 'sdk') {
        return;
      }
      if (task.nwFlavor === 'match') {
        if (
          this.manifest &&
          this.manifest.devDependencies &&
          this.manifest.devDependencies.nw
        ) {
          if (this.manifest.devDependencies.nw.includes('sdk')) {
            task.nwFlavor = 'sdk';
            return;
          }
        } else {
          this.log('A task with an "nwFlavor" of "match" was set, but no "nw" devDependency was found in your package.json or manifest.json. Falling back to "normal".');
          this.log(task);
        }
      }
      task.nwFlavor = 'normal';
    });
  },
  /**
   * Loops over all tasks and generates a task name based on its outputPattern.
   */
  applyTaskNames: function () {
    this.settings.tasks.forEach((task) => {
      let name = task.outputPattern;
      name = name.replace('{{name}}', this.manifest && this.manifest.name);
      name = name.replace('{{version}}', this.manifest && this.manifest.version);

      const keywords = [
        'nwVersion',
        'nwFlavor',
        'platform',
        'arch',
        'outputType'
      ];
      keywords.forEach(function (keyword) {
        name = name.replace('{{' + keyword + '}}', task[keyword] || keyword);
      });

      task.name = name;
    });
  },


  /**
   * Resets the state of the script so left over settings from previous runs
   * that occur in the same instance do not carry over.
   */
  resetState: function () {
    this.settings = undefined;
    this.manifest = undefined;
    this.nwVersionMap = {
      latest: 'v0.43.0-beta1',
      stable: 'v0.42.6',
      lts: 'v0.14.7'
    };
  },
  applyManifestToTasks: function () {
    this.applyNwVersionMapToTasks();
    this.applyNwFlavorMapToTasks();
    this.applyTaskNames();
  },
  processTasks: function () {
    // this.log(this.settings.options);
    this.settings.tasks.forEach((task) => {
      const dist = path.join(this.settings.options.output, task.name);
      const manifestLocation = path.join(dist, 'package.json');

      let manifestData = this.tweakManifestForSpecificTask(task);
      manifestData = JSON.stringify(manifestData, null, 2);

      try {
        fs.ensureDirSync(dist);
        fs.writeFileSync(manifestLocation, manifestData);
      } catch (err) {
        this.log('Unable to save modifed manifest on task.');
        this.log(task);
        this.log(err);
      }

      // this.log(task);
    });
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

    this.applyManifestToTasks();
    this.processTasks();
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
