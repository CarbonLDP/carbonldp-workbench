module.exports = function( config ) {
	const webpackTestConfig = require( "./webpack.test" )( { env: "test" } );

	const _config = {

		/*
		 * Webpack"s settings
		 */
		basePath: "",
		frameworks: [ "jasmine-ajax", "jasmine" ],
		exclude: [],
		client: {
			captureConsole: false
		},
		files: [
			{ pattern: "./src/assets/**/*", watched: false, included: false, served: true, nocache: false },
			{ pattern: "./config/karma-test-shim.js", watched: false },
		],
		proxies: {
			"/assets/": "/base/src/assets/"
		},
		preprocessors: {
			"./config/karma-test-shim.js": [ "webpack", "sourcemap" ]
		},
		webpack: webpackTestConfig,
		webpackMiddleware: {
			noInfo: true,
			stats: {
				chunks: false
			}
		},
		webpackServer: {
			noInfo: false
		},


		/*
		 * Karma's settings
		 */
		reporters: [ "mocha" ],
		port: 9876,
		colors: true,
		logLevel: config.LOG_INFO,
		autoWatch: true,
		browsers: [ "Chrome" ],
		customLaunchers: {
			ChromeTravisCi: {
				base: "Chrome",
				flags: [ "--no-sandbox" ]
			}
		},
		singleRun: false
	};

	config.set( _config );
};