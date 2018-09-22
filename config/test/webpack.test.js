const webpack = require( "webpack" );
const commonConfig = require( "../webpack.common.js" );
const helpers = require( "../webpack.helpers" );
const config = require( "../dev/dev.config.json" );
const carbonConfig = config.carbon;
const webpackMerge = require( "webpack-merge" );
const HtmlWebpackPlugin = require( "html-webpack-plugin" );
const headImports = require( "../head.config" );

// carbonldp's projects versions
const workbench = require( "../../package.json" );


// Plugins
const DefinePlugin = require( "webpack/lib/DefinePlugin" );
const CommonsChunkPlugin = require( "webpack/lib/optimize/CommonsChunkPlugin" );
const ProvidePlugin = require( "webpack/lib/ProvidePlugin" );
const CopyWebpackPlugin = require( "copy-webpack-plugin" );
const HtmlElementsWebpackPlugin = require( "html-elements-webpack-plugin" );


// Webpack Constants
const ENV = process.env.ENV = process.env.NODE_ENV = 'testing';
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
	carbondlp: {
		protocol: carbonConfig.protocol,
		domain: carbonConfig.domain,
	}
} );

module.exports = function( options ) {
	return {
		devtool: "inline-source-map",

		resolve: {
			extensions: [ ".ts", ".js" ],
			alias: {
				"app": helpers.root( "src", "app" ),
				"jquery": "jquery/src/jquery",
				"semantic": helpers.root( "src/semantic" ),
				"semantic-ui": helpers.root( "src/semantic/dist" ),
			},
			modules: [ helpers.root( "node_modules" ) ]
		},

		module: {
			rules: [
				{
					test: /\.ts$/,
					use: [
						"awesome-typescript-loader",
						"angular2-template-loader"
					]
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
				{
					test: /\.s?css$/,
					include: helpers.root( "src/app" ),
					use: [ "raw-loader", "sass-loader" ]
				},
				{
					test: /\.s?css$/,
					exclude: helpers.root( "src/app" ),
					use: [ "style-loader", "css-loader", "sass-loader" ]
				},
			]
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
					"carbonldp": {
						"protocol": JSON.stringify( carbonConfig.protocol ),
						"domain": JSON.stringify( carbonConfig.domain ),
					},
					"PACKAGES": {
						"carbonldp-workbench": JSON.stringify( workbench.version ),
					}
				}
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

			// Webpack inject scripts and links for us with the HtmlWebpackPlugin
			new HtmlWebpackPlugin( {
				filename: "index.html",
				template: "src/index.html",
				chunksSortMode: "dependency",
				metadata: METADATA
			} )
		]
	}
};