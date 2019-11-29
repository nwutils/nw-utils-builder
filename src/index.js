const validator = require('./validator.js');
const helpers = require('./helpers.js');

const nwUtilsBuilder = {
  settings: undefined,
  log: function (message, error) {
    helpers.log(message, this.settings, error);
  },
  buildSettingsObject: function (settings) {
    this.settings = validator.buildSettingsObject(settings);
  },

  build: function (settings) {
    if (!settings) {
      this.log('No settings passed in.', { global: { verbose: true } });
      return;
    }
    this.buildSettingsObject(settings);
  }
};

module.exports = nwUtilsBuilder;
