const commonConfig = require( "./webpack.common.js" );
const helpers = require( "./webpack.helpers" );
const config = require( "./dev.config.json" );
const carbonConfig = config.carbon;
const webpackMerge = require( "webpack-merge" );

// carbonldp's projects versions
const workbench = require( "../package.json" );


// Plugins
const DefinePlugin = require( "webpack/lib/DefinePlugin" );
const ContextReplacementPlugin = require( "webpack/lib/ContextReplacementPlugin" );
const HtmlWebpackPlugin = require( "html-webpack-plugin" );


// Webpack Constants
const ENV = process.env.ENV = process.env.NODE_ENV = "development";
const PROTOCOL = process.env.PROTOCOL || "http";
const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || 8080;
const METADATA = webpackMerge( commonConfig( { env: ENV } ).metadata, {
	baseUrl: config.url.base,
	protocol: PROTOCOL,
	host: HOST,
	port: PORT,
	ENV: ENV,
	isDevServer: helpers.isWebpackDevServer(),
	CARBON: {
		protocol: carbonConfig.protocol,
		domain: carbonConfig.domain,
	}
} );

module.exports = function( options ) {
	return webpackMerge( commonConfig( { env: ENV } ), {
		devtool: "source-map",

		module: {
			rules: [
				{
					test: /\.ts$/,
					use: [ "awesome-typescript-loader", "angular2-template-loader", "angular-router-loader" ]
				}
			]
		},

		output: {
			path: helpers.root( "dist" ),
			filename: "[name].js",
			sourceMapFilename: "[file].map",
			chunkFilename: "[id].chunk.js",
		},

		plugins: [

			// Workaround for angular/angular#11580
			new ContextReplacementPlugin(
				// The (\\|\/) piece accounts for path separators in *nix and Windows
				/\@angular(\\|\/)core(\\|\/)esm5/,
				helpers.root( "./src" ), // location of your src
				{} // a map of your routes
			),

			new DefinePlugin( {
				"process.env": {
					"baseUrl": JSON.stringify( METADATA.baseUrl ),
					"ENV": JSON.stringify( METADATA.ENV ),
					"CARBON": {
						"protocol": JSON.stringify( carbonConfig.protocol ),
						"domain": JSON.stringify( carbonConfig.domain ),
					},
					"PACKAGES": {
						"carbonldp-workbench": JSON.stringify( workbench.version ),
					}
				}
			} ),

			// Webpack inject scripts and links for us with the HtmlWebpackPlugin
			new HtmlWebpackPlugin( {
				filename: "index.html",
				template: "src/index.html",
				chunksSortMode: "dependency",
				metadata: METADATA
			} )
		],

		devServer: {
			open: true,	                // Opens web browser
			port: METADATA.port,	    // Port of project
			host: METADATA.host,        // Host to use by the dev server
			inline: true,	            // A script will be inserted in index.html to take care of live reloading, and build messages will appear in the browser console
			historyApiFallback: true,	// Server index.html page when 404 responses
			watchOptions: {
				aggregateTimeout: 300,	// Add a delay in milliseconds before rebuilding
				poll: 1000	            // Check for changes every second
			}
		},

	} );
};