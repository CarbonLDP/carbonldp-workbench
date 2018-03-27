# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## 1.0.0-alpha.3 (2018/03/27)

- Resolved #87 - Use SDK's refactored version
- Resolved #85 - Change sidebar size
- Resolved #80 - Change logo
- Resolved #62 - Disable delete option for system managed documents
- Resolved #63 - Provide immediate feedback when deleting a document
- Resolved #75 - Remove package `angular-carbonldp`

### Fixed

- Resolved #74 - Inverted success message on Documents and Access Points creation
- Resolved #72 - CONSTRUCT and SELECT combination serve wrong output formats of CONSTRUCTS
- Resolved #71 - The SPARQL client set disabled execute button on empty endpoint
- Resolved #84 - Fix version displayer

### Breaking changes

None

## 1.0.0-alpha.2 (2017/09/28)

### Added

- Resolved [#44](https://github.com/CarbonLDP/carbonldp-workbench/issues/) - Add support for AccessPoints CRUD operations
- Resolved [#43](https://github.com/CarbonLDP/carbonldp-workbench/issues/43) - Refactor Workbench's BNode syncing
- Minor features:
  - Added a way to view all the `HasMemberRelationProperties` of a document even if they're empty to add members into them
  - Disable TreeView buttons when it doesn't have any contents/nodes
  - Added option to cancel the modification/creation of a property
  - Changed the style of the document explorer's Add property button
  - Resolved [#33](https://github.com/CarbonLDP/carbonldp-workbench/issues/33) - Changed the color style of the Workbench to a dark-blue theme
- Updated Angular packages to v4.3.6
- Updated SDK to v1.0.0-alpha.3
- Complete [#31](https://github.com/CarbonLDP/carbonldp-workbench/issues/31) - Add widgets feature
- Complete [#33](https://github.com/CarbonLDP/carbonldp-workbench/issues/33) - Change workbench background color

### Fixed

- Fixed document explorer's ExpressionHasChangedAfterItWasChecked exception after a pointer or a literal enters edit mode
- Fixed missing initial value of a document explorer pointer the first time it is being edited
- Resolved [#32](https://github.com/CarbonLDP/carbonldp-workbench/issues/32) - Fix breadcrumb
- Resolved [#38](https://github.com/CarbonLDP/carbonldp-workbench/issues/38) - Fix favicon and title
- Resolved [#37](https://github.com/CarbonLDP/carbonldp-workbench/issues/37) - Fix duplicated error messages

### Breaking changes

None

## 1.0.0-alpha.1 

### Breaking changes

Everything

## 0.8.0 (2017/03/28)

- Completed #21 - Migrated to Webpack so it now bundles and serves the project
- Completed #10 - Added a way to display version numbers for Platform, Workbench and SDK 
- Completed #23 - Changed code to make it AOT compliant
- Updated `carbonldp` to `v.0.42.0`
- Updated `carbonldp-panel` to `v.0.8.0`
- Updated `angular2-carbonldp` to `v.0.5.0`
- Updated `@angular` packages to `v.2.4.9`

## 0.7.1 (2017/02/23)

- Completed #19 - Upgrade carbonldp SDK to `0.40.0`
- Updated the following angular libraries:
    - @angular/common `2.4.2`
    - @angular/compiler `2.4.2`
    - @angular/core `2.4.2`
    - @angular/forms `2.4.2`
    - @angular/http `2.4.2`
    - @angular/platform-browser `2.4.2`
    - @angular/platform-browser-dynamic `2.4.2`
    - @angular/router `3.4.2`

## 0.6.0 (2016/12/19)

- Updated `@angular` packages to v2.4.1
- Updated `carbonldp-panel` to v0.6.0
- Fixed compilation

## 0.5.0 (2016/11/09)

- Updated `carbonldp-panel` to v0.5.0
- Updated `@angular` packages to v2.1.0
- Updated `carbonldp` to v0.40.0
- Added minifying step to build task
- Enabled gzip compression in nginx server

## 0.4.2 (2016/10/17)

- Fixed gulp `copy:node-dependencies` task

## 0.4.1 (2016/10/17)

- Fixed `node-sass` installation bug

## 0.4.0 (2016/10/17)

- Updated carbonldp-panel to v0.4.0
- Updated angular2 to 2.0.2

## 0.3.0 (2016/09/02)

- Update JSPM to beta.25 and install angular-RC5
- Migrate code to @angular RC5.
    - Modularized AppComponent into AppModule.
    - Change bootstrap to use platformBrowserDynamic().bootstrapModule.
- Updated router-deprecated to the new @angular router.
- Implemented Guards of angular2-carbonldp (AuthenticatedGuard, NotAuthenticatedGuard) on AppRouting to authenticate users before displaying anything.
- Change title generator to use the title property unless route says otherwise.
- Simplify build process
- Change development configuration to use jspm link instead of common folder access
- Add LICENSE file
- Rename project to `carbonldp-workbench`

## 0.2.0 (2016/08/07)

- Add registration section to login view

## 0.1.0 (2016/07/19)

- Initial commit
- Mirror `app-dev` functionality