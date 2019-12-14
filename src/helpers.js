const helpers = {
  /**
   * Console logs helper error messages if verbose mode is enabled.
   * @param  {any}      message   What should be logged
   * @param  {object}   settings  Settings object with the verbose option
   * @param  {boolean}  error     If true, will throw
   */
  log: function (message, settings, error) {
    if (
      message &&
      settings &&
      settings.options &&
      settings.options.verbose
    ) {
      const title = 'NW-UTILS-BUILDER:';
      if (error) {
        console.log(title);
        throw message;
      } else {
        console.log(title, message);
      }
    }
  }
};

module.exports = helpers;
