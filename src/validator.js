const _cloneDeep = require('lodash/cloneDeep');
const semver = require('semver');

const helpers = require('./helpers.js');

const defaultSettings = {
  options: {
    verbose: true,
    concurrent: true,
    mirror: 'https://dl.nwjs.io/',
    output: './dist'
  },
  taskDefaults: {
    nwVersion: 'match',
    nwFlavor: 'normal',
    platform: 'win',
    arch: 'x86',
    files: ['**/*'],
    excludes: ['node_modules'],
    outputType: 'zip',
    outputPattern: '{{name}}-{{version}}-{{platform}}-{{arch}}',
    manifestOverrides: {},
    strippedManifestProperties: [],
    junk: [],
    icon: undefined,
    unIcon: undefined
  },
  tasks: []
};

// "Reaping all the sins into the Heart of the Validator" - Burgalveist
const validator = {
  log: function (message, error) {
    helpers.log(message, this.settings, error);
  },
  // The default settings file that is updated based on what the user passes in
  settings: _cloneDeep(defaultSettings),
  validationMap: {
    verbose: 'Boolean',
    concurrent: 'Boolean',
    mirror: 'String',
    output: 'String',
    nwVersion: 'NwVersion',
    nwFlavor: 'NwFlavor',
    platform: 'Platform',
    arch: 'Arch',
    files: 'ArrayOfStrings',
    excludes: 'ArrayOfStrings',
    outputType: 'OutputType',
    outputPattern: 'String',
    manifestOverrides: 'Object',
    strippedManifestProperties: 'ArrayOfStrings',
    junk: 'ArrayOfStrings',
    icon: 'String',
    unIcon: 'String'
  },
  validTaskSettings: Object.keys(defaultSettings.taskDefaults),
  /**
   * Validates the section is an array that only contains strings
   *
   * @param  {object} setting   Settings object passed in by the user
   * @param  {string} name      'junk', 'files', 'excludes', 'strippedManifestProperties'
   * @return {Array}            Returns the value from the user's setting, or null if check fails
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
  /**
   * Validates a setting is an object.
   *
   * @param  {object} setting  Settings object passed in by the user
   * @param  {string} name     Name of the setting (manifestOverrides)
   * @return {object}          The value or null if check fails
   */
  validateObject: function (setting, name) {
    if (Object.prototype.hasOwnProperty.call(setting, name)) {
      if (typeof(setting[name]) === 'object' && !Array.isArray(setting[name])) {
        return setting[name];
      }
      this.log('The ' + name + ' setting must be an object.');
    }
    return null;
  },
  /**
   * Validates a setting is a boolean
   *
   * @param  {object}  setting  Settings object passed in by the user
   * @param  {string}  name     Name of the setting ('verbose', 'concurrent')
   * @return {boolean}          Returns the value or null if check fails
   */
  validateBoolean: function (setting, name) {
    if (Object.prototype.hasOwnProperty.call(setting, name)) {
      if (typeof(setting[name]) === 'boolean') {
        return setting[name];
      }
      this.log('The ' + name + ' setting must be a type of boolean.');
    }
    return null;
  },
  /**
   * Validates a setting is a string
   *
   * @param  {object} setting  Settings object passed in by the user
   * @param  {string} name     Name of the setting ('mirror', 'outputPattern', 'icon', etc.)
   * @return {string}          Returns the value or null if check fails
   */
  validateString: function (setting, name) {
    if (Object.prototype.hasOwnProperty.call(setting, name)) {
      if (typeof(setting[name]) === 'string') {
        return setting[name];
      }
      this.log('The ' + name + ' setting must be a string.');
    }
    return null;
  },
  /**
   * Validates the nwVersion setting meets requirements.
   *
   * @param  {object} settings  Settings object passed in by user
   * @return {string}           Returns the value or null if check fails
   */
  validateNwVersion: function (settings) {
    let version = this.validateString(settings, 'nwVersion');
    const allowedKeywords = [
      'latest',
      'lts',
      'match',
      'stable'
    ];

    if (version) {
      version = version.toLowerCase();
      if (allowedKeywords.includes(version)) {
        return version;
      }

      // '0.0.0' => '0.0.0'
      // 'v0.0.0' => '0.0.0'
      // 'asdf' => null
      let validVersion = semver.coerce(version);
      if (validVersion) {
        return 'v' + validVersion.version;
      }

      this.log('The nwVersion setting must be a string of a valid version number like "0.42.6", or a valid keyword like "stable", "latest", "lts", or "match".');
    }

    return null;
  },
  /**
   * Validates the nwFlavor setting matches allowed values (match, sdk, normal).
   *
   * @param  {object} settings  Settings object passed in by user
   * @return {string}           The value or null if check failed.
   */
  validateNwFlavor: function (settings) {
    let flavor = this.validateString(settings, 'nwFlavor');
    let validFlavors = [
      'match',
      'sdk',
      'normal'
    ];

    if (flavor) {
      flavor = flavor.toLowerCase();
      if (validFlavors.includes(flavor)) {
        return flavor;
      }

      this.log('The nwFlavor setting must be a string of "normal", "sdk", or "match".');
    }

    return null;
  },
  /**
   * Validates the platform setting matches allowed values (win, lin, osx)
   *
   * @param  {object} settings  Settings object passed in by user
   * @return {string}           The value or null if check failed
   */
  validatePlatform: function (settings) {
    let platform = this.validateString(settings, 'platform');
    let validPlatforms = [
      'win',
      'lin',
      'osx'
    ];

    if (platform) {
      platform = platform.toLowerCase();
      if (validPlatforms.includes(platform)) {
        return platform;
      }

      this.log('The platform setting must be a string of "win", "lin", or "osx".');
    }

    return null;
  },
  /**
   * Validates the platform setting matches allowed values (x64, x86)
   *
   * @param  {object} settings  Settings object passed in by user
   * @return {string}           The value or null if check failed
   */
  validateArch: function (settings) {
    let arch = this.validateString(settings, 'arch');
    let validArchitectures = [
      'x64',
      'x86'
    ];

    if (arch) {
      arch = arch.toLowerCase();
      if (validArchitectures.includes(arch)) {
        return arch;
      }

      this.log('The arch setting must be a string of "x86" or "x64".');
    }

    return null;
  },
  /**
   * Validates the platform setting matches allowed values (zip, 7z, nsis, nsis7z)
   *
   * @param  {object} settings  Settings object passed in by user
   * @return {string}           The value or null if check failed
   */
  validateOutputType: function (settings) {
    let outputType = this.validateString(settings, 'outputType');
    let validOutputTypes = [
      'zip',
      '7z',
      'nsis',
      'nsis7z'
    ];

    if (outputType) {
      outputType = outputType.toLowerCase();
      if (validOutputTypes.includes(outputType)) {
        return outputType;
      }

      this.log('The outputType setting must be a string of "zip", "7z", "nsis", or "nsis7z".');
    }

    return null;
  },
  /**
   * Validates and applies settings passed in by the the user to this.settings.
   *
   * @param  {object} settings          A setting object passed in by the user
   * @param  {string} optionsOrDefault  'options' or 'taskDefaults'
   */
  validateOptionsAndTaskDefaults: function (settings, optionsOrDefault) {
    if (!optionsOrDefault) {
      this.log('validateOptionsAndTaskDefaults requires a string of "options" or "taskDefaults".');
      return;
    }
    if (!settings || !settings[optionsOrDefault]) {
      return;
    }
    if (
      settings &&
      settings[optionsOrDefault] &&
      (
        typeof(settings[optionsOrDefault]) !== 'object' ||
        Array.isArray(settings[optionsOrDefault])
      )
    ) {
      this.log('settings.' + optionsOrDefault + ' must be an object.');
      return;
    }

    // ['nwVersion', 'nwFlavor', 'platform', 'arch', 'files', 'excludes', 'outputType', ...]
    const settingsToValidate = Object.keys(this.settings[optionsOrDefault]);
    settingsToValidate.forEach((setting) => {
      // this.validationMap.files // 'ArrayOfStrings'
      const validationType = this.validationMap[setting];
      // this.validateArrayOfStrings(settings.taskDefaults, 'files');
      const value = this['validate' + validationType](settings[optionsOrDefault], setting);
      if (value !== null) {
        this.settings[optionsOrDefault][setting] = value;
      }
    });
  },
  /**
   * Applies all taskDefaults to a passed in task,
   * unless the task already has that setting and
   * it is valid.
   *
   * @param  {object} task    Task object with user's passed in settings
   * @param  {string} name    Setting name (icon, platform, etc)
   * @param  {string} method  Name of the validation method (validateString)
   */
  applyDefaultsToTask: function (task, name, method) {
    if (!this.validTaskSettings.includes(name)) {
      this.log('The ' + name + ' setting is not supported on tasks.');
      return;
    }
    let value = this[method](task, name);
    if (value !== null) {
      task[name] = value;
    } else {
      task[name] = this.settings.taskDefaults[name];
    }
  },
  /**
   * Loop over all allowed task settings.
   * Validate or default the setting on the task.
   *
   * @param  {object} task  The task object passed in by the user
   */
  validateTask: function (task) {
    this.validTaskSettings.forEach((key) => {
      // this.applyDefaultsToTask(task, 'nwVersion', 'validateNwVersion');
      this.applyDefaultsToTask(task, key, 'validate' + this.validationMap[key]);
    });
    this.settings.tasks.push(task);
  },
  /**
   * Validate all tasks are objects, then loop over each task to valide/default their settings.
   *
   * @param  {object} settings  The settings object passed in by the user.
   */
  validateTasks: function (settings) {
    if (!settings || !settings.tasks) {
      return;
    }
    if (
      settings &&
      settings.tasks &&
      !Array.isArray(settings.tasks)
    ) {
      this.log('settings.tasks must be an array.');
      return;
    }

    const allTasksAreObjects = settings.tasks.every(function (task) {
      return typeof(task) === 'object' && !Array.isArray(task);
    });

    if (!allTasksAreObjects) {
      this.log('All tasks must be objects.');
      return;
    }

    settings.tasks.forEach((task) => {
      this.validateTask(task);
    });
  },
  /**
   * Clears the state of this file. Since node's "require" will cache this file in memory,
   * if it is called multiple times from the same instance the defaults will need to be
   * reset.
   */
  resetState: function () {
    this.settings = _cloneDeep(defaultSettings);
  },
  /**
   * Loops over all settings objects passed in to combine them in this.settings
   *
   * @param  {object} settings  The JS arguments object of all arguments passed in
   * @return {object}           The validated settings object with defaults built in
   */
  buildSettingsObject: function (settings) {
    this.resetState();
    this.validateOptionsAndTaskDefaults(settings, 'options');
    this.validateOptionsAndTaskDefaults(settings, 'taskDefaults');
    this.validateTasks(settings);
    return this.settings;
  }
};

module.exports = validator;
