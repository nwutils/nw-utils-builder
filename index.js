const helpers = require('./helpers.js');

const nwUtilsBuilder = {
  log: function (message, error) {
    helpers.log(message, this.settings, error);
  },

  // ////////////////////////// //
  //          SETTINGS          //
  // ////////////////////////// //

  // The default settings file that is updated based on what the user passes in
  settings: {
    global: {
      verbose: true,
      concurrent: true,
      mirror: 'https://dl.nwjs.io/',
      nwVersion: 'match',
      nwFlavor: 'normal', // or 'sdk'
      platform: 'win',
      arch: 'x86',
      files: ['**/*'],
      excludes: [],
      outputType: 'zip',
      outputPattern: '{{name}}-{{version}}-{{platform}}-{{arch}}',
      strippedManifestProperties: [],
      junk: [],
      icon: undefined,
      unIcon: undefined
    },
    tasks: []
  },
  /**
   * Validates the Junk setting
   * @param  {object} settings  Settings object passed in by the user
   */
  validateJunk: function (settings) {
    if (
      settings.global &&
      settings.global.junk &&
      Array.isArray(settings.global.junk) &&
      settings.global.junk.length
    ) {
      const allItemsAreStrings = settings.global.junk.every(function (item) {
        return typeof(item) === 'string';
      });

      if (allItemsAreStrings) {
        const deduped = Array.from(new Set(settings.global.junk));
        return deduped;
      } else {
        this.log('Junk must be an array of strings, an empty array, or undefined');
      }
    }
    return [];
  },
  validateGlobalBoolean: function (settings, name) {
    if (settings.global && typeof(settings.global[name]) === 'boolean') {
      return settings.global[name];
    } else {
      this.log('The global ' + name + ' setting must be a type of boolean.');
    }
  },
  /**
   * Validates and applies settings passed in by the the user to this.settings.
   * @param  {object} settings  A setting object passed in by the user
   */
  validateGlobalSettings: function (settings) {
    if (!settings) {
      return;
    }
    this.settings.global.verbose = this.validateGlobalBoolean(settings, 'verbose');
    this.settings.global.junk = this.validateJunk(settings);
  },
  /**
   * Loops over all settings objects passed in to combine them in this.settings
   * @param  {object} arguments The JS arguments object of all arguments passed in
   */
  buildSettingsObject: function (settings) {
    this.validateGlobalSettings(settings);
  },

  // ////////////////////////// //
  //         PUBLIC API         //
  // ////////////////////////// //

  build: function (settings) {
    if (!settings) {
      console.log('No settings passed in to nw-utils-builder');
      return;
    }
    this.buildSettingsObject(settings);
  }
};

module.exports = nwUtilsBuilder;
