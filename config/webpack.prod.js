var webpack = require( "webpack" );
var webpackMerge = require( "webpack-merge" );
var ExtractTextPlugin = require( "extract-text-webpack-plugin" );
var commonConfig = require( "./webpack.common.js" );
var helpers = require( "./webpack.helpers" );

const ENV = process.env.NODE_ENV = process.env.ENV = "production";

module.exports = webpackMerge( commonConfig, {
	devtool: "source-map",

	output: {
		path: helpers.root( "dist" ),
		publicPath: "/",
		filename: "[name].[hash].js",
		chunkFilename: "[id].[hash].chunk.js"
	},

	htmlLoader: {
		minimize: false // workaround for ng2
	},

	plugins: [
		new webpack.NoErrorsPlugin(), // Stops the build if there is any error.
		new webpack.optimize.DedupePlugin(), // Detects identical (and nearly identical) files and removes them from the output.
		new webpack.optimize.UglifyJsPlugin( { // Minifies the bundles. https://github.com/angular/angular/issues/10618
			mangle: {
				keep_fnames: true
			}
		} ),
		new ExtractTextPlugin( "[name].[hash].css" ), // Extracts embedded css as external files, adding cache-busting hash to the filename.
		new webpack.DefinePlugin( { // Defines environment variables that we can reference within our application.
			"process.env": {
				"ENV": JSON.stringify( ENV )
			}
		} )
	]
} );