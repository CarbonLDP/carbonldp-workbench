# 0.8.0 (2017/03/28)

- Completed #21 - Migrated to Webpack so it now bundles and serves the project
- Completed #10 - Added a way to display version numbers for Platform, Workbench and SDK 
- Completed #23 - Changed code to make it AOT compliant
- Updated `carbonldp` to `v.0.42.0`
- Updated `carbonldp-panel` to `v.0.8.0`
- Updated `angular2-carbonldp` to `v.0.5.0`
- Updated `@angular` packages to `v.2.4.9`

# 0.7.1 (2017/02/23)

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

# 0.6.0 (2016/12/19)

- Updated `@angular` packages to v2.4.1
- Updated `carbonldp-panel` to v0.6.0
- Fixed compilation

# 0.5.0 (2016/11/09)

- Updated `carbonldp-panel` to v0.5.0
- Updated `@angular` packages to v2.1.0
- Updated `carbonldp` to v0.40.0
- Added minifying step to build task
- Enabled gzip compression in nginx server

# 0.4.2 (2016/10/17)

- Fixed gulp `copy:node-dependencies` task

# 0.4.1 (2016/10/17)

- Fixed `node-sass` installation bug

# 0.4.0 (2016/10/17)

- Updated carbonldp-panel to v0.4.0
- Updated angular2 to 2.0.2

# 0.3.0 (2016/09/02)

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

# 0.2.0 (2016/08/07)

- Add registration section to login view

# 0.1.0 (2016/07/19)

- Initial commit
- Mirror `app-dev` functionality