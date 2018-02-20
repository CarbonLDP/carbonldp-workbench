const helpers = require( "./webpack.helpers" );
const headImports = require( "./head.config" );

// Plugins
const CommonsChunkPlugin = require( "webpack/lib/optimize/CommonsChunkPlugin" );
const ProvidePlugin = require( "webpack/lib/ProvidePlugin" );
const CopyWebpackPlugin = require( "copy-webpack-plugin" );
const HtmlElementsWebpackPlugin = require( "html-elements-webpack-plugin" );


module.exports = function( options ) {
	isProd = options.env === "production";
	return {
		entry: {
			"polyfills": "./src/polyfills.ts",
			"app": "./src/main.ts"
		},

		resolve: {
			extensions: [ ".ts", ".js" ],
			alias: {
				"app": helpers.root( "src", "app" ),
				"jquery": "jquery/src/jquery",
				"semantic-ui": helpers.root( "src/semantic/dist" ),
			},
			modules: [ helpers.root( "node_modules" ) ]
		},

		module: {
			rules: [
				{
					test: /\.html$/,
					use: "html-loader",
					exclude: [ helpers.root( "src/index.html" ) ]
				},
				{
					test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
					use: "file-loader?name=assets/[name].[hash].[ext]"
				},
				{
					test: /\.s?css$/,
					use: [ "raw-loader", "sass-loader" ]
				},
			]
		},

		plugins: [

			// It identifies the hierarchy among three chunks: app -> vendor -> polyfills
			new CommonsChunkPlugin( {
				name: [ "app", "polyfills" ]
			} ),

			// Provide global variables
			new ProvidePlugin( {
				$: "jquery",
				jQuery: "jquery",
				jquery: "jquery"
			} ),

			// Copy assets into assets
			new CopyWebpackPlugin( [
				{ from: "src/assets", to: "assets" },
				{ from: "src/semantic", to: "semantic" },
			] ),

			// Inject styles headers when creating index file
			new HtmlElementsWebpackPlugin( {
				headTags: headImports,
			} ),

		],
	};
};