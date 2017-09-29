const webpack = require( "webpack" );
const commonConfig = require( "./webpack.common.js" );
const helpers = require( "./webpack.helpers" );
const config = require( "./dev.config.json" );
const carbonConfig = config.carbon;
const webpackMerge = require( "webpack-merge" );
const HtmlWebpackPlugin = require( "html-webpack-plugin" );

// carbonldp's projects versions
const workbench = require( "../package.json" );


// Plugins
const DefinePlugin = require( "webpack/lib/DefinePlugin" );
const CommonsChunkPlugin = require( "webpack/lib/optimize/CommonsChunkPlugin" );
const IgnorePlugin = require( "webpack/lib/IgnorePlugin" );


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
			publicPath: "http://" + HOST + ":" + PORT + "/",
			filename: "[name].js",
			sourceMapFilename: "[file].map",
			chunkFilename: "[id].chunk.js",
		},

		plugins: [

			// Workaround for angular/angular#11580
			new webpack.ContextReplacementPlugin(
				// The (\\|\/) piece accounts for path separators in *nix and Windows
				/angular(\\|\/)core(\\|\/)@angular/,
				helpers.root( "./src" ), // location of your src
				{} // a map of your routes
			),

			new DefinePlugin( {
				"ENV": JSON.stringify( METADATA.ENV ),
				"process.env": {
					"baseUrl": JSON.stringify( METADATA.baseUrl ),
					"ENV": JSON.stringify( METADATA.ENV ),
					"NODE_ENV": JSON.stringify( METADATA.ENV ),
					"CARBON": {
						"protocol": JSON.stringify( carbonConfig.protocol ),
						"domain": JSON.stringify( carbonConfig.domain ),
					},
					"PACKAGES": {
						"carbonldp-workbench": JSON.stringify( workbench.version ),
					}
				}
			} ),

			// Ignore node imports
			// TODO: remove this line when SDK provides fix
			new IgnorePlugin( /^(http|https|file-type)$/, /carbonldp/ ),

			// Webpack inject scripts and links for us with the HtmlWebpackPlugin
			new HtmlWebpackPlugin( {
				filename: "index.html",
				template: "src/index.html",
				chunksSortMode: "dependency",
				metadata: METADATA
			} )
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