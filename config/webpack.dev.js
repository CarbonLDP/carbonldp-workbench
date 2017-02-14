const commonConfig = require( "./webpack.common.js" );
const helpers = require( "./webpack.helpers" );
const carbonConfig = require( "./carbon.config" );
const webpackMerge = require( "webpack-merge" );
// const webpackMergeDll = webpackMerge.strategy({ plugins: "replace" });


// Plugins
const ExtractTextPlugin = require( "extract-text-webpack-plugin" );
const DefinePlugin = require( "webpack/lib/DefinePlugin" );
const LoaderOptionsPlugin = require( "webpack/lib/LoaderOptionsPlugin" );


// Webpack Constants
const ENV = process.env.ENV;
const PROTOCOL = process.env.PROTOCOL || "http";
const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || 8080;
const HMR = helpers.hasProcessFlag( "hot" );
const METADATA = webpackMerge( commonConfig( { env: ENV } ).metadata, {
	protocol: PROTOCOL,
	host: HOST,
	port: PORT,
	ENV: ENV,
	HMR: HMR,
	CARBON: carbonConfig.dev
} );

module.exports = function( options ) {
	return webpackMerge( commonConfig( { env: ENV } ), {
		devtool: "cheap-module-source-map",

		resolve: {
			modules: [ helpers.root( "../carbonldp-panel/dist" ), helpers.root( "node_modules" ) ]
		},

		resolveLoader: {
			modules: [ helpers.root( "../carbonldp-panel/dist" ), helpers.root( "node_modules" ) ]
		},

		output: {
			path: helpers.root( "dist" ),
			publicPath: "http://" + HOST + ":" + PORT + "/",
			filename: "[name].js",
			sourceMapFilename: "[file].map",
			chunkFilename: "[id].chunk.js",
		},

		plugins: [
			new DefinePlugin( {
				"ENV": JSON.stringify( METADATA.ENV ),
				"HMR": METADATA.HMR,
				"process.env": {
					"ENV": JSON.stringify( METADATA.ENV ),
					"NODE_ENV": JSON.stringify( METADATA.ENV ),
					"HMR": METADATA.HMR,
					"CARBON": {
						"protocol": JSON.stringify( carbonConfig.dev.protocol ),
						"domain": JSON.stringify( carbonConfig.dev.domain ),
					}
				}
			} ),
			new ExtractTextPlugin( "[name].css" ),
		],

		devServer: {
			port: METADATA.port,
			host: METADATA.host,
			historyApiFallback: true,
			watchOptions: {
				aggregateTimeout: 300,
				poll: 1000
			},
		},

	} );
};