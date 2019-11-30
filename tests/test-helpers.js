const helpers = {
  customizedGlobalSettingsAndTasks: {
    global: {
      verbose: true,
      concurrent: false,
      mirror: 'mirror',
      nwVersion: 'latest',
      nwFlavor: 'sdk',
      platform: 'lin',
      arch: 'x64',
      files: ['src/**/*', 'asdf'],
      excludes: ['package-lock.json', 'qwer'],
      outputType: 'nsis7z',
      outputPattern: '{{nwFlavor}}-{{name}}',
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
        strippedManifestProperties: ['chromium-args'],
        junk: ['README.md'],
        icon: 'assets/filexp.ico',
        unIcon: 'assets/filexp.ico'
      }
    ]
  }
};

module.exports = helpers;
