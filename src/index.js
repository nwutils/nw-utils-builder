const validator = require('./validator.js');
const helpers = require('./helpers.js');

const NO_SETTINGS = 'No settings passed in.';

const nwUtilsBuilder = {
  log: function (message, error) {
    const settings = this.settings || { options: { verbose: true } };
    helpers.log(message, settings, error);
  },
  settings: undefined,
  buildSettingsObject: function (settings) {
    this.settings = validator.buildSettingsObject(settings);
  },

  resetState: function () {
    this.settings = undefined;
  },
  build: function (settings) {
    this.resetState();
    if (!settings) {
      this.log(NO_SETTINGS);
      return;
    }
    // let templatePattern = /({{)(?:nwVersion|nwFlavor|platform|arch|outputType|name|version)(}})/g;
    this.buildSettingsObject(settings);
  },
  dryRun: function (settings) {
    if (!settings) {
      this.log(NO_SETTINGS);
      return;
    }
    return validator.buildSettingsObject(settings);
  }
};

module.exports = nwUtilsBuilder;
