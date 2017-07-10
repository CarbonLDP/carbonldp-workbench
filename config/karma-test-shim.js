Error.stackTraceLimit = Infinity;

require( "core-js/es6" );
require( "core-js/es7/reflect" );

require( "zone.js/dist/zone" );
require( "zone.js/dist/long-stack-trace-zone" );
require( "zone.js/dist/proxy" );
require( "zone.js/dist/sync-test" );
require( "zone.js/dist/jasmine-patch" );
require( "zone.js/dist/async-test" );
require( "zone.js/dist/fake-async-test" );

require( "rxjs/Rx" );

require( "carbonldp/Carbon" );

let testing = require( "@angular/core/testing" );
let browser = require( "@angular/platform-browser-dynamic/testing" );

testing.TestBed.initTestEnvironment( browser.BrowserDynamicTestingModule, browser.platformBrowserDynamicTesting() );

let testContext = require.context( "../src", true, /\.spec\.ts/ );

// testContext.keys().forEach( testContext );

/**
 * Get all the files, for each file, call the context function
 * that will require the file and load it up here. Context will
 * loop and require those spec files here
 */
function requireAll( requireContext ) {
	return requireContext.keys().map( requireContext );
}

/**
 * Requires and returns all modules that match
 */
let modules = requireAll( testContext );