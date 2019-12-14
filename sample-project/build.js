const nwBuilder = require('../src/index.js');

const settings = {
  options: {
    // TODO: add this setting so that it alerts when an NW.js version uses a different version of Node than what is globally installed.
    // Because the nwBuilder script runs **INSIDE** Node, it cannot also change Node versions for you.
    hostNodeMustMatch: false
  },
  tasks: [
    {}
  ]
};

nwBuilder.build(settings);
