const semver = require('semver');

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
  validateArrayOfStrings: function (setting, name) {
    const message = 'The ' + name + ' setting must be an array of strings, an empty array, or undefined.';
    if (
      Object.prototype.hasOwnProperty.call(setting, name) &&
      !Array.isArray(setting[name])
    ) {
      this.log(message);
      return null;
    }

    if (
      Object.prototype.hasOwnProperty.call(setting, name) &&
      Array.isArray(setting[name]) &&
      !setting[name].length
    ) {
      return [];
    }

    if (
      Object.prototype.hasOwnProperty.call(setting, name) &&
      Array.isArray(setting[name]) &&
      setting[name].length
    ) {
      const allItemsAreStrings = setting[name].every(function (item) {
        return typeof(item) === 'string';
      });

      if (allItemsAreStrings) {
        const deduped = Array.from(new Set(setting[name]));
        return deduped;
      }
      this.log(message);
    }
    return null;
  },
  validateBoolean: function (setting, name) {
    if (Object.prototype.hasOwnProperty.call(setting, name)) {
      if (typeof(setting[name]) === 'boolean') {
        return setting[name];
      }
      this.log('The ' + name + ' setting must be a type of boolean.');
    }
    return null;
  },
  validateString: function (setting, name) {
    if (Object.prototype.hasOwnProperty.call(setting, name)) {
      if (typeof(setting[name]) === 'string') {
        return setting[name];
      }
      this.log('The ' + name + ' setting must be a string.');
    }
    return null;
  },
  validateNwVersion: function (settings) {
    let version = this.validateString(settings, 'nwVersion');

    if (version) {
      version = version.toLowerCase();
      if (
        version === 'match' ||
        version === 'latest'
      ) {
        return version;
      }

      // '0.0.0' => '0.0.0'
      // 'v0.0.0' => '0.0.0'
      // 'asdf' => null
      let validVersion = semver.valid(version);
      if (validVersion) {
        return 'v' + validVersion;
      }

      this.log('The nwVersion setting must be a string of a valid version number ("v0.42.5"), "latest", or "match".');
    }

    return null;
  },
  applyGlobalSetting: function (settings, name, method) {
    // value = this.validateBoolean(settings.global, 'verbose');
    let value = this[method](settings.global, name);
    if (value !== null) {
      this.settings.global[name] = value;
    }
  },
  /**
   * Validates and applies settings passed in by the the user to this.settings.
   * @param  {object} settings  A setting object passed in by the user
   */
  validateGlobalSettings: function (settings) {
    if (
      !settings ||
      !settings.global ||
      typeof(settings.global) !== 'object' ||
      Array.isArray(settings.global)
    ) {
      return;
    }

    const validationMap = {
      verbose: 'Boolean',
      concurrent: 'Boolean',
      mirror: 'String',
      nwVersion: 'NwVersion',
      // nwFlavor
      // platform
      // arch
      files: 'ArrayOfStrings',
      excludes: 'ArrayOfStrings',
      // outputType
      // outputPattern
      strippedManifestProperties: 'ArrayOfStrings',
      junk: 'ArrayOfStrings'
      // icon
      // unIcon

    };

    for (let key of validationMap) {
      // this.applyGlobalSetting(settings, 'verbose', 'validateBoolean');
      this.applyGlobalSetting(settings, key, 'validate' + validationMap[key]);
    }
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
