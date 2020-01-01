const nwBuilder = require('../src/index.js');

const settings = {
  options: {
    // TODO: add this setting so that it alerts when an NW.js version uses a different version of Node than what is globally installed.
    // Because the nwBuilder script runs **INSIDE** Node, it cannot also change Node versions for you.
    //
    // The current task requested NW.js v0.43.2, which ships with Node v13.0.3.
    // The globally installed version of Node.js does not match this (v12.10.1).
    // Resolutions (pick one):
    //   * Change your global Node.js version to v13.0.3.
    //   * Change your NW.js version to v0.42.3 (which ships with v12.10.1).
    //   * Change your hostNodeMustMatch setting to false to remove this check.
    //     NOTE: Doing this may cause certain Node Modules to install, build,
    //     or download files specific to your global Node.js version, making
    //     them incompatible with the differing version of Node shipped with NW.js.
    //     This setting is not enabled by default, and only needed if one of your
    //     dependencies is Node-version specific. So you probably shouldn't turn
    //     it off, unless you know what you are doing.
    hostNodeMustMatch: false
  },
  tasks: [
    {
      excludes: [
        'node_modules',
        'build.js',
        'package-lock.json'
      ]
    }
  ]
};

nwBuilder.build(settings);
