const webpackMerge = require( "webpack-merge" );
const helpers = require( "../webpack.helpers" );
const config = require( "./prod.config.json" );
const commonConfig = require( "../webpack.common.js" );
const carbonConfig = config.carbon;


// Plugins
const LoaderOptionsPlugin = require( "webpack/lib/LoaderOptionsPlugin" );
const NoEmitOnErrorsPlugin = require( "webpack/lib/NoEmitOnErrorsPlugin" );
const UglifyJsPlugin = require( "uglifyjs-webpack-plugin" );
const OccurrenceOrderPlugin = require( "webpack/lib/optimize/OccurrenceOrderPlugin" );


// Webpack Constants
const METADATA = {
	baseUrl: config.url.base,
	ENV: "production",
	isDevServer: false,
	carbonldp: {
		protocol: carbonConfig.protocol,
		domain: carbonConfig.domain,
	}
};


module.exports = webpackMerge( commonConfig( METADATA ), {
	devtool: "source-map",

	mode: "production",

	output: {
		path: helpers.root( "dist" ),
		publicPath: "/",
		filename: "[name].[chunkhash].js",
		sourceMapFilename: "[name].[chunkhash].map",
		chunkFilename: "[id].[chunkhash].chunk.js"
	},

	optimization: {
		minimizer: [
			// Minifies the bundle
			new UglifyJsPlugin( {
				sourceMap: false,
				uglifyOptions: {
					ie8: true,
					output: {
						comments: false,
						beautify: false,
					},
					mangle: {
						keep_fnames: true
					},
					compress: {
						warnings: false,
						conditionals: true,
						unused: true,
						comparisons: true,
						sequences: true,
						dead_code: true,
						evaluate: true,
						if_return: true,
						join_vars: true,
						negate_iife: false
					}
				}
			} ),
		]
	},

	plugins: [

		// Webpack gives IDs to identify your modules. With this plugin, Webpack will analyze and prioritize often used modules assigning them the smallest ids.
		new OccurrenceOrderPlugin(),

		// Stops the build if there is any error.
		new NoEmitOnErrorsPlugin(),

		// Set options for loaders
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
		} ),
	],
} );