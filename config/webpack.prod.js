const webpack = require( "webpack" );
const webpackMerge = require( "webpack-merge" );
const helpers = require( "./webpack.helpers" );
const config = require( "./prod.config.json" );
const commonConfig = require( "./webpack.common.js" );
const carbonConfig = config.carbon;

// Plugins
const DefinePlugin = require( "webpack/lib/DefinePlugin" );
const ExtractTextPlugin = require( "extract-text-webpack-plugin" );
const LoaderOptionsPlugin = require( "webpack/lib/LoaderOptionsPlugin" );
const NoEmitOnErrorsPlugin = require( "webpack/lib/NoEmitOnErrorsPlugin" );
const UglifyJsPlugin = require( "webpack/lib/optimize/UglifyJsPlugin" );

const ENV = process.env.NODE_ENV = process.env.ENV = "production";
// Webpack Constants
const PROTOCOL = process.env.PROTOCOL || "http";
const HOST = process.env.HOST || "127.0.0.1";
const PORT = process.env.PORT || 8080;
const HMR = helpers.hasProcessFlag( "hot" );
const METADATA = webpackMerge( commonConfig( { env: ENV } ).metadata, {
	protocol: PROTOCOL,
	host: HOST,
	port: PORT,
	ENV: ENV,
	HMR: HMR,
	CARBON: carbonConfig
} );
console.log();


module.exports = function( env ) {
	return webpackMerge( commonConfig( {
		env: ENV
	} ), {
		devtool: "source-map",

		// TODO: Remove this resolve when carbonldp-panel is released using commonjs modules
		resolve: {
			alias: {
				"carbonldp-panel": helpers.root( "../carbonldp-panel/src" )
			},
		},

		output: {
			path: helpers.root( "dist" ),
			publicPath: "/",
			filename: "[name].[chunkhash].js",
			sourceMapFilename: "[name].[chunkhash].map",
			chunkFilename: "[id].[chunkhash].chunk.js"
		},

		plugins: [
			new NoEmitOnErrorsPlugin(), // Stops the build if there is any error.
			new ExtractTextPlugin( "[name].[hash].css" ), // Extracts embedded css as external files, adding cache-busting hash to the filename.
			new DefinePlugin( {
				"ENV": JSON.stringify( METADATA.ENV ),
				"HMR": METADATA.HMR,
				"process.env": {
					"ENV": JSON.stringify( METADATA.ENV ),
					"NODE_ENV": JSON.stringify( METADATA.ENV ),
					"HMR": METADATA.HMR,
					"CARBON": {
						"protocol": JSON.stringify( carbonConfig.protocol ),
						"domain": JSON.stringify( carbonConfig.domain ),
					}
				}
			} ),
			// Minifies the bundles. https://github.com/angular/angular/issues/10618
			new UglifyJsPlugin( {
				beautify: false, //prod
				output: {
					comments: false
				}, //prod
				mangle: {
					keep_fnames: true,
					screw_ie8: true
				}, //prod
				compress: {
					screw_ie8: true,
					warnings: false,
					conditionals: true,
					unused: true,
					comparisons: true,
					sequences: true,
					dead_code: true,
					evaluate: true,
					if_return: true,
					join_vars: true,
					negate_iife: false // we need this for lazy v8
				},
			} ),
			new LoaderOptionsPlugin( {
				minimize: true,
				debug: false,
				options: {
					htmlLoader: {
						//minimize: false // workaround for ng2
						minimize: false,
						removeAttributeQuotes: false,
						caseSensitive: true,
						customAttrSurround: [
							[ /#/, /(?:)/ ],
							[ /\*/, /(?:)/ ],
							[ /\[?\(?/, /(?:)/ ]
						],
						customAttrAssign: [ /\)?\]?=/ ]
					},
				}
			} )
		],
	} );
};