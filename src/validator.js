const helpers = require('./helpers.js');

// "Reaping all the sins into the Heart of the Validator" - Burgalveist
const validator = {
  log: function (message, error) {
    helpers.log(message, this.settings, error);
  },
  // The default settings file that is updated based on what the user passes in
  settings: {
    global: {
      verbose: true,
      concurrent: true,
      mirror: 'https://dl.nwjs.io/',
      nwVersion: 'match',
      nwFlavor: 'normal',
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
   * Validates the section is an array that only contains strings
   * @param  {object} settings  Settings object passed in by the user
   * @param  {string} section   'junk', 'files', 'excludes', 'strippedManifestProperties'
   */
  validateGlobalArrayOfStrings: function (settings, section) {
    if (
      settings.global &&
      settings.global[section] &&
      Array.isArray(settings.global[section]) &&
      settings.global[section].length
    ) {
      const allItemsAreStrings = settings.global[section].every(function (item) {
        return typeof(item) === 'string';
      });

      if (allItemsAreStrings) {
        const deduped = Array.from(new Set(settings.global[section]));
        return deduped;
      } else {
        this.log('The global ' + section + ' setting must be an array of strings, an empty array, or undefined');
      }
    }
    return this.settings.global[section];
  },
  validateGlobalBoolean: function (settings, name) {
    if (settings.global && typeof(settings.global[name]) === 'boolean') {
      return settings.global[name];
    }
    this.log('The global ' + name + ' setting must be a type of boolean.');
    return this.settings.global[name];
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
    this.settings.global.concurrent = this.validateGlobalBoolean(settings, 'concurrent');
    this.settings.global.junk = this.validateGlobalArrayOfStrings(settings, 'junk');
    this.settings.global.excludes = this.validateGlobalArrayOfStrings(settings, 'excludes');
    this.settings.global.strippedManifestProperties = this.validateGlobalArrayOfStrings(settings, 'strippedManifestProperties');
    this.settings.global.files = this.validateGlobalArrayOfStrings(settings, 'files');
  },
  /**
   * Loops over all settings objects passed in to combine them in this.settings
   * @param  {object} arguments The JS arguments object of all arguments passed in
   */
  buildSettingsObject: function (settings) {
    this.validateGlobalSettings(settings);
    return this.settings;
  }
};

module.exports = validator;
