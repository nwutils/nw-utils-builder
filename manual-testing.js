const nwBuilder = require('./index.js').build;

const API_Example = {
  global: {
    nwVersion: 'latest', // or 'v0.42.5' or 'match'
    nwFlavor: 'normal', // or 'sdk'
    concurrent: true,
    mirror: 'https://dl.nwjs.io/',
    files: [
      '**/*'
    ],
    excludes: [
      'package-lock.json',
      'assets/*',
      'dev-utils/*'
    ],
    strippedManifestProperties: [
      'scripts',
      'devDependencies'
    ],
    junk: [
      'README.md'
    ]
  },
  tasks: [
    {
      platform: 'win',
      arch: 'x86',
      icon: 'assets/icon.ico',
      unIcon: 'assets/unicon.ico',
      outputType: 'nsis7z'
    },
    {
      platform: 'win',
      arch: 'x86',
      nwFlavor: 'sdk',
      icon: 'assets/icon.ico',
      outputType: 'zip',
      outputPattern: '${NAME}-${VERSION}-${PLATFORM}-${ARCH}--DEVBUILD',
      excludes: [
        'package-lock.json',
        'assets/*'
      ]
    },
    {
      platform: 'osx',
      arch: 'x64',
      icon: 'assets/icon.icns',
      outputType: 'zip'
    },
    {
      platform: 'lin',
      arch: 'x86',
      outputType: '7z'
    },
    {
      platform: 'lin',
      arch: 'x64',
      outputType: '7z'
    }
  ]
};

nwBuilder(API_Example);
