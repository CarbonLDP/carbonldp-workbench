# carbonldp-workbench

[![Build Status](https://travis-ci.org/CarbonLDP/carbonldp-workbench.svg?branch=develop)](https://travis-ci.org/CarbonLDP/carbonldp-workbench)

Workbench to administer an on premise installation of Carbon LDP

## Development

### Setup

1. Install dependencies
    - [node.js](https://nodejs.org/en/)
    - gulp: `npm install gulp -g`
    - jspm: `npm install jspm -g`
    - typings: `npm install -g typings`
    - [docker](https://www.docker.com/)
2. Clone dependency projects alongside the project's directory:
    - CarbonLDP-JS-SDK: `gulp clone https://github.com/CarbonLDP/CarbonLDP-JS-SDK.git`
    - carbon-panel: `gulp clone https://github.com/CarbonLDP/carbon-panel.git`
    - angular2-carbonldp: `gulp clone https://github.com/CarbonLDP/angular2-carbonldp.git`
    
    You should end up with the following directories in the same directory:
    - `carbon-workbench`
    - `carbon-panel`
    - `CarbonLDP-JS-SDK`
    - `angular2-carbonldp`
3. cd into `carbon-workbench`
4. run `npm install`
5. run `npm run firsttime`
6. To start the application server run `npm start`

### NPM Scripts

`package.json` defines six tasks:

- `build`: Runs `build:prod` 
- `build:prod`: Runs Webpack bundler to generate the final `dist` files
- `build:semantic`: Builds Semantic UI's `dist` files
- `clean:dist`: Cleans `dist` directory
- `copy:assets`: Copies third party libraries to the assets folder
- `postinstall`: Install a compiled version of Semantic UI inside the `src` folder - _Triggered after `npm install`_
- `firsttime`: Runs `build:semantic` and `copy:assets` 
- `start`: Runs `server:dev` 
- `server:dev`: Runs Webpack bundler in dev mode and starts the app on the host and the port specified in `config/dev.config.json`

### Gulp Tasks

Gulp defines two tasks:

- `clean:dist`: Cleans `dist` directory
- `clean:src`: Cleans `src` directory, removing any unused compiled file (useful when changing branches)
- `copy:assets`: Copies all the assets to `dist/site/assets`
- `copy:node-dependencies`: Copies node dependencies to `src/assets/node_modules` so they can be treated like any normal asset
- `copy:node-dependencies:files`: Copies single files
- `copy:node-dependencies:packages`: Copies complete packages
- `copy:semantic`: Copies the compiled version of semantic to the dist version of the project

### File Structure

- `.idea`: WebStorm shared configuration files (things like code style, and project structure)
- `build`: Build related files (e.g. `nginx.conf`)
    - `nginx.conf`: Configuration file for the nginx server inside the docker image
- `config`: Configuration files that are used when compiling and bundling the application
    - `dev.config.json`: Settings used during the bundling and execution processes of `development` mode of the application
    - `head.config.js`: Links and meta's  injected into the `<head/>` tag of the application
    - `prod.config.json`: Settings used during the bundling and execution processes of `production` mode of the application 
    - `webpack.common.js`: Webpack bundling settings used by the `development` and `production` modes
    - `webpack.dev.js`: Webpack bundling settings for `development` mode
    - `webpack.helpers.js`: Helpers used by webpack's `webpack.common/dev/prod.js` files
    - `webpack.prod.js`: Webpack bundling settings for `production` mode
- `dist`: Distribution related files
- `hooks`: Scripts launched before building images
    - `pre_build`: `BASH` script that runs the docker image 
- `node_modules`: npm dependencies (don't touch them)
- `scripts`: Scripts that help to install dependencies
    - `force-semantic-ui-to-install-correctly.js`: Force Semantic UI to install correctly using `semantic.json` file
    - `install-dependencies.sh`: `SHELL` script that installs the project's dependencies
    - `update-angular.sh`: `SHELL` script that updates the angular dependencies
- `src`: All source files
    - `app`: Source files for the Angular2 application
    - `assets`: Any asset (image, json, etc.). Before adding stylesheets think if they belong to a component, or can be added to the semantic-ui theme
        - `images`: General images
    - `semantic`: Source code for the semantic-ui theme
    - `index.html`: Entry point for the website
    - `main.ts`: Entry file of angular, it bootstrap the main angular module
    - `polyfills.ts`: File that imports all the required polyfills
    - `vendor.ts`: File that imports all the vendor/third party libraries
- `.gitignore`: Ignore file for git
- `.travis.yml`: 
- `CHANGELOG.md`: File to track package changes
- `Dockerfile`: File to build the docker image for deployment
- `gulpfile.js`: Gulp configuration file
- `package.json`: npm configuration file (it also contains JSPM dependency registry)
- `README.md`: === this
- `semantic.json`: semantic-ui configuration file
- `tsconfig.json`: TypeScript compiler configuration file
- `webpack.config.js`: Webpack config entry point, it can bundle the app by recognizing if it's in a dev or prod environment

### Building the Project

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
