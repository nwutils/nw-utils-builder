const helpers = {
  title: 'NW-UTILS-BUILDER:',
  customizedSettingsAndTasks: {
    options: {
      verbose: true,
      concurrent: false,
      mirror: 'mirror/',
      output: './built'
    },
    taskDefaults: {
      nwVersion: 'latest',
      nwFlavor: 'sdk',
      platform: 'lin',
      arch: 'x64',
      files: ['src/**/*', 'asdf'],
      excludes: ['package-lock.json', 'qwer'],
      outputType: 'nsis7z',
      outputPattern: '{{nwFlavor}}-{{name}}',
      manifestOverrides: {
        name: 'default'
      },
      strippedManifestProperties: ['chromium-args', 'build'],
      junk: ['README.md', 'test'],
      icon: 'assets/file.ico',
      unIcon: 'assets/file.ico'
    },
    tasks: [
      {
        nwVersion: 'v0.14.7',
        nwFlavor: 'normal',
        platform: 'win',
        arch: 'x86',
        files: ['src/**/*', 'qwer'],
        excludes: ['package-lock.json', 'zxcv'],
        outputType: 'nsis',
        outputPattern: '{{nwFlavor}}-{{name}}-XP',
        manifestOverrides: {
          name: 'task'
        },
        strippedManifestProperties: ['chromium-args'],
        junk: ['README.md'],
        icon: 'assets/filexp.ico',
        unIcon: 'assets/filexp.ico'
      }
    ]
  },
  /**
   * Converts from Windows Slashes to Unix slashes.
   *
   * @param  {string} str  Any string
   * @return {string}      Converted string
   */
  slasher: function (str) {
    return str.split('\\').join('/');
  }
};

module.exports = helpers;
