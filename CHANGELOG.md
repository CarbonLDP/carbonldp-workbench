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