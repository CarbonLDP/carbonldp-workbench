# [CarbonLDP Workbench](https://carbonldp.com/)

<div align="center">
  <a href="http://carbonldp.com/" style="text-decoration: none;">
    <img width="500" src="https://carbonldp.com/wp-content/uploads/2018/10/logo-official.svg">
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
    - [docker](https://www.docker.com/)
1. Install project dependencies:<br>
	`npm install`
1. Start the application by executing:<br>
    `npm start`
	
	**Note**: You may need to change the Carbon LDP's instance configuration inside `src/environments`

### NPM Scripts

`package.json` defines six tasks:

- `build`: Builds the source code outputting it in `dist/app`
- `build:docs`: Builds the architecture's documentation files
- `e2e`: Runs end-to-end tests
- `lint`: Scans the source code for bad practices, infractions to code conventions, etc.
- `start`: Runs a development server serving the current source code
- `test`: Runs unit tests

### File Structure

    .
    ├── .idea                               # WebStorm shared configuration files (like code style)
    ├── dist                                # Distribution files
    ├── docs                                # Developer documentation
    ├── e2e                                 # end-to-end tests
    ├── node_modules                        # npm dependencies (don't touch them)
    ├── scripts                             # Scripts run by the application
    │   └── write-global-variables.sh       # SHELL script that replaces makes environment variables accessible to the application
    ├── server                              # HTTP server related files
    │   └── nginx.conf                      # Configuration file for nginx server inside the docker image    
    ├── src                                 # Source code
    │   ├── app                             # Source files for the Angular application
    │   ├── assets                          # Any asset (image, json, etc.)
    │   │   ├── images                      # Images
    |   │   ├── android-chrome-192x192.html # SD icon to display in Android/Chrome (PWA)
    |   │   ├── android-chrome-512x512.html # HD icon to display in Android/Chrome (PWA)
    |   │   ├── apple-touch-icon.html       # Icon to display in iOS devices
    |   │   ├── browserconfig.xml           # File used by IE11 to create a tile for the site
    |   │   ├── favicon.ico                 # .ico favicon
    |   │   ├── favicon-16x16.png           # SD .png favicon
    |   │   ├── favicon-32x32.png           # HD .png favicon
    |   │   ├── mstile-70x70.png            # Icon for Microsoft products
    |   │   ├── safari-pinned-tab.svg       # SVG to show on Safari pinned tabs
    |   │   └── site.webmanifest            # PWA manifest
    │   ├── index.html                      # Entry point for the app
    │   ├── main.ts                         # Entry file of angular. Bootstrap the main angular module
    │   ├── polyfills.ts                    # Imports all the required polyfills
    │   └── styles.scss                     # Main style file for the application
    ├── typings                             # Custom TypeScript description files
    │   ├── custom.codemirror
    │   │   └── index.d.ts                  # Codemirror's description file
    │   ├── custom.highlightjs
    │   │   └── index.d.ts                  # HighlightJS's description file
    │   ├── custom.jstree
    │   │   └── index.d.ts                  # JSTree's description file
    │   └── custom.semantic-ui
    │       └── index.d.ts                  # Semantic-UI's description file
    ├── .dockerignore                       # Tells Docker which files to ignore when building the Docker image
    ├── .editorconfig                       # Multiple IDE-compatible configuration file to standarize major code style rules (tabs vs spaces, etc.)
    ├── .gitignore                          # Ignore file for git    
    ├── .nvm                                # Specifies the supported Node.js version (used by nvm, see: `nvm use`)
    ├── angular.json                        # Angular CLI configuration file
    ├── CHANGELOG                           # File to track package changes
    ├── Dockerfile                          # File to build the docker image for deployment
    ├── LICENSE
    ├── ngsw-config.json                    # Angular CLI PWA configuration file
    ├── package.json                        # npm configuration file
    ├── package-lock.json                   # npm configuration file
    ├── README.md                           # this
    ├── tsconfig.json                       # TypeScript compiler configuration file
    └── tslint.json                         # TSLint configuration file that specifies rules to lint TypeScript files

## Building the Docker image

To generate the Docker image of the Workbench, do the following:

1. The workbench's Docker image can be built with a command like:

	```
	docker build --tag carbonldp/carbonldp-workbench:{TAG} .
	```
	
	See [Docker](https://www.docker.com/)'s documentation for more information.

## LICENSE

    Copyright (c) 2015-present, Base22 Technology Group, LLC.
    All rights reserved.
    
    This source code is licensed under the BSD-style license found in the
    LICENSE file in the root directory of this source tree.
