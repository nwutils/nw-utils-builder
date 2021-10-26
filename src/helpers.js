const helpers = {
  /**
   * Console logs helper error messages if verbose mode is enabled.
   *
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
  },
  /**
   * Check the status on the results of node-fetch.
   *
   * @param  {object} response  The node-fetch network response.
   * @param  {object} settings  Global settings
   * @return {object}           The response if it is 200 OK
   */
  checkStatus: function (response, settings) {
    // response.status >= 200 && response.status < 300
    if (response.ok) {
      return response;
    } else {
      this.log(response.statusText, settings);
    }
  }
};

module.exports = helpers;
