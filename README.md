# carbonldp-workbench

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
4. run `npm install && typings install`
5. To start the application server run `npm start` or `gulp serve`

### Gulp Tasks

Gulp defines two tasks:

- `default`: 
- `build`: Builds the dist version of the project
- `build:docker-image`: Builds a docker image of the project
- `build:docker-image|copy:dockerfile`: Copies the Dockerfile to outside of the project so that the docker build step can copy files of other projects
- `build:docker-image|build:image`: Builds the docker image using the Dockerfile
- `build:docker-image|clean:dockerfile`: Removes the Dockerfile
- `build:semantic`: Builds semantic-ui
- `bundle`: Bundles the application into a self executing file `dist/site/main.sfx.js`
- `clean:dist`: Cleans `dist` directory
- `clean:src`: Cleans `src` directory, removing any unused compiled file (useful when changing branches)
- `compile:boot`: Compiles `src/app/boot.ejs.ts` with the specified configuration
- `compile:index`: Compiles `dist/index.ejs.html` with the specified configuration
- `compile:styles`: Compiles `sass/scss` files inside of the `src` directory
- `copy:assets`: Copies all the assets to `dist/site/assets`
- `copy:node-dependencies`: Copies node dependencies to `src/assets/node_modules` so they can be treated like any normal asset
- `copy:node-dependencies:files`: Copies single files
- `copy:node-dependencies:packages`: Copies complete packages
- `copy:semantic`: Copies the compiled version of semantic to the dist version of the project
- `lint:typescript`: Lints TypeScript files
- `serve`: Builds the project and creates a server to serve it
- `serve|after-compilation`: Internal step for `serve` task

### File Structure

- `.idea`: WebStorm shared configuration files (things like code style, and project structure)
- `build`: Build related files (e.g. `nginx.conf`)
- `config`: Configuration files that are used when compiling the application
- `dist`: Distribution related files
    - `site`: Compiled files. Ready to be served
    - `Dockerfile`: Docker file used to create the docker image
    - `index.ejs.html`: Template to create the compiled `site/index.html` file
    - `nginx.conf`: Configuration file for the nginx server inside the docker image
- `jspm_packages`: jspm dependencies (don't touch them)
- `node_modules`: npm dependencies (don't touch them)
- `src`: All source files
    - `app`: Source files for the Angular2 application
    - `assets`: Any asset (image, json, etc.). Before adding stylesheets think if they belong to a component, or can be added to the semantic-ui theme
        - `images`: General images
    - `semantic`: Source code for the semantic-ui theme
    - `index.html`: Entry point for the website
- `typings`: TypeScript description files (partly managed by [typings](https://github.com/typings/typings))
    - `custom`: Directory to store custom description files
    - `typings.d.ts`: Main description file. Aggregates all other description files
- `.gitignore`: Ignore file for git
- `CHANGELOG.md`: File to track package changes
- `Dockerfile`: File to build the docker image for deployment
- `gulpfile.js`: Gulp configuration file
- `jspm.config.js`: JSPM general configuration file
- `package.json`: npm configuration file (it also contains JSPM dependency registry)
- `README.md`: === this
- `semantic.json`: semantic-ui configuration file
- `tsconfig.json`: TypeScript compiler configuration file
- `typings.json`: [typings](https://github.com/typings/typings) configuration file

### Building the Project

The project is deployed as a docker image. A `Dockerfile` is located at the root of the project, which can be used to build the image. 

## TODO

- Configure a test framework
- Configure code linting (tslint and sasslint)
- Document `gulp` tasks and move them to separate files
- Get docker image version from `package.json`

## LICENSE

    Copyright (c) 2015-present, Base22 Technology Group, LLC.
    All rights reserved.
    
    This source code is licensed under the BSD-style license found in the
    LICENSE file in the root directory of this source tree.
