const commonConfig = require( "./webpack.common.js" );
const helpers = require( "./webpack.helpers" );
const webpackMerge = require( "webpack-merge" );
const config = require( "./dev.config.json" );
const carbonConfig = config.carbon;
const devServerConfig = config[ "webpack-dev-server" ];


// Webpack Constants
const METADATA = {
	baseUrl: config.url.base,
	protocol: devServerConfig.protocol,
	host: devServerConfig.host,
	port: devServerConfig.port,
	ENV: "development",
	isDevServer: true,
	carbonldp: {
		protocol: carbonConfig.protocol,
		domain: carbonConfig.domain,
	}
};


module.exports = webpackMerge( commonConfig( METADATA ), {
	devtool: "source-map",

	mode: "development",
	// Another rule to load ts files in dev is to use [ "awesome-typescript-loader", "angular2-template-loader", "angular-router-loader" ]

	output: {
		path: helpers.root( "dist" ),
		filename: "[name].js",
		sourceMapFilename: "[file].map",
		chunkFilename: "[id].chunk.js",
	},

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