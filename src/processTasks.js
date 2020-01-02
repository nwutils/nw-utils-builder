const helpers = require('./helpers.js');

const fs = require('fs-extra');
const path = require('path');

const _cloneDeep = require('lodash/cloneDeep');
const _merge = require('lodash/merge');
const _omit = require('lodash/omit');
const glob = require('fast-glob');

const processTasks = {
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

  /**
   * Recursively deletes the dist folder of the current task.
   */
  cleanDist: function () {
    try {
      fs.removeSync(this.dist);
    } catch (err) {
      this.log('Error cleaning out task folder before build.');
      this.log(this.dist);
      this.log(err);
    }
  },
  /**
   * Finds all files to copy based on task settings, then copies each file to the dist folder
   * for this task.
   *
   * @param  {object} task  The settings for this specific task
   */
  copyFiles: function (task) {
    // exclude the dist folder
    task.excludes.push(this.settings.options.output);

    /**
     * Mock-fs in our unit tests, and versions of Node below 10.10, require stats to be true.
     * This will return an array of detailed objects about each file. stats: false is roughly
     * twice as fast and returns only an array of strings of the paths. This would be preferred
     * in the future for the performance increase, but for now, we have to live with this for
     * compatibility.
     */
    const weAreUsingMockFsOrNodeUnder10dot10 = true;
    const filesToCopy = glob.sync(task.files, {
      ignore: task.excludes,
      stats: weAreUsingMockFsOrNodeUnder10dot10
    });

    filesToCopy.forEach((file) => {
      try {
        fs.copySync(file.path, path.join(this.dist, file.path));
      } catch (err) {
        this.log('Error copying file.');
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
  /**
   * Saves the modified manifest file to the dist folder for this task.
   *
   * @param  {object} task  The settings for this specific task
   */
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

  /**
   * Resets the state of the script so left over settings from previous runs
   * that occur in the same instance do not carry over.
   *
   * @param  {object} state               Current state of the app
   * @param  {object} state.settings
   * @param  {object} state.manifest
   */
  resetState: function (state) {
    this.dist = undefined;
    this.settings = state.settings;
    this.manifest = state.manifest;
  },
  /**
   * Loops over each task, cleaning that task's dist folder and performing a build for that task.
   *
   * @param  {object} state               Current state of the app
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

    this.settings.tasks.forEach((task) => {
      this.dist = path.join(this.settings.options.output, task.name);
      this.cleanDist();
      this.copyFiles(task);
      this.copyManifest(task);
    });

    return this.settings.tasks;
  }
};

module.exports = processTasks;
