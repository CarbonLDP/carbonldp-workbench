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
2. Clone the CarbonLDP JS SDK the project's directory:
    - carbonldp-js-sdk: `gulp clone https://github.com/CarbonLDP/carbonldp-js-sdk.git`

    You should end up with the following directories in the same directory:
    - `carbonldp-workbench`
    - `carbonldp-js-sdk`
3. cd into `carbonldp-workbench`
4. run `npm install`
5. run `npm run build:semantic`
6. To start the application server run `npm start`
	
	**Note**: You may need to change the Carbon host configuration inside `config/dev/dev.config.json`

### NPM Scripts

`package.json` defines six tasks:

- `build`: Runs `build:semantic`, `copy:assets` and `build:prod` tasks
- `build:prod`: Runs Webpack bundler to generate the final `dist` files
- `build:semantic`: Builds Semantic UI's `dist` files
- `clean:dist`: Cleans `dist` directory
- `compodoc`: Runs compodoc to produce the documentation of the angular architecture of the project
- `compodoc:serve`: Runs `compodoc` and serves it on port `4200`
- `compodoc:watch`: Runs `compodoc`, serves it on port `4200` and watches the changes made to the app
- `postinstall`: Install a compiled version of Semantic UI inside the `src` folder - _Triggered after `npm install`_
- `start`: Runs `server:dev`
- `server:dev`: Runs Webpack bundler in dev mode and starts the app on the host and the port specified in `config/dev/dev.config.json`
- `test`: Runs the tests using karma

### Gulp Tasks

Gulp defines two tasks:

- `clean:dist`: Cleans `dist` directory
- `clean:src`: Cleans `src` directory, removing any unused compiled file (useful when changing branches)

### File Structure

    .
    ├── .idea                               # WebStorm shared configuration files (like code style)
    ├── build                               # Build related files (e.g. `nginx.conf`)
    │   └── nginx.conf                      # Configuration file for nginx server inside the docker image
    ├── config                              # Configuration files used while bundling the application
    │   ├── dev                             # Contains the files for DEVELOPMENT mode
    │   │   ├── dev.config.json             # Settings and values used during DEVELOPMENT mode of the application
    │   │   └── webpack.dev.js              # Webpack bundling settings for DEVELOPMENT mode
    │   ├── prod                            # Contains the files for PRODUCTION mode
    │   │   ├── prod.config.json            # Settings used during PRODUCTION mode of the application
    │   │   └── webpack.prod.js             # Webpack bundling settings for PRODUCTION mode
    │   ├── test                            # Contains the files for TEST mode
    │   │   ├── karma.conf.json             # Settings of Karma to run the tests
    │   │   ├── karma-test-shim             # Some polyfills needed by karma to properly run the tests
    │   │   └── webpack.test.js             # Webpack bundling settings for TEST mode
    │   ├── head.config.js                  # HTML head elements injected into the application index.html
    │   ├── webpack.common.js               # Webpack's settings used by DEV and PROD modes
    │   └── webpack.helpers.js              # Helpers used by webpack's webpack.common/dev/prod.js files
    ├── dist                                # Distribution files
    ├── hooks                               # Scripts launched before building images
    │   └── pre_build                       # BASH script the docker image runs
    ├── node_modules                        # npm dependencies (don't touch them)
    ├── scripts                             # Scripts that help to install dependencies
    │   ├── force-semantic-ui-to-install-correctly.js   
    │   │                                   # Force the correct install of Semantic UI using `semantic.json`
    │   ├── pre_build.sh                    # SHELL script the docker image runs
    │   └── write-global-variables.sh       # SHELL script that replaces Carbon settings in index.html 
    ├── src                                 # All source files
    │   ├── app                             # Source files for the Angular application
    │   ├── assets                          # Any asset (image, json, etc.)
    │   │   ├── fonts                       # Fonts used by the Workbench
    │   │   └── images                      # General images
    │   ├── semantic                        # Source code for the installed Semantic UI theme
    │   ├── index.html                      # Entry point for the app
    │   ├── main.ts                         # Entry file of angular, it bootstrap the main angular module
    │   ├── polyfills.ts                    # Imports all the required polyfills
    │   └── styles.ts                       # Imports the global styles (Semantic UI)
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
    ├── .dockerignore                       # Ignore file for docker
    ├── .gitignore                          # Ignore file for git
    ├── .travis.yml                         # Travis configuration file
    ├── CHANGELOG                           # File to track package changes
    ├── Dockerfile                          # File to build the docker image for deployment
    ├── gulpfile.js                         # Gulp's configuration file
    ├── karma.conf.js                       # Karma's main entry point
    ├── LICENSE
    ├── package.json                        # npm configuration file
    ├── README.md                           # this
    ├── semantic.json                       # Semantic UI configuration file
    └── tsconfig.json                       # Typescript compiler configuration file

### Developing the Project

In order to develop this project you need to do the following:
 
1. cd into `carbonldp-workbench`
2. run `npm start`
3. Start coding!

### Developing other CarbonLDP's projects

As mentioned earlier, during the Setup section, this project uses the following sibling directory:
 
- `carbonldp-js-sdk`

If you want to develop the Workbench against a specific version of the SDK, make sure
you've followed the steps from setup and run the following commands:

1. cd into the SDK. E.g:`cd carbonldp-js-sdk`
2. Build the project or run a watch task to wait for changes. E.g: `npm run build`
3. cd into the production folder of the project `cd dist`
4. Run `npm link`
5. cd into the workbench directory. E.g:`cd ../../carbonldp-workbench`
6. Run `npm link carbonldp`
7. Run `npm start`

After this you will be able to see the changes whenever you modify something from the SDK.

## Generating the Docker image

To generate the Docker image of the Workbench, do the following:

1. Run `npm run build` to build the Workbench 
2. Run `docker build -t carbonldp/carbonldp-workbench .` to build the Docker image
3. Run the Docker image `docker run -d --name carbonldp-workbench -p 8080:80 -e "CARBON_HOST=localhost:8083" -e "CARBON_PROTOCOL=http" carbonldp/carbonldp-workbench`

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
