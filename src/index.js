const validator = require('./validator.js');
const helpers = require('./helpers.js');

const fs = require('fs');
const path = require('path');

const NO_SETTINGS = 'No settings passed in.';

const nwUtilsBuilder = {
  log: function (message, error) {
    const settings = this.settings || { options: { verbose: true } };
    helpers.log(message, settings, error);
  },
  settings: undefined,
  manifest: undefined,
  buildSettingsObject: function (settings) {
    this.settings = validator.buildSettingsObject(settings);
  },
  readManifest: function () {
    const manifestPath = path.join(process.cwd(), 'package.json');
    // doing require('file.json') will cache the result, to prevent this we read/parse
    this.manifest = JSON.parse(fs.readFileSync(manifestPath));
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
    this.readManifest();
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
