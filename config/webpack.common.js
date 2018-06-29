const helpers = require( "./webpack.helpers" );


// carbonldp's projects versions
const workbench = require( "../package.json" );


// Plugins
const SplitChunksPlugin = require( "webpack/lib/optimize/SplitChunksPlugin" );
const ProvidePlugin = require( "webpack/lib/ProvidePlugin" );
const DefinePlugin = require( "webpack/lib/DefinePlugin" );
const CopyWebpackPlugin = require( "copy-webpack-plugin" );
const HtmlWebpackPlugin = require( "html-webpack-plugin" );
const AngularCompilerPlugin = require( "@ngtools/webpack" ).AngularCompilerPlugin;


module.exports = function( metadata ) {
	return {
		entry: {
			app: "./src/main.ts",
			styles: "./src/styles.ts",
			polyfills: "./src/polyfills.ts"
		},
		target: "web",

		resolve: {
			extensions: [ ".ts", ".js" ],
			alias: {
				"app": helpers.root( "src", "app" ),
				"jquery": "jquery/src/jquery",
				"semantic-ui": helpers.root( "src/semantic/dist" ),
			},
			modules: [
				helpers.root( "src" ),
				helpers.root( "node_modules" )
			]
		},

		module: {
			rules: [
				{
					test: /.js$/,
					parser: {
						system: true
					}
				},
				{
					test: /\.ts$/,
					exclude: /node_modules/,
					use: [ "@ngtools/webpack" ]
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
					use: [ "raw-loader", "sass-loader" ],
					include: [ helpers.root( "src/app" ) ]
				},
				{
					test: /\.css$/,
					use: [ "style-loader", "css-loader" ],
					exclude: [ helpers.root( "src/app" ) ]
				},
			]
		},

		plugins: [

			// Sends all imports from node_modules to vendor.ts
			new SplitChunksPlugin( {
				cacheGroups: {
					"vendor": {
						test: /[\\/]node_modules[\\/]/,
						name: 'vendor',
						chunks: 'all',
						enforce: true
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
				{
					from: "src/assets",
					to: "assets",
					toType: "dir",
				}
			] ),

			// Webpack inject scripts and links for us with the HtmlWebpackPlugin and also
			// defines the order of the chunks: polyfills -> vendor -> app
			new HtmlWebpackPlugin( {
				filename: "index.html",
				template: "src/index.html",
				chunks: [ "polyfills", "vendor", "styles", "app" ],
				chunksSortMode: "manual",
				metadata: metadata
			} ),

			// Plugins that defines the following object when using process.SOMETHING
			new DefinePlugin( {
				"ENV": JSON.stringify( metadata.ENV ),
				"process.env": {
					"baseUrl": JSON.stringify( metadata.baseUrl ),
					"ENV": JSON.stringify( metadata.ENV ),
					"NODE_ENV": JSON.stringify( metadata.ENV ),
					"carbonldp": {
						"protocol": JSON.stringify( metadata.carbonldp.protocol ),
						"domain": JSON.stringify( metadata.carbonldp.domain ),
					},
					"PACKAGES": {
						"carbonldp-workbench": JSON.stringify( workbench.version ),
					},
				}
			} ),

			// The instructions for the Typescript transpiler
			new AngularCompilerPlugin( {
				tsConfigPath: helpers.root( "tsconfig.json" ),
				entryModule: helpers.root( "src/app/app.module#AppModule" ),
				mainPath: helpers.root( "src/main.ts" ),
				sourceMap: true,
				skipCodeGeneration: true,
			} ),
		],
	}
};