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
3. A client to write and execute SPARQL queries

This web app is made with the following technologies:

- [Angular](angular.io):<br>
    A framework that handles all the logic and interfaces related with
    the features of the Workbench. Angular allows us to better organize
    the Workbench's features via modules you could found more information about them
    in [structure section](./structure.md)

- [Webpack](https://webpack.js.org/):<br>
    Webpack is a bundling technology that allows us to define rules to
    process all types of files in order to produce a final optimized
    version of the bundled application.

- [TypeScript](https://www.typescriptlang.org/):<br>
    A JavaScript superset that allows us to write JS code using types,
    allowing us to detect errors before the code reaches the prod
    environment.

- [Semantic UI](https://semantic-ui.com/):<br>
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

1. __Web development__:<br>
    Meaning HTML (5+), CSS (3+) and JavaScript (ES2015+).

1. __[SCSS](https://sass-lang.com/)__:<br>
	CSS extension language that provides rich capabilities to build complex
	applications.

1. __[TypeScript](https://www.typescriptlang.org/)__:<br>
	Language that builds on top of JavaScript adding semantics to incorporate
	type safety to source code. Angular uses it as its main supported language.

1. __Version control systems__ ([git](https://git-scm.com/)):<br>
	Used to keep track of changes to the source code and to coordinate
	team efforts.

1. __Package managers ([npm](https://www.npmjs.com))__:<br>
    Used to install packages/libraries used in this project.

1. __[Angular](https://angular.io/)__:<br>
	Framework that provides common tools and patterns to ease development.

1. __[Angular CLI](https://cli.angular.io/)__:<br>
    Command line interface that helps with building Angular applications.
    This CLI is also in charge of processing and compiling the source
    code into the final product (using [webpack](https://webpack.js.org/)).
