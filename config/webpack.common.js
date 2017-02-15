const webpack = require( "webpack" );
const CommonsChunkPlugin = require( "webpack/lib/optimize/CommonsChunkPlugin" );
const HtmlWebpackPlugin = require( "html-webpack-plugin" );
const helpers = require( "./webpack.helpers" );
const CopyWebpackPlugin = require( "copy-webpack-plugin" );
const ContextReplacementPlugin = require( "webpack/lib/ContextReplacementPlugin" );
const HtmlElementsWebpackPlugin = require( "html-elements-webpack-plugin" );
const headImports = require( "./head.config" );

const HMR = helpers.hasProcessFlag( "hot" );
const AOT = helpers.hasNpmFlag( "aot" );
const METADATA = {
	isDevServer: helpers.isWebpackDevServer()
};


module.exports = function( options ) {
	isProd = options.env === "production";
	return {
		entry: {
			"polyfills": "./src/polyfills.ts",
			"vendor": "./src/vendor.ts",
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
					test: /\.ts$/,
					use: [ "awesome-typescript-loader", "angular2-template-loader", "angular-router-loader" ]
				},
				{
					test: /\.html$/,
					use: "html-loader",
					exclude: [ helpers.root( "src/index.html" ) ]
				},
				{
					test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
					use: "file-loader?name=assets/[name].[hash].[ext]"
				},
				// {
				// 	test: /\.css$/,
				// 	include: helpers.root( 'src', 'app' ),
				// 	use: ExtractTextPlugin.extract( { fallback: "raw-loader", use: [ "style-loader", "css-loader" ] } )
				// },
				// {
				// 	test: /\.css$/,
				// 	exclude: helpers.root( 'src', 'app' ),
				// 	use: "raw-loader?sourceMap"
				// },
				{
					test: /\.s?css$/,
					use: [ "raw-loader", "sass-loader" ]
				},
			]
		},

		plugins: [

			// Workaround for angular/angular#11580
			new webpack.ContextReplacementPlugin(
				// The (\\|\/) piece accounts for path separators in *nix and Windows
				/angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
				helpers.root( "./src" ), // location of your src
				{} // a map of your routes
			),

			// It identifies the hierarchy among three chunks: app -> vendor -> polyfills
			new CommonsChunkPlugin( {
				name: [ "app", "vendor", "polyfills" ]
			} ),

			// Provide global variables
			new webpack.ProvidePlugin( {
				$: "jquery",
				jQuery: "jquery",
				jquery: "jquery"
			} ),

			// Copy assets into assets
			new CopyWebpackPlugin( [
				{ from: "src/assets", to: "assets" },
			] ),

			// Inject styles headers when creating index file
			new HtmlElementsWebpackPlugin( {
				headTags: headImports
			} ),

			// Webpack inject scripts and links for us with the HtmlWebpackPlugin
			new HtmlWebpackPlugin( {
				filename: "index.html",
				template: "src/index.html",
				chunksSortMode: "dependency",
				metadata: METADATA
			} ),
		],
	};
};