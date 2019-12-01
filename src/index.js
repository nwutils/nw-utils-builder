const validator = require('./validator.js');
const helpers = require('./helpers.js');

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
      this.log('No settings passed in.');
      return;
    }
    // let templatePattern = /({{)(?:nwVersion|nwFlavor|platform|arch|outputType|name|version)(}})/g;
    this.buildSettingsObject(settings);
  },
  dryRun: function (settings) {
    return validator.buildSettingsObject(settings);
  }
};

module.exports = nwUtilsBuilder;
