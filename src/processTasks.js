const helpers = require('./helpers.js');

const fs = require('fs-extra');
const path = require('path');

const _cloneDeep = require('lodash/cloneDeep');
const _merge = require('lodash/merge');
const _omit = require('lodash/omit');
const glob = require('fast-glob');

const isJest = typeof(process.env.JEST_WORKER_ID) === 'string';

const processTasks = {
  nwVersionMap: undefined,
  settings: undefined,
  manifest: undefined,
  dist: undefined,

  /**
   * Console logs helper error messages if verbose mode is enabled.
   * @param  {any}      message   What should be logged
   * @param  {boolean}  error     If true, will throw
   */
  log: function (message, error) {
    const settings = this.settings || { options: { verbose: true } };
    helpers.log(message, settings, error);
  },

  cleanDist: function () {
    try {
      fs.removeSync(this.dist);
    } catch (err) {
      this.log('Error cleaning out task folder before build');
      this.log(this.dist);
      this.log(err);
    }
  },
  copyFiles: function (task) {
    // exclude the dist folder
    task.excludes.push(this.settings.options.output);

    const filesToCopy = glob.sync(task.files, {
      ignore: task.excludes,
      stats: isJest
    });

    filesToCopy.forEach((file) => {
      try {
        fs.copySync(file.path, path.join(this.dist, file.path));
      } catch (err) {
        this.log('Error copying file');
        this.log(file);
        this.log(err);
      }
    });
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
  copyManifest: function (task) {
    const manifestLocation = path.join(this.dist, 'package.json');

    let manifestData = this.tweakManifestForSpecificTask(task);
    manifestData = JSON.stringify(manifestData, null, 2);

    try {
      fs.ensureDirSync(this.dist);
      fs.writeFileSync(manifestLocation, manifestData);
    } catch (err) {
      this.log('Unable to save modifed manifest on task.');
      this.log(task);
      this.log(err);
    }
  },

  resetState: function (state) {
    this.dist = undefined;
    this.nwVersionMap = state.nwVersionMap;
    this.settings = state.settings;
    this.manifest = state.manifest;
  },
  /**
   * Loops over each task, cleaning the dist folder and performing a build
   *
   * @param  {object} state               Current state of the app
   * @param  {object} state.nwVersionMap
   * @param  {object} state.settings
   * @param  {object} state.manifest
   * @return {array}                      The array of modified tasks
   */
  processTasks: function (state) {
    if (!state || !state.settings) {
      this.log('Processing of tasks requires a settings object.');
      return false;
    }
    this.resetState(state);

    // this.log(this.settings.options);
    this.settings.tasks.forEach((task) => {
      this.dist = path.join(this.settings.options.output, task.name);
      this.cleanDist();
      this.copyFiles(task);
      this.copyManifest(task);
      // this.log(task);
    });

    return this.settings.tasks;
  }
};

module.exports = processTasks;
