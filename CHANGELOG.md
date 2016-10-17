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