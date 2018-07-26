# [CarbonLDP Workbench](http://carbonldp.com/)

<div align="center">
  <a href="http://carbonldp.com/" style="text-decoration: none;">
    <img width="500" src="https://carbonldp.com/assets/images/carbon-logo-header.svg">
  </a>
  <br>
  <br>
</div>

[![Build Status](https://travis-ci.org/CarbonLDP/carbonldp-workbench.svg?branch=develop)](https://travis-ci.org/CarbonLDP/carbonldp-workbench)

Workbench to administer an on premise installation of Carbon LDP

## Development

### Setup

1. Install dependencies
    - [node.js](https://nodejs.org/en/)
    - gulp: `npm install gulp -g`
    - [docker](https://www.docker.com/)
2. Clone dependency projects alongside the project's directory:
    - carbonldp-js-sdk: `gulp clone https://github.com/CarbonLDP/carbonldp-js-sdk.git`
    - carbonldp-panel: `gulp clone https://github.com/CarbonLDP/carbonldp-panel.git`
    - angular2-carbonldp: `gulp clone https://github.com/CarbonLDP/angular2-carbonldp.git`
    
    You should end up with the following directories in the same directory:
    - `carbonldp-workbench`
    - `carbonldp-panel`
    - `carbonldp-js-sdk`
    - `angular2-carbonldp`
3. cd into `carbonldp-workbench`
4. run `npm install`
5. To start the application server run `npm start`
	
	**Note**: You may need to change the Carbon host configuration inside `config/dev.config.json`

### NPM Scripts

`package.json` defines six tasks:

- `build`: Runs `build:semantic`, `copy:assets` and `build:prod` tasks
- `build:prod`: Runs Webpack bundler to generate the final `dist` files
- `build:semantic`: Builds Semantic UI's `dist` files
- `clean:dist`: Cleans `dist` directory
- `copy:assets`: Copies third party libraries to the assets folder
- `postinstall`: Install a compiled version of Semantic UI inside the `src` folder - _Triggered after `npm install`_
- `start`: Runs `server:dev`
- `server:dev`: Runs Webpack bundler in dev mode and starts the app on the host and the port specified in `config/dev.config.json`

### Gulp Tasks

Gulp defines six tasks:

- `clean:dist`: Cleans `dist` directory
- `clean:src`: Cleans `src` directory, removing any unused compiled file (useful when changing branches)
- `copy:assets`: Copies all the assets to `dist/assets`
- `copy:node-dependencies`: Copies node dependencies to `src/assets/node_modules` so they can be treated like any normal asset
- `copy:node-dependencies:files`: Copies single files
- `copy:node-dependencies:packages`: Copies complete packages

### File Structure

    .
    ├── .idea                               # WebStorm shared configuration files (like code style)
    ├── build                               # Build related files (e.g. `nginx.conf`)
    │   └── nginx.conf                      # Configuration file for nginx server inside the docker image
    ├── config                              # Configuration files used while bundling the application
    │   ├── dev.config.json                 # Settings used during DEVELOPMENT mode of the application
    │   ├── head.config.js                  # HTML head elements injected into the application index.html
    │   ├── prod.config.json                # Settings used during PRODUCTION mode of the application
    │   ├── webpack.common.js               # Webpack's settings used by DEV and PROD modes
    │   ├── webpack.dev.js                  # Webpack bundling settings for DEVELOPMENT mode
    │   ├── webpack.helpers.js              # Helpers used by webpack's webpack.common/dev/prod.js files
    │   └── webpack.prod.js                 # Webpack bundling settings for PRODUCTION mode
    ├── dist                                # Distribution related files
    ├── hooks                               # Scripts launched before building images
    │   └── pre_build                       # BASH script that runs the docker image
    ├── node_modules                        # npm dependencies (don't touch them)
    ├── scripts                             # Scripts that help to install dependencies
    │   ├── force-semantic-ui-to-install-correctly.js   
    │   │                                   # Force correct install of Semantic UI using `semantic.json` 
    │   ├── pre_build.sh                    # SHELL script that runs the docker image
    │   └── write-global-variables.sh       # SHELL script that replaces Carbon settings in index.html 
    ├── src                                 # All source files
    │   ├── app                             # Source files for the Angular application
    │   ├── assets                          # Any asset (image, json, etc.)
    │   │   └── images                      # General images
    │   ├── semantic                        # Source code for the Semantic UI theme
    │   ├── index.html                      # Entry point for the app
    │   ├── main.ts                         # Entry file of angular, it bootstrap the main angular module
    │   └── polyfills.ts                    # File that imports all the required polyfills
    ├── typings                             # Typescript description files
    │   ├── customs                         # Directory to store custom description files
    │   │   ├── codemirror
    │   │   │   └── index.d.ts              # Codemirror's description file
    │   │   ├── highlightjs
    │   │   │   └── index.d.ts              # HighlightJS's description file
    │   │   ├── jstree
    │   │   │   └── index.d.ts              # JSTree's description file
    │   │   └── semantic-ui
    │   │       └── index.d.ts              # Semantic-UI's description file
    │   └── typings.d.ts                    # Main typings file referencing all index.d.ts custom files
    ├── .gitignore                          # Ignore file for git
    ├── .travis.yml                         # Travis configuration file
    ├── CHANGELOG                           # File to track package changes
    ├── Dockerfile                          # File to build the docker image for deployment
    ├── gulpfile.js                         # Gulp's configuration file
    ├── LICENSE
    ├── package.json                        # npm configuration file
    ├── README.md                           # this
    ├── semantic.json                       # Semantic UI configuration file
    ├── tsconfig.json                       # Typescript compiler configuration file
    ├── tsconfig-aot.json                       # AOT compiler configuration file
    └── webpack.config.js                   # It bundles app depending on process.env.NODE_ENV (Dev/Prod)

### Developing the Project

In order to develop this project you need to do the following:
 
1. cd into `carbonldp-workbench`
2. run `npm start`
3. Modify the code inside this `carbonldp-workbench`

### Developing other carbonldp's projects

As mentioned earlier, during the Setup section, this project uses the following sibling directories:
 
- `carbonldp-panel`
- `carbonldp-js-sdk`
- `angular2-carbonldp`

If you want to develop any of those projects, you can do that by following these steps:

1. cd into desired project. E.g:`cd carbonldp-panel`
2. Run `gulp watch` to wait for changes (If the desired project is `carbonldp-js-sdk` you need to manually run `gulp` whenever you want to test a change)
3. Cd into `../carbonldp-workbench`
4. Add `"carbonldp-panel/*": [ "../carbonldp-panel/src/*" ]` to the `paths` property of `compilerOptions` in _`tsconfig.json`_ file 
4. Run `sudo npm link DESIRED_PROJECT_PATH` E.g: `sudo npm link ../carbonldp-panel/dist`
5. Enter your super user credentials
5. Run `npm start`

After this you will be able to see the changes whenever you modify something from the source projects.

### Deploying the Project

The project is deployed as a docker image. A `Dockerfile` is located at the root of the project, which can be used to build the image. 

## TODO

- Configure a test framework
- Configure code linting (tslint and sasslint)
- Get docker image version from `package.json`

## LICENSE

    Copyright (c) 2015-present, Base22 Technology Group, LLC.
    All rights reserved.
    
    This source code is licensed under the BSD-style license found in the
    LICENSE file in the root directory of this source tree.
