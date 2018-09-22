# Contents

- This document:
    - [What is the Workbench?](#what-is-the-workbench?)
    - [Technical requirements](#technical-requirements)
- [Structure](./structure.md)
    - Workbench's structure
        - Configuration structure
            - Global variables and `src/index.html`
        - Application Structure
            - Transpilers
            - Angular application
                - Providers
                - Guards
                - Modules
- [Conventions](./conventions.md)
- [Style guides](./style-guide.md)
- [Architecture](./architecture.md)


## What is the Workbench?

The Workbench is a web application made with the purpose of
maintaining the data stored in an instance of Carbon LDP.

Some of the features the Workbench provides are the following:

1. Overview of triples and documents stored
2. Data stored inside the platform
3. Security aspects for authentication and authorization
4. A client to write and execute SPARQL queries

This web app is made with the following technologies:

- [Angular](angular.io):<br>
    A framework that handles all the logic and interfaces related with
    the features of the Workbench. Angular allows us to better organize
    the Workbench's features via modules by providing 12 modules that
    are listed in the [structure section](./structure.md).

- [Webpack](https://webpack.js.org/):<br>
    Webpack is a bundling technology that allows us to define rules to
    process all types of files in order to produce a final optimized
    version of the bundled application.

- [Typescript](https://www.typescriptlang.org/):<br>
    A JavaScript superset that allows us to write JS code using types,
    allowing us to detect errors before the code reaches the prod
    environment.

- [Semantic UI](https://semantic-ui.com/elements/icon.html):<br>
    A development framework that helps create responsive layouts using
    human-friendly HTML. It provides the styles used by the Workbench.

- [Docker](https://www.docker.com/):<br>
    Since Carbon LDP provides its platform via docker images, the
    Workbench follows this approach and also uses the Docker to ship the
    final production code via Docker images. Thanks to this, any user
    with Docker can easily fire up their own instance of the Workbench.

## Technical requirements

To develop the Workbench, there are some important technologies and tools
that newcomer need to know. Such technologies and tools are the following:

1. Package managers (NPM):<br>
    Used to install packages/libraries used in this project.

2. Bundling tools (Webpack):<br>
    Webpack is used to produce the final code optimized for multiple
    environments. The available environments are Development mode,
    Production mode and Test mode. Basically, it reads the module
    imports from the ts files and groups everything in files.
    It does the same with CSS files.

3. Web Frameworks (Angular):<br>
    Web frameworks are what are driving the modern web development which
    provide a collection of tools and snippets of code that allows us to
    easily create web applications. The Workbench uses Angular as its
    web framework because it's one of the biggest frameworks that exist
    and also because it has very big community support and it's code is
    entirely handled and backed by Google.

4. JavaScript / Typescript:<br>
    The features of the Workbench are coded using Typescript because is
    the language that Angular uses for its framework. Since Typescript
    is just a superset of JavaScript and, when compiled, produces JS
    code, knowledge on JavaScript is required.

5. Basic web development (HTML, CSS, JavaScript):<br>
    Because the Workbench is a web application, basic knowledge on web
    application is required. This means HTML 5 tags, CSS 3, SCSS and
    JavaScript

6. Version control (Git): <br>
    Since the Carbon LDP team has all its repositories in GitHub, Git is
    the version control tool used by the Workbench.
