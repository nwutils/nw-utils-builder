

# WIP: Do not use

This was in planning prior to the [nw-builder](https://github.com/nwutils/nw-builder) revitalization project. After that project is in a more finished state, we may use it as a dependency in this project to simplify both repos. `nw-builder` would be focused on doing a single build. `nw-utils-builder` would be focused on doing multiple builds, as tasks (see API ideas below).

For now, this project is on hold.


## nw-utils-builder

[![Build Status](https://travis-ci.org/nwutils/nw-utils-builder.svg?branch=master)](https://travis-ci.org/nwutils/nw-utils-builder) [![Test Coverage](https://img.shields.io/coveralls/github/nwutils/nw-utils-builder?label=Test%20Coverage&logo=jest)](https://coveralls.io/github/nwutils/nw-utils-builder) ![Lint Coverage: 100%](https://img.shields.io/badge/Lint%20Coverage-100%25-brightgreen.svg?logo=eslint)

<!--
![Node Support >=4.0.0](https://img.shields.io/badge/Node-%3E%3D4.0.0-brightgreen.svg?logo=node.js)
-->


### Experimental NW.js build tool


**TODO:**

* [x] Design API
* [x] Validate options
* [x] Write unit tests
* [ ] Produce basic Windows build
* [ ] Produce basic Linux/OSX build
* [ ] Implement API features
   * [x] verbose
   * [x] files
   * [x] excludes
   * [x] outputPattern
   * [x] strippedManifestProperties
   * [x] output
   * [ ] mirror
   * [ ] nwVersion
   * [ ] nwFlavor
   * [ ] platform
   * [ ] arch
   * [ ] outputType
   * [ ] icon
   * [ ] unIcon
   * [ ] hostNodeMustMatch
   * [ ] junk
   * [ ] concurrent
* [ ] Support each build type
   * [ ] zip
   * [ ] 7z
   * [ ] nsis
   * [ ] nsis7z
* [ ] Find minimum supported Node version for this repo
* [ ] Documentation
* [ ] Bump to v1.0.0 and release


## Documentation (WIP, do not use)

**Every setting is optional**, but you do need to pass in at least an object as a task.

**Bare minimum:**

```js
const nwBuilder = require('nw-utils-builder');

nwBuilder.build({
  tasks: [{}]
});
```

**Basic example:**

```js
const nwBuilder = require('nw-utils-builder');

nwBuilder.build({
  // General options
  options: {
    output: './builds' // defaults to './dist'
  },
  // Your custom global defaults that all tasks inherit from
  taskDefaults: {
    nwVersion: 'v0.44.4', // defaults to 'match'
    excludes: ['node_modules', 'documentation', 'tests'],
    outputType: '7z'
  },
  tasks: [
    {}, // an empty object will inherit all the defaults and do a build of that
    {
      platform: 'lin',
      arch: 'x64'
    },
    {
      platform: 'osx',
      arch: 'x64'
    }
  ]
});
```


### Top-level Settings

Name           | Allowed values   | Default     | Description
:--            | :--              | :--         | :--
`options`      | Object           | `undefined` | Global options, like your dist folder, or whether to log errors during builds.
`taskDefaults` | Object           | `undefined` | Settings that all tasks will inherit by default.
`tasks`        | Array of Objects | `undefined` | Each object represents a unique build task. Any settings here will override the ones set in the `taskDefaults`.


### Options

Name         | Allowed values | Default                 | Description
:--          | :--            | :--                     | :--
`verbose`    | Boolean        | `true`                  | True = Will console log helpful information, warnings, errors, and tips. False = silent, unless something explodes.
`output`     | File Path      | `'./dist'`              | The location where all builds will be stored
`mirror`     | URL            | `'https://dl.nwjs.io/'` | NOT IMPLEMENTED. IGNORE
`concurrent` | Boolean        | `false`                 | NOT IMPLEMENTED. IGNORE


### Task Defaults

Name                         | Allowed values                                                  | Default                                        | Description
:--                          | :--                                                             | :--                                            | :--
`nwVersion`                  | Valid NW.js version, `'latest'`, `'lts'`, `'match'`, `'stable'` | `'match'`                                      | Valid version, like `'0.43.2'`. Latest/LTS/Stable are based on [this](https://nwjs.io/versions.json). Match will use the same version as what is in your `package.json`'s `devDependencies.nw`.
`nwFlavor`                   | `'match'`, `'normal'`, `'sdk'`                                  | `'normal'`                                     | Which flavor of NW.js to use. Match will use the flavor set in your `package.json`'s `devDependencies.nw`.
`platform`                   | `'win'`, `'lin'`, `'osx'`                                       | `'win'`                                        | Which OS your build task is for. Windows, Linux, or OSX (MacOS/Darwin).
`arch`                       | `'x86'`, `'x64'`                                                | `'x86'`                                        | The OS architechture this build task is targeting. x86 = 32-Bit, x64 = 64-Bit OS.
`files`                      | An array of strings with glob patterns                          | `['**/*']`                                     | This is used to find the files to be copied to your dist folder for that build task.
`excludes`                   | An array of strings with glob patterns                          | `['node_modules']`                             | This is used to find the files to be skipped when copying `files` to your dist folder.
`outputType`                 | `'7z'`, `'nsis'`, `'nsis7z'`, `'zip'`                           | `'zip'`                                        | NOT IMPLEMENTED. May change. To be detailed later.
`outputPattern`              | String                                                          | `'{{name}}-{{version}}-{{platform}}-{{arch}}'` | String used to dynamically name your build task's dist folder. Keywords in double curly braces are replaced at build time. Valid keywords: name, version, nwVersion, nwFlavor, platform, arch, outputType. Name and version are derived from your `package.json`, the rest come from your task's settings.
`manifestOverrides`          | Object                                                          | `{}`                                           | This object will be deep-merged with your manifest (`package.json`), overriding just the parts you specify.
`strippedManifestProperties` | Array of strings                                                | `[]`                                           | List of items in the `package.json` manifest to be removed when copied during the build. Can be nested like `['dependencies.lodash']`.
`junk`                       | Array of strings                                                | `[]`                                           | NOT IMPLEMENTED. May change. Will allow removing of junk files after copying and doing an `npm install`.
`icon`                       | File path                                                       | `undefined`                                    | NOT IMPLEMENTED. May change.
`unIcon`                     | File path                                                       | `undefined`                                    | NOT IMPLEMENTED. May change.
