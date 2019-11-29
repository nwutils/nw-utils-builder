const nwUtilsBuilder = {

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
   * Validates the Junk array in each section
   * @param  {string} section 'global', 'win', 'lin', 'osx'
   */
  validateJunk: function (settings, section) {
    if (
      settings[section] &&
      settings[section].junk &&
      Array.isArray(settings[section].junk)
    ) {
      if (settings[section].combineWithExisting) {
        settings[section].junk.forEach((item) => {
          this.settings[section].junk.push(item);
        });
        // de-dupe
        this.settings[section].junk = Array.from(new Set(this.settings[section].junk));
      } else {
        this.settings[section].junk = settings[section].junk;
      }
    }
  },
  /**
   * Validates an individual settings object, combining it with the existing settings in this.settings
   * @param  {object} settings A setting object passed in by the user
   */
  validateAndMergeSettings: function (settings) {
    if (!settings) {
      return;
    }
    this.sections.forEach((section) => {
      this.validateJunk(settings, section);
    });
  },
  /**
   * Loops over all settings objects passed in to combine them in this.settings
   * @param  {object} arguments The JS arguments object of all arguments passed in
   */
  buildSettingsObject: function (settings) {
    this.validateAndMergeSettings(settings);
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
