const helpers = {
  log: function (message, settings, error) {
    if (
      message &&
      settings &&
      settings.global &&
      settings.global.verbose
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
